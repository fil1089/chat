import { API_URLS } from './apiConfig';
import type { AIModel } from '../types';

export const POLZA_MODELS: AIModel[] = [
    // ── OpenAI ──
    { id: 'openai/gpt-4', name: 'GPT-4', category: 'GPT', desc: 'Классическая модель GPT-4 для сложных логических задач.' },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', category: 'GPT', desc: 'Версия GPT-4 с расширенным контекстом и улучшенной скоростью.' },
    { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', category: 'GPT', desc: 'Классическая быстрая модель для простых запросов.' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', category: 'GPT', desc: 'Флагманская мультимодальная модель OpenAI.', isActual: true },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', category: 'GPT', desc: 'Компактная и быстрая версия GPT-4o.', isActual: true },
    { id: 'openai/o3-mini', name: 'o3-mini', category: 'GPT', desc: 'Новейшая модель рассуждения для STEM и кодинга.', isActual: true },
    { id: 'openai/o1-preview', name: 'o1-preview', category: 'GPT', desc: 'Модель с глубоким рассуждением для сложных задач.' },
    { id: 'openai/o1-mini', name: 'o1-mini', category: 'GPT', desc: 'Компактная модель рассуждения.' },

    // ── Google ──
    { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', category: 'Gemini', desc: 'Самая быстрая мультимодальная модель от Google.', isActual: true },
    { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', category: 'Gemini', desc: 'Мощная модель для широкого спектра задач.' },
    { id: 'google/gemini-1.5-flash', name: 'Gemini 1.5 Flash', category: 'Gemini', desc: 'Легкая и быстрая модель Gemini.' },

    // ── Anthropic ──
    { id: 'anthropic/claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', category: 'Claude', desc: 'Новейшая модель Anthropic с режимом рассуждения.', isActual: true },
    { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', category: 'Claude', desc: 'Лидер в кодинге и следовании сложным инструкциям.', isActual: true },
    { id: 'anthropic/claude-3-5-haiku', name: 'Claude 3.5 Haiku', category: 'Claude', desc: 'Высокая скорость при отличном качестве.', isActual: true },
    { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', category: 'Claude', desc: 'Флагманская модель для глубокого анализа.' },

    // ── DeepSeek ──
    { id: 'deepseek/deepseek-reasoner', name: 'DeepSeek R1', category: 'DeepSeek', desc: 'Модель рассуждения DeepSeek (Reasoning).', isActual: true },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', category: 'DeepSeek', desc: 'Универсальная эффективная модель V3.', isActual: true },

    // ── GLM ──
    { id: 'zhipu/glm-4-plus', name: 'GLM-4 Plus', category: 'GLM', desc: 'Продвинутая модель GLM от Zhipu.', isActual: true },

    // ── X.AI ──
    { id: 'x-ai/grok-2', name: 'Grok 2', category: 'Grok', desc: 'Модель от xAI с доступом к данным в реальном времени.', isActual: true },
    { id: 'x-ai/grok-2-vision', name: 'Grok 2 Vision', category: 'Grok', desc: 'Мультимодальная версия Grok 2.', isActual: true }
];

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
    onUsage?: (usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number; cost_rub?: number }) => void;
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

        // Prepend system prompt if provided
        let systemPrompt = '';
        if (systemInstructions) systemPrompt += systemInstructions + '\n\n';
        if (fileContents?.length > 0) {
            systemPrompt += 'Загруженные файлы:\n';
            fileContents.forEach((f) => {
                systemPrompt += `--- ${f.name} ---\n${f.content || ''}\n\n`;
            });
        }

        if (systemPrompt.trim()) {
            modifiedMessages.unshift({
                role: 'system',
                content: systemPrompt.trim()
            });
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

        if (enableReasoning) {
            body.reasoning = {
                effort: "medium"
            };
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
            throw new Error(`Ошибка Polza API: ${response.status} ${response.statusText} - ${errorText}`);
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
                    try {
                        const jsonStr = trimmedLine.slice(6);
                        const data = JSON.parse(jsonStr);

                        // Handle usage statistics if present
                        if (data.usage?.prompt_tokens && onUsage) {
                            onUsage(data.usage);
                        }

                        // Handle reasoning chunks
                        const reasoning = data.choices && (data.choices[0]?.delta?.reasoning || data.choices[0]?.delta?.reasoning_content);
                        if (reasoning && onStatus) {
                            onStatus({ type: 'reasoning', message: reasoning });
                        }

                        // Handle citations/annotations
                        const annotations = data.choices && data.choices[0]?.delta?.annotations;
                        if (annotations && annotations.length > 0 && onAnnotations) {
                            onAnnotations(annotations);
                            if (onStatus) {
                                onStatus({ type: 'search', message: 'Поиск...' });
                            }
                        }

                        // Collect text content
                        const content = data.choices && data.choices[0]?.delta?.content;
                        if (content) {
                            fullContent += content;
                            onUpdate(fullContent);
                        }
                    } catch (e) {
                        // Ignore incomplete JSON chunks, common in SSE streaming
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
            const error = await response.json();
            throw new Error(error.error?.message || error.message || 'Ошибка генерации изображения Polza API');
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
