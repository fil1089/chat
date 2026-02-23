// NeuroAPI Service — OpenAI-compatible API
// Endpoint: POST https://neuroapi.host/v1/chat/completions
// SSE streaming with Bearer auth
import { API_URLS } from './apiConfig';
import type { AIModel, Message, SpaceFile, StreamCallbacks, StatusEvent } from '../types';

// ===== Available Models =====
export const MODELS: AIModel[] = [
    // ── OpenAI ──
    { id: 'gpt-4.1', name: 'GPT-4.1', category: 'OpenAI', desc: 'Улучшенная GPT-4' },
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', category: 'OpenAI', desc: 'Быстрая GPT-4.1' },
    { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', category: 'OpenAI', desc: 'Самая быстрая' },
    { id: 'gpt-4o', name: 'GPT-4o', category: 'OpenAI', desc: 'Мощная мультимодальная' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', category: 'OpenAI', desc: 'Быстрая и экономная' },
    { id: 'gpt-4o-audio-preview', name: 'GPT-4o Audio', category: 'OpenAI', desc: 'Аудио возможности' },
    { id: 'gpt-4o-realtime-preview', name: 'GPT-4o Realtime', category: 'OpenAI', desc: 'Реалтайм превью' },
    { id: 'gpt-oss-120b', name: 'GPT OSS 120B', category: 'OpenAI', desc: 'Открытая 120B' },
    { id: 'gpt-5', name: 'GPT-5', category: 'OpenAI', desc: 'Новейшая GPT-5' },
    { id: 'gpt-5-chat-latest', name: 'GPT-5 Chat Latest', category: 'OpenAI', desc: 'GPT-5 для чата' },
    { id: 'gpt-5-mini', name: 'GPT-5 Mini', category: 'OpenAI', desc: 'Быстрая GPT-5' },
    { id: 'gpt-5-nano', name: 'GPT-5 Nano', category: 'OpenAI', desc: 'Лёгкая GPT-5' },
    { id: 'gpt-5.1', name: 'GPT-5.1', category: 'OpenAI', desc: 'Обновлённая GPT-5' },
    { id: 'gpt-5.2', name: 'GPT-5.2', category: 'OpenAI', desc: 'Последняя GPT-5.2' },
    { id: 'gpt-5.2-chat', name: 'GPT-5.2 Chat', category: 'OpenAI', desc: 'GPT-5.2 для чата' },
    { id: 'o3', name: 'o3', category: 'OpenAI', desc: 'Рассуждение' },
    { id: 'o3-mini', name: 'o3 Mini', category: 'OpenAI', desc: 'Компактное рассуждение' },
    { id: 'o4-mini', name: 'o4 Mini', category: 'OpenAI', desc: 'Новейшее рассуждение' },
    { id: 'gpt-image-1', name: 'GPT Image 1', category: 'OpenAI', desc: 'Генерация изображений' },
    { id: 'text-embedding-3-large', name: 'Embedding 3 Large', category: 'OpenAI', desc: 'Эмбеддинги (большая)' },
    { id: 'text-embedding-3-small', name: 'Embedding 3 Small', category: 'OpenAI', desc: 'Эмбеддинги (малая)' },
    { id: 'tts', name: 'TTS', category: 'OpenAI', desc: 'Синтез речи' },
    { id: 'whisper', name: 'Whisper', category: 'OpenAI', desc: 'Распознавание речи' },

    // ── Google ──
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', category: 'Google', desc: 'Быстрая Gemini' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', category: 'Google', desc: 'Лёгкая Gemini' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', category: 'Google', desc: 'Мощная Gemini' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', category: 'Google', desc: 'Превью Gemini 3' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', category: 'Google', desc: 'Превью Gemini 3 Pro' },
    { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', category: 'Google', desc: 'Генерация изображений' },

    // ── Anthropic ──
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', category: 'Anthropic', desc: 'Баланс скорости и качества' },
    { id: 'claude-sonnet-4-20250514-thinking', name: 'Claude Sonnet 4 Thinking', category: 'Anthropic', desc: 'С рассуждением' },
    { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', category: 'Anthropic', desc: 'Обновлённая Sonnet' },
    { id: 'claude-sonnet-4-5-20250929-thinking', name: 'Claude Sonnet 4.5 Thinking', category: 'Anthropic', desc: 'С рассуждением' },
    { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', category: 'Anthropic', desc: 'Продвинутая Sonnet' },
    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', category: 'Anthropic', desc: 'Мощная Claude' },
    { id: 'claude-opus-4-20250514-thinking', name: 'Claude Opus 4 Thinking', category: 'Anthropic', desc: 'С рассуждением' },
    { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1', category: 'Anthropic', desc: 'Обновлённая Opus' },
    { id: 'claude-opus-4-1-20250805-thinking', name: 'Claude Opus 4.1 Thinking', category: 'Anthropic', desc: 'С рассуждением' },
    { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', category: 'Anthropic', desc: 'Последняя Opus' },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', category: 'Anthropic', desc: 'Быстрая Claude' },
    { id: 'claude-haiku-4-5-thinking', name: 'Claude Haiku 4.5 Thinking', category: 'Anthropic', desc: 'Быстрая с рассуждением' },

    // ── DeepSeek ──
    { id: 'deepseek-r1', name: 'DeepSeek R1', category: 'DeepSeek', desc: 'С рассуждением' },
    { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', category: 'DeepSeek', desc: 'Универсальная' },
    { id: 'deepseek-v3.2-exp', name: 'DeepSeek V3.2 Exp', category: 'DeepSeek', desc: 'Экспериментальная' },

    // ── GLM ──
    { id: 'glm-4.6v-flash', name: 'GLM 4.6V Flash', category: 'GLM', desc: 'Быстрая мультимодальная' },
    { id: 'glm-4.7', name: 'GLM 4.7', category: 'GLM', desc: 'Мощная GLM' },

    // ── X.AI ──
    { id: 'grok-4', name: 'Grok 4', category: 'X.AI', desc: 'Мощная xAI' },
    { id: 'grok-4-fast-reasoning', name: 'Grok 4 Fast Reasoning', category: 'X.AI', desc: 'Быстрая с рассуждением' },
    { id: 'grok-4-fast-non-reasoning', name: 'Grok 4 Fast', category: 'X.AI', desc: 'Быстрая xAI' },
    { id: 'grok-4.1-fast-reasoning', name: 'Grok 4.1 Fast Reasoning', category: 'X.AI', desc: 'Обновлённая с рассуждением' },
    { id: 'grok-4.1-fast-non-reasoning', name: 'Grok 4.1 Fast', category: 'X.AI', desc: 'Обновлённая быстрая' },

    // ── You.com ──
    { id: 'you-research', name: 'You Research', category: 'You.com', desc: 'Advanced AI Agent with web search iteration' },
];

// Group models by category
export function getModelsByCategory(): Record<string, AIModel[]> {
    const groups: Record<string, AIModel[]> = {};
    MODELS.forEach((m) => {
        if (!groups[m.category]) groups[m.category] = [];
        groups[m.category].push(m);
    });
    return groups;
}

const NON_CHAT_IDS = new Set([
    'gpt-image-1', 'tts', 'whisper',
    'text-embedding-3-small', 'text-embedding-3-large',
    'gemini-2.5-flash-image',
    'you-search', 'you-research',
]);

export function getChatModels(): AIModel[] {
    return MODELS.filter((m) => !NON_CHAT_IDS.has(m.id));
}

export function getChatModelsByCategory(): Record<string, AIModel[]> {
    const groups: Record<string, AIModel[]> = {};
    getChatModels().forEach((m) => {
        if (!groups[m.category]) groups[m.category] = [];
        groups[m.category].push(m);
    });
    return groups;
}

export function getGroupedChatModels(): Record<string, Record<string, AIModel[]>> {
    const categories = getChatModelsByCategory();
    const grouped: Record<string, Record<string, AIModel[]>> = {};

    Object.entries(categories).forEach(([category, models]) => {
        const families: Record<string, AIModel[]> = {};
        models.forEach((m) => {
            let family = 'Other';
            const parts = m.name.split(' ');
            if (m.name.startsWith('GPT-4o')) family = 'GPT-4o';
            else if (m.name.startsWith('GPT-4.1')) family = 'GPT-4.1';
            else if (m.name.startsWith('GPT-5')) family = 'GPT-5';
            else if (m.name.startsWith('o3')) family = 'o3';
            else if (m.name.startsWith('o4')) family = 'o4';
            else if (m.name.startsWith('Gemini 2.5')) family = 'Gemini 2.5';
            else if (m.name.startsWith('Gemini 3')) family = 'Gemini 3';
            else if (m.name.startsWith('Claude 3.7')) family = 'Claude 3.7';
            else if (m.name.startsWith('Claude Sonnet 4')) family = 'Claude Sonnet 4';
            else if (m.name.startsWith('Claude Opus 4')) family = 'Claude Opus 4';
            else if (m.name.startsWith('Claude Haiku 4')) family = 'Claude Haiku 4';
            else if (m.name.startsWith('DeepSeek V3')) family = 'DeepSeek V3';
            else if (m.name.startsWith('DeepSeek R1')) family = 'DeepSeek R1';
            else if (m.name.startsWith('Grok 4')) family = 'Grok 4';
            else if (m.id.startsWith('you-')) family = 'You.com';
            else if (parts.length >= 2) {
                family = parts.slice(0, 2).join(' ');
            } else {
                family = parts[0];
            }

            if (!families[family]) families[family] = [];
            families[family].push(m);
        });
        grouped[category] = families;
    });

    return grouped;
}

// ===== Format Messages =====
interface FormattedMessage {
    role: string;
    content: string;
}

function formatMessages(messages: Message[], systemInstructions: string, fileContents: SpaceFile[]): FormattedMessage[] {
    const formatted: FormattedMessage[] = [];

    let systemPrompt = '';
    if (systemInstructions) systemPrompt += systemInstructions + '\n\n';
    if (fileContents?.length > 0) {
        systemPrompt += 'Загруженные файлы:\n';
        fileContents.forEach((f) => {
            systemPrompt += `--- ${f.name} ---\n${f.content}\n\n`;
        });
    }
    if (systemPrompt) {
        formatted.push({ role: 'system', content: systemPrompt.trim() });
    }

    messages.forEach((msg) => {
        formatted.push({ role: msg.role, content: msg.content });
    });

    return formatted;
}

// ===== Stream NeuroAPI (OpenAI-compatible) =====
interface NeuroStreamParams {
    apiKey: string;
    model: string;
    requestBody: Record<string, unknown>;
    controller: AbortController;
    onDelta?: (delta: string) => void;
    onDone?: () => void;
    onError?: (error: string) => void;
}

async function streamNeuroResponse({
    apiKey,
    model,
    requestBody,
    controller,
    onDelta,
    onDone,
    onError,
}: NeuroStreamParams) {
    try {
        const response = await fetch(`${API_URLS.neuro}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
        });

        console.group('%c[NeuroAPI] RESPONSE', 'color: #fff176; font-weight: bold');
        console.log('Status:', response.status, response.statusText);
        console.groupEnd();

        if (!response.ok) {
            const errorText = await response.text();
            let errorMsg = `Ошибка API: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMsg = errorJson.error?.message || errorJson.detail || errorMsg;
            } catch { /* ignore */ }
            onError?.(errorMsg);
            return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith(': PING') || !line.startsWith('data: ')) continue;
                const data = line.slice(6).trim();
                if (!data || data === '[DONE]') continue;

                try {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices?.[0]?.delta?.content;
                    if (delta) onDelta?.(delta);
                } catch { /* skip */ }
            }
        }
        onDone?.();
    } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') onError?.(err.message);
    }
}

// ===== Stream You.com (Advanced Agent / Search) =====
interface YouStreamParams {
    apiKey: string;
    model: string;
    messages: Message[];
    controller: AbortController;
    onDelta?: (delta: string) => void;
    onStatus?: (status: StatusEvent) => void;
    onDone?: () => void;
    onError?: (error: string) => void;
}

async function streamYouResponse({
    apiKey,
    model,
    messages,
    controller,
    onDelta,
    onStatus,
    onDone,
    onError,
}: YouStreamParams) {
    if (model === 'you-search') {
        try {
            onStatus?.({ type: 'status', message: 'Поиск в интернете...' });
            const lastMsg = messages[messages.length - 1];
            const query = lastMsg?.displayContent || lastMsg?.content || '';
            const response = await fetch(`${API_URLS.youSearch}/v1/search?query=${encodeURIComponent(query)}&count=10`, {
                headers: { 'X-API-Key': apiKey },
                signal: controller.signal,
            });
            if (!response.ok) throw new Error(`Search error: ${response.status}`);
            const data = await response.json();
            const resultsText = data.results?.web?.map((r: { title: string; url: string; description: string }) => `**${r.title}**\n${r.url}\n${r.description}\n`).join('\n') || 'No results found.';
            onDelta?.(resultsText);
            onDone?.();
        } catch (err: unknown) {
            console.error('[youApi] Search error:', err);
            if (err instanceof Error && err.name !== 'AbortError') onError?.(err.message);
        }
        return;
    }

    // Advanced Agent
    try {
        console.log('[youApi] Starting Advanced Agent run...');
        onStatus?.({ type: 'status', message: 'Выполняю исследование...' });
        const lastMsg = messages[messages.length - 1]?.content || '';

        const response = await fetch(`${API_URLS.youAgent}/v1/agents/runs`, {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                agent: 'advanced',
                input: lastMsg,
                stream: true
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            console.error('[youApi] Agent error response:', response.status, errText);
            throw new Error(`Agent error: ${response.status} ${errText}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let isDoneEvent = false;
        let hasStartedWriting = false;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith(':')) continue;

                if (trimmed === 'data: [DONE]') {
                    console.log('[youApi] Received data: [DONE]');
                    isDoneEvent = true;
                    break;
                }

                if (!trimmed.startsWith('data: ')) continue;

                try {
                    const dataStr = trimmed.slice(6).trim();
                    if (!dataStr) continue;

                    const parsed = JSON.parse(dataStr);
                    console.log('[youApi] Event:', parsed.type, parsed);

                    if (parsed.type === 'response.output_text.delta') {
                        if (!hasStartedWriting) {
                            hasStartedWriting = true;
                            onStatus?.({ type: 'status', message: 'Пишу ответ...' });
                        }
                        onDelta?.(parsed.response.delta);
                    } else if (parsed.type === 'response.thought.delta' || parsed.type === 'response.reasoning.delta') {
                        const delta = parsed.response?.delta || parsed.delta || '';
                        if (delta) onStatus?.({ type: 'thought', message: delta });
                    } else if (parsed.type === 'response.output_item.added') {
                        const it = parsed.item;
                        if (it?.type === 'thought' || it?.type === 'reasoning') {
                            const msg = it.content || it.text || '';
                            if (msg) onStatus?.({ type: 'thought', message: msg });
                        }
                    } else if (parsed.type === 'response.search_queries') {
                        onStatus?.({ type: 'search', message: `🔍 Поиск: ${parsed.queries?.slice(0, 2).join(', ')}${parsed.queries?.length > 2 ? '...' : ''}` });
                    } else if (parsed.type === 'response.status') {
                        onStatus?.({ type: 'status', message: parsed.status + '...' });
                    } else if (parsed.type === 'response.search_results') {
                        const count = parsed.results?.length || 0;
                        onStatus?.({ type: 'status', message: `✅ Найдено источников: ${count}` });
                    } else if (parsed.type === 'response.done') {
                        console.log('[youApi] Received response.done event');
                        isDoneEvent = true;
                    }
                } catch (e) {
                    console.error('[youApi] JSON error:', e, trimmed);
                }
                if (isDoneEvent) break;
            }
            if (isDoneEvent) break;
        }

        // Final process remaining buffer
        if (buffer && buffer.trim().startsWith('data: ')) {
            try {
                const text = buffer.trim().slice(6);
                const parsed = JSON.parse(text);
                if (parsed.type === 'response.output_text.delta') onDelta?.(parsed.response.delta);
            } catch { }
        }

        onDone?.();
    } catch (err: unknown) {
        console.error('[youApi] streamYouResponse error:', err);
        const msg = err instanceof Error ? err.message : String(err);
        onStatus?.({ type: 'status', message: `❌ Ошибка: ${msg}` });
        if (err instanceof Error && err.name !== 'AbortError') onError?.(msg);
    }
}

// ===== Common interface =====
interface StreamResponseParams extends StreamCallbacks {
    apiKey: string;
    youApiKey: string;
    model: string;
    messages?: Message[];
    systemInstructions?: string;
    fileContents?: SpaceFile[];
}

export function streamResponse({
    apiKey,
    youApiKey,
    model,
    messages = [],
    systemInstructions = '',
    fileContents = [],
    onDelta,
    onStatus,
    onDone,
    onError,
}: StreamResponseParams): AbortController {
    const controller = new AbortController();

    if (model.startsWith('you-')) {
        streamYouResponse({
            apiKey: youApiKey,
            model,
            messages,
            controller,
            onDelta,
            onStatus,
            onDone,
            onError,
        });
    } else {
        const formatted = formatMessages(messages, systemInstructions, fileContents);
        const requestBody = { model, messages: formatted, stream: true };
        streamNeuroResponse({
            apiKey,
            model,
            requestBody,
            controller,
            onDelta,
            onDone,
            onError,
        });
    }

    return controller;
}
