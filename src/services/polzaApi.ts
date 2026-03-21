import { API_URLS } from './apiConfig';
import type { AIModel } from '../types';
import { POLZA_MODELS } from './polzaModels';
export { POLZA_MODELS };

export const ALL_POLZA_MODELS_LIST = [...POLZA_MODELS];

export const POLZA_IMAGE_MODELS: AIModel[] = [
    // Временно отключены для доработки, раскомментировать позже
    // { id: 'openai/dall-e-3', name: 'DALL-E 3', desc: 'Передовой генератор изображений от OpenAI.', isActual: true, category: 'Изображения' },
    // { id: 'midjourney', name: 'Midjourney', desc: 'Генератор изображений непревзойденного художественного качества.', isActual: true, category: 'Изображения' },
];

// Combine all for easy search
export const ALL_POLZA_MODELS = [...POLZA_MODELS, ...POLZA_IMAGE_MODELS];

export const getGroupedPolzaModels = () => {
    const groups: Record<string, Record<string, AIModel[]>> = {};

    ALL_POLZA_MODELS.forEach((m) => {
        const cat = m.category;
        const family = m.name.split(' ')[0]; // group by first word for family

        if (!groups[cat]) groups[cat] = {};
        if (!groups[cat][family]) groups[cat][family] = [];

        groups[cat][family].push(m);
    });

    return groups;
};

export const getPolzaModelsByCategory = (): Record<string, AIModel[]> => {
    const groups: Record<string, AIModel[]> = {};
    ALL_POLZA_MODELS.forEach((m) => {
        if (!groups[m.category]) groups[m.category] = [];
        groups[m.category].push(m);
    });
    return groups;
};

// Types for stream parameters (compatible with existing setup)
export interface PolzaStreamParams {
    model: string;
    messages: { role: string; content: string | any[] }[];
    apiKey: string;
    onUpdate: (text: string) => void;
    systemInstructions?: string;
    fileContents?: any[];
    enableReasoning?: boolean;
    enableWebSearch?: boolean;
    onUsage?: (usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number; cost_rub?: number; cached_tokens?: number }) => void;
    onStatus?: (status: { type: string; message: string }) => void;
    onAnnotations?: (annotations: any[]) => void;
    onHistoryFix?: () => void;
    signal?: AbortSignal;
}

export async function streamResponsePolza({
    model,
    messages,
    apiKey,
    onUpdate,
    systemInstructions = '',
    fileContents = [],
    enableReasoning,
    enableWebSearch,
    onUsage,
    onStatus,
    onAnnotations,
    signal,
}: PolzaStreamParams): Promise<void> {
    if (!apiKey) {
        throw new Error('Укажите API ключ Polza.ai в настройках');
    }

    try {
        let modifiedMessages = [...messages];

        // Detect if model is Anthropic/Claude for cache_control
        const isAnthropic = model.toLowerCase().includes('claude') || model.toLowerCase().includes('anthropic');

        // Build system prompt: instructions first (static), then files (static)
        // This order is optimal for prompt caching - static content at the beginning
        let systemPrompt = '';
        if (systemInstructions) systemPrompt += systemInstructions + '\n\n';
        if (fileContents?.length > 0) {
            systemPrompt += 'Загруженные файлы:\n';
            fileContents.forEach((f) => {
                systemPrompt += `--- ${f.name} ---\n${f.content || ''}\n\n`;
            });
        }

        if (systemPrompt.trim()) {
            if (isAnthropic) {
                // For Anthropic: use cache_control to enable prompt caching
                modifiedMessages.unshift({
                    role: 'system',
                    content: [{
                        type: 'text',
                        text: systemPrompt.trim(),
                        cache_control: { type: 'ephemeral' }
                    }]
                });
            } else {
                modifiedMessages.unshift({
                    role: 'system',
                    content: systemPrompt.trim()
                });
            }
        }

        if (enableWebSearch) {
            modifiedMessages.unshift({
                role: 'system',
                content: 'ВАЖНО: При использовании веб-поиска всегда формулируй свой финальный ответ ТОЛЬКО на русском языке. Отвечай максимально лаконично, структурированно и строго по делу. Не используй лишних вводных слов.'
            });
        }

        const body: Record<string, any> = {
            model,
            messages: modifiedMessages,
            stream: true,
        };

        body.reasoning = {
            enabled: !!enableReasoning
        };
        if (enableReasoning) {
            body.reasoning.effort = "medium";
        }

        const plugins: any[] = [];
        if (enableWebSearch) {
            plugins.push({ id: 'web' });
        }

        const hasPdf = messages.some(m => Array.isArray(m.content) && m.content.some((c: any) => c.type === 'file'));
        if (hasPdf) {
            plugins.push({ id: 'file-parser' });
        }

        if (plugins.length > 0) {
            body.plugins = plugins;
        }

        console.log('[Polza API Request]', {
            model,
            messagesCount: messages.length,
            enableReasoning,
            enableWebSearch,
            plugins,
            body
        });

        const response = await fetch(`${API_URLS.polza}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
            signal,
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Ошибка API: ${response.status}`;

            try {
                const errorJson = JSON.parse(errorText);
                const errorDetail = errorJson.error?.message || errorJson.message || errorJson.detail;

                if (errorDetail === 'INSUFFICIENT_BALANCE') {
                    errorMessage = 'Недостаточно средств на балансе. Пожалуйста, пополните счет на polza.ai.';
                } else if (errorDetail === 'UNAUTHORIZED' || response.status === 401) {
                    errorMessage = 'Неверный API ключ. Пожалуйста, проверьте его в настройках.';
                } else if (errorDetail) {
                    errorMessage = `Ошибка Polza API: ${errorDetail}`;
                }
            } catch (e) {
                errorMessage = `Ошибка Polza API: ${response.status} ${response.statusText} - ${errorText.slice(0, 100)}`;
            }

            throw new Error(errorMessage);
        }

        if (!response.body) {
            throw new Error('Ответ не содержит тела (ReadableStream)');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        let buffer = '';

        while (true) {
            let value, done;
            try {
                const result = await reader.read();
                value = result.value;
                done = result.done;
            } catch (readError) {
                console.error('[Polza API Read Error]', readError);
                throw readError;
            }

            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            // Keep the last partial line in the buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('data: ') && trimmedLine !== 'data: [DONE]') {
                    let parsedData: any = null;
                    try {
                        const jsonStr = trimmedLine.slice(6);
                        parsedData = JSON.parse(jsonStr);
                    } catch (e) {
                        // Ignore incomplete JSON chunks, common in SSE streaming
                        continue;
                    }

                    if (parsedData) {
                        console.log('[Polza Chunk]', parsedData);

                        if (parsedData.error) {
                            throw new Error(parsedData.error.message || JSON.stringify(parsedData.error));
                        }

                        // Handle usage statistics if present (including cached tokens)
                        if (parsedData.usage?.prompt_tokens && onUsage) {
                            const cached = parsedData.usage.prompt_tokens_details?.cached_tokens
                                || parsedData.usage.cache_read_input_tokens
                                || parsedData.usage.cached_tokens
                                || 0;
                            onUsage({ ...parsedData.usage, cached_tokens: cached });
                        }

                        // Handle reasoning chunks
                        const reasoning = parsedData.choices && (
                            parsedData.choices[0]?.delta?.reasoning ||
                            parsedData.choices[0]?.delta?.reasoning_content ||
                            parsedData.choices[0]?.delta?.thinking_content
                        );
                        if (reasoning && onStatus) {
                            onStatus({ type: 'reasoning', message: reasoning });
                        }

                        // Handle citations/annotations
                        const annotations = parsedData.choices && parsedData.choices[0]?.delta?.annotations;
                        if (annotations && annotations.length > 0 && onAnnotations) {
                            onAnnotations(annotations);
                            if (onStatus) {
                                onStatus({ type: 'search', message: 'Поиск...' });
                            }
                        }

                        // Collect text content
                        const content = parsedData.choices && parsedData.choices[0]?.delta?.content;
                        if (content) {
                            fullContent += content;
                            onUpdate(fullContent);
                        }
                    }
                } else if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
                    try {
                        const parsedData = JSON.parse(trimmedLine);
                        if (parsedData.error) {
                            throw new Error(parsedData.error.message || JSON.stringify(parsedData.error));
                        }
                    } catch (e) {
                        // Ignore if it's not valid JSON or doesn't have an error
                    }
                }
            }
        }



    } catch (error: any) {
        console.error('[PolzaAPI] Error:', error);
        throw error;
    }
}

export interface PolzaImageParams {
    model: string;
    prompt: string;
    apiKey: string;
    size?: string;
    quality?: string;
    onUsage?: (usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) => void;
}

export async function generateImagePolza({
    model,
    prompt,
    apiKey,
    size = '1024x1024',
    quality = 'high',
    onUsage
}: PolzaImageParams): Promise<string> {
    if (!apiKey) {
        throw new Error('Укажите API ключ Polza.ai в настройках');
    }

    try {
        const response = await fetch(`${API_URLS.polza}/v2/images/generations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                prompt,
                n: 1,
                size,
                quality,
                response_format: 'b64_json'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Ошибка генерации изображения Polza API';

            try {
                const errorJson = JSON.parse(errorText);
                const errorDetail = errorJson.error?.message || errorJson.message || errorJson.detail;

                if (errorDetail === 'INSUFFICIENT_BALANCE') {
                    errorMessage = 'Недостаточно средств на балансе. Пожалуйста, пополните счет на polza.ai.';
                } else if (errorDetail === 'UNAUTHORIZED' || response.status === 401) {
                    errorMessage = 'Неверный API ключ. Пожалуйста, проверьте его в настройках.';
                } else if (errorDetail) {
                    errorMessage = `Ошибка Polza API: ${errorDetail}`;
                }
            } catch (e) {
                errorMessage = `Ошибка Polza API (${response.status}): ${errorText.slice(0, 100)}`;
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        const base64Image = data.data[0].b64_json;

        if (onUsage && data.usage) {
            onUsage(data.usage);
        } else if (onUsage) {
            const qualityMultiplier = quality === 'high' ? 2 : quality === 'medium' ? 1.5 : 1;
            onUsage({ prompt_tokens: 0, completion_tokens: qualityMultiplier, total_tokens: qualityMultiplier });
        }

        return `data:image/jpeg;base64,${base64Image}`;

    } catch (error: any) {
        console.error('[PolzaAPI Image] Error:', error);
        throw error;
    }
}

export async function summarizeChat({
    apiKey,
    model: _originalModel, // ignore original model
    messages,
}: {
    apiKey: string;
    model: string;
    messages: { role: string; content: string }[];
}): Promise<string> {
    if (!apiKey) throw new Error('Укажите API ключ Polza.ai в настройках');

    const summaryPrompt = `Ты — ассистент, который делает краткие саммари диалогов. Проанализируй диалог ниже и создай структурированное саммари. Сохрани:
- Ключевую тему/цель разговора
- Все важные решения и договоренности
- Контекст, который нужен для продолжения разговора
- Важные факты и детали, упомянутые пользователем

Формат: лаконично, структурированно, на языке диалога. Не добавляй ничего от себя.`;

    // Всегда используем openai/gpt-5-nano для саммари: это дешево, быстро и надежно
    const summaryModel = 'openai/gpt-5-nano';

    const systemMessage = {
        role: 'system',
        content: summaryPrompt
    };

    // Убираем старые системные сообщения, чтобы не было ошибки API (многие модели не поддерживают несколько system сообщений)
    const filteredMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${API_URLS.polza}/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: summaryModel,
            messages: [
                systemMessage,
                ...filteredMessages,
            ],
            stream: false,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Ошибка API при создании саммари: ${response.status}`;
        try {
            const err = JSON.parse(errorText);
            errorMessage = err.error?.message || err.message || errorText;
        } catch(e) {}
        throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (data.error) {
        console.error('[Summarize Error]', data.error);
        throw new Error(data.error.message || JSON.stringify(data.error));
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
        console.error('[Summarize Error] Неожиданный ответ API:', data);
        throw new Error('API не вернул текст саммари.');
    }

    return content;
}

export async function checkPolzaBalance(apiKey: string): Promise<string> {
    if (!apiKey) return '0.00';
    try {
        const response = await fetch(`${API_URLS.polza}/v1/balance`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        if (!response.ok) return '0.00';
        const data = await response.json();
        return data.amount || '0.00';
    } catch (e) {
        console.error('Failed to check Polza balance:', e);
        return '0.00';
    }
}
