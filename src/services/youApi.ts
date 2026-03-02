// NeuroAPI Service — OpenAI-compatible API
// Endpoint: POST https://neuroapi.host/v1/chat/completions
// SSE streaming with Bearer auth
import { API_URLS } from './apiConfig';
import type { AIModel, Message, StreamCallbacks, StatusEvent, Attachment } from '../types';

// ===== Model Pricing ($ per 1M tokens) =====
// Using simplified factual naming in keys where possible, or keeping IDs
const MODEL_PRICING: Record<string, { input: number; output: number; fixedRub?: number }> = {
    'gpt-4o': { input: 2.5, output: 10 },
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
    'gpt-4o-audio-preview': { input: 5, output: 15 },
    'gpt-4o-realtime-preview': { input: 5, output: 20 },
    'gpt-4.1': { input: 2, output: 8 },
    'gpt-4.1-mini': { input: 0.4, output: 1.6 },
    'gpt-4.1-nano': { input: 0.1, output: 0.4 },
    'gpt-5': { input: 5, output: 20 },
    'gpt-5-mini': { input: 1, output: 4 },
    'gpt-5-nano': { input: 0.1, output: 0.25 },
    'gpt-5-chat-latest': { input: 5, output: 20 },
    'gpt-5.1': { input: 5, output: 20 },
    'gpt-5.2': { input: 5, output: 20 },
    'gpt-5.2-chat': { input: 5, output: 20 },
    'gpt-5.3-codex': { input: 5, output: 20 },
    'gpt-oss-120b': { input: 3, output: 12 },
    'o3': { input: 10, output: 40 },
    'o3-mini': { input: 1.1, output: 4.4 },
    'o4-mini': { input: 1.1, output: 4.4 },
    'gemini-2.5-flash': { input: 0.15, output: 0.6 },
    'gemini-2.5-flash-lite': { input: 0.075, output: 0.3 },
    'gemini-2.5-pro': { input: 1.25, output: 10 },
    'gemini-3-flash-preview': { input: 0.15, output: 0.6 },
    'gemini-3-pro-preview': { input: 1.25, output: 10 },
    'gemini-3.1-pro-preview': { input: 1.25, output: 10 },
    'gemini-3-pro-image-preview': { input: 1.25, output: 10, fixedRub: 5.08 },
    'claude-sonnet-4-20250514': { input: 3, output: 15 },
    'claude-sonnet-4-20250514-thinking': { input: 3, output: 15 },
    'claude-sonnet-4-5-20250929': { input: 3, output: 15 },
    'claude-sonnet-4-5-20250929-thinking': { input: 3, output: 15 },
    'claude-3-7-sonnet-20250219': { input: 3, output: 15 },
    'claude-opus-4-20250514': { input: 15, output: 75 },
    'claude-opus-4-20250514-thinking': { input: 15, output: 75 },
    'claude-opus-4-1-20250805': { input: 15, output: 75 },
    'claude-opus-4-1-20250805-thinking': { input: 15, output: 75 },
    'claude-opus-4-5-20251101': { input: 15, output: 75 },
    'claude-opus-4-5-20251101-thinking': { input: 15, output: 75 },
    'claude-opus-4-6': { input: 15, output: 75 },
    'claude-opus-4-6-thinking': { input: 15, output: 75 },
    'claude-haiku-4-5-20251001': { input: 0.8, output: 4 },
    'claude-haiku-4-5-thinking': { input: 0.8, output: 4 },
    'deepseek-r1': { input: 0.55, output: 2.19 },
    'deepseek-v3.2': { input: 0.27, output: 1.1 },
    'deepseek-v3.2-exp': { input: 0.27, output: 1.1 },
    'glm-4.6v-flash': { input: 0.2, output: 0.8 },
    'glm-4.7': { input: 0.5, output: 2 },
    'grok-4': { input: 2, output: 10 },
    'grok-4-fast-reasoning': { input: 0.1, output: 0.3 },
    'grok-4-fast-non-reasoning': { input: 0.1, output: 0.3 },
    'grok-4.1-fast-reasoning': { input: 0.1, output: 0.3 },
    'grok-4.1-fast-non-reasoning': { input: 0.1, output: 0.3 },
    'text-embedding-3-large': { input: 0.13, output: 0 },
    'text-embedding-3-small': { input: 0.02, output: 0 },
    'tts': { input: 15, output: 0 },
    'whisper': { input: 0.006, output: 0 },
};

const FALLBACK_PRICING = { input: 1, output: 4 };

export function calcCost(modelId: string, promptTokens: number, completionTokens: number): string {
    const pricing = MODEL_PRICING[modelId] || FALLBACK_PRICING;
    if (pricing.fixedRub !== undefined) {
        const multiplier = completionTokens > 0 ? completionTokens : 1;
        return (pricing.fixedRub * multiplier).toFixed(2);
    }
    const usdCost = (promptTokens * pricing.input + completionTokens * pricing.output) / 1_000_000;
    const rubCost = usdCost * 79; // Fixed exchange rate of NeuroAPI
    if (rubCost < 0.0001) return '0.0001';
    if (rubCost < 0.1) return rubCost.toFixed(4);
    return rubCost.toFixed(2);
}

// ===== Available Models =====
export const MODELS: AIModel[] = [
    // ── OpenAI ──
    { id: 'gpt-4.1', name: 'GPT-4 (Neuro)', category: 'GPT', desc: 'Улучшенная версия GPT-4 с повышенной точностью.' },
    { id: 'gpt-4.1-mini', name: 'GPT-4 Turbo (Neuro)', category: 'GPT', desc: 'Быстрая версия GPT-4.' },
    { id: 'gpt-4o', name: 'GPT-4o', category: 'GPT', desc: 'Флагманская мультимодальная модель OpenAI.', isActual: true },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', category: 'GPT', desc: 'Компактная и быстрая версия GPT-4o.', isActual: true },
    { id: 'gsm8k', name: 'GPT-3.5 Turbo', category: 'GPT', desc: 'Классическая быстрая модель.' },
    { id: 'gpt-5', name: 'GPT-4o Late (Neuro)', category: 'GPT', desc: 'Мощная итерация GPT-4o с улучшенным рассуждением.' },
    { id: 'o3', name: 'o3', category: 'GPT', desc: 'Новейшая модель рассуждения OpenAI.', isActual: true },
    { id: 'o3-mini', name: 'o3-mini', category: 'GPT', desc: 'Компактная модель рассуждения.', isActual: true },
    { id: 'o4-mini', name: 'o1-mini (Neuro)', category: 'GPT', desc: 'Оптимизированная модель рассуждения для математики и кода.', isActual: true },

    // ── Google ──
    { id: 'gemini-2.5-flash', name: 'Gemini 2.0 Flash (Neuro)', category: 'Gemini', desc: 'Сверхбыстрая мультимодальная модель Google.', isActual: true },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.0 Pro (Neuro)', category: 'Gemini', desc: 'Мощная модель Google для сложного анализа.', isActual: true },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 2.1 Pro Exp (Neuro)', category: 'Gemini', desc: 'Экспериментальная мощная версия Gemini.', isActual: true },

    // ── Anthropic ──
    { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', category: 'Claude', desc: 'Новейшая модель Anthropic с режимом рассуждения.', isActual: true },
    { id: 'claude-sonnet-4-20250514', name: 'Claude 3.5 Sonnet (Neuro)', category: 'Claude', desc: 'Признанный лидер в кодинге и логике.' },
    { id: 'claude-opus-4-6', name: 'Claude 3 Opus (Neuro)', category: 'Claude', desc: 'Флагманская модель для глубокого литературного анализа.' },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude 3.5 Haiku (Neuro)', category: 'Claude', desc: 'Самая быстрая модель в линейке Anthropic.', isActual: true },

    // ── DeepSeek ──
    { id: 'deepseek-r1', name: 'DeepSeek R1', category: 'DeepSeek', desc: 'Мощная модель рассуждения с открытым кодом.', isActual: true },
    { id: 'deepseek-v3.2', name: 'DeepSeek V3 (Neuro)', category: 'DeepSeek', desc: 'Универсальная эффективная модель V3.', isActual: true },

    // ── X.AI ──
    { id: 'grok-4', name: 'Grok 2 (Neuro)', category: 'Grok', desc: 'Умная и дерзкая модель от xAI.' },
    { id: 'grok-4.1-fast-reasoning', name: 'Grok 2.1 Fast Reasoning (Neuro)', category: 'Grok', desc: 'Обновленная версия Grok с быстрым рассуждением.', isActual: true },

    // ── You.com ──
    { id: 'you-research', name: 'You Research', category: 'You.com', desc: 'Продвинутый ИИ-агент с итеративным поиском в интернете.' },
];

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
            if (m.name.includes('GPT-4')) family = 'GPT-4';
            else if (m.name.includes('GPT-3.5')) family = 'GPT-3.5';
            else if (m.name.startsWith('o3')) family = 'o3';
            else if (m.name.startsWith('o1')) family = 'o1';
            else if (m.name.includes('Gemini 2')) family = 'Gemini 2';
            else if (m.name.includes('Claude 3.7')) family = 'Claude 3.7';
            else if (m.name.includes('Claude 3.5')) family = 'Claude 3.5';
            else if (m.name.includes('Claude 3 Opus')) family = 'Claude 3 Opus';
            else if (m.name.includes('DeepSeek V3')) family = 'DeepSeek V3';
            else if (m.name.includes('DeepSeek R1')) family = 'DeepSeek R1';
            else if (m.name.includes('Grok 2')) family = 'Grok 2';
            else if (m.id.startsWith('you-')) family = 'You.com';
            else {
                family = m.name.split(' ')[0];
            }

            if (!families[family]) families[family] = [];
            families[family].push(m);
        });
        grouped[category] = families;
    });

    return grouped;
}

// ===== Format Messages =====
type ContentPart =
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } };

interface FormattedMessage {
    role: string;
    content: string | ContentPart[];
}

function formatMessages(messages: Message[], systemInstructions: string, fileContents: Attachment[]): FormattedMessage[] {
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
        const fullAttachments: Attachment[] = msg.fullAttachments || [];
        const imageAttachments = fullAttachments.filter(a => a.type === 'image');
        const textAttachments = fullAttachments.filter(a => a.type === 'text');

        if (msg.role === 'user' && (imageAttachments.length > 0 || textAttachments.length > 0)) {
            const contentParts: ContentPart[] = [];
            let textContent = msg.displayContent || msg.content;

            if (textAttachments.length > 0) {
                // if they are not stripped
                const validText = textAttachments.filter(a => a.content).map(a => `[Файл: ${a.name}]\n${a.content}`).join('\n\n');
                if (validText) textContent += '\n\n' + validText;
            }
            if (textContent.trim()) {
                contentParts.push({ type: 'text', text: textContent });
            }
            imageAttachments.forEach(a => {
                if (a.content) {
                    contentParts.push({ type: 'image_url', image_url: { url: a.content } });
                }
            });
            formatted.push({ role: msg.role, content: contentParts });
        } else {
            formatted.push({ role: msg.role, content: msg.displayContent || msg.content });
        }
    });

    return formatted;
}

// ===== Stream NeuroAPI =====
interface NeuroStreamParams {
    apiKey: string;
    model: string;
    requestBody: Record<string, unknown>;
    controller: AbortController;
    onDelta?: (delta: string) => void;
    onUsage?: (usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number; cost_rub?: number }) => void;
    onDone?: () => void;
    onError?: (error: string) => void;
}

async function streamNeuroResponse({
    apiKey,
    model,
    requestBody,
    controller,
    onDelta,
    onUsage,
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

        if (!response.ok) {
            const errorText = await response.text();
            let errorMsg = `Ошибка API: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMsg = errorJson.error?.message || errorJson.detail || errorMsg;
            } catch { }
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
                    if (parsed.usage) onUsage?.(parsed.usage);
                } catch { }
            }
        }
        onDone?.();
    } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') onError?.(err.message);
    }
}

// ===== Generate Image NeuroAPI =====
async function generateImageNeuro({
    apiKey,
    model,
    messages,
    controller,
    onDelta,
    onStatus,
    onDone,
    onError,
    onUsage,
    imageSize,
    imageQuality,
}: {
    apiKey: string;
    model: string;
    messages: Message[];
    controller: AbortController;
    onDelta?: (delta: string) => void;
    onStatus?: (status: StatusEvent) => void;
    onDone?: () => void;
    onError?: (error: string) => void;
    onUsage?: (usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number; cost_rub?: number }) => void;
    imageSize: string;
    imageQuality: string;
}) {
    let multiplier = 1;
    if (imageQuality === 'medium') multiplier = 1.5;
    if (imageQuality === 'high') multiplier = 2;

    try {
        const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user');
        const prompt = lastUserMessage?.displayContent || lastUserMessage?.content || 'Изображение';
        const imageAttachment = lastUserMessage?.fullAttachments?.find(a => a.type === 'image' || a.mimeType?.startsWith('image/'));

        onStatus?.({ type: 'status', message: imageAttachment ? 'Редактирование изображения...' : 'Генерация изображения...' });
        let response: Response;

        if (imageAttachment) {
            const formData = new FormData();
            const base64Parts = imageAttachment.content.split(',');
            if (base64Parts.length === 2) {
                const mimeType = base64Parts[0].match(/:(.*?);/)?.[1] || 'image/png';
                const b64Data = base64Parts[1];
                const byteCharacters = atob(b64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
                const blob = new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
                let fileName = imageAttachment.name || 'image.png';
                if (!fileName.includes('.')) fileName += mimeType === 'image/jpeg' ? '.jpg' : '.png';
                formData.append('image', blob, fileName);
            } else throw new Error("Неверный формат изображения");

            formData.append('prompt', prompt);
            formData.append('model', model);
            formData.append('size', imageSize);
            formData.append('quality', imageQuality);
            formData.append('response_format', 'b64_json');

            response = await fetch(`${API_URLS.neuro}/v1/images/edits`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${apiKey}` },
                body: formData,
                signal: controller.signal,
            });
        } else {
            response = await fetch(`${API_URLS.neuro}/v1/images/generations`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, prompt, size: imageSize, quality: imageQuality, response_format: 'b64_json' }),
                signal: controller.signal,
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            let errorMsg = `Ошибка API (${response.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMsg = errorJson.error?.message || errorJson.detail || errorMsg;
            } catch { }
            onError?.(errorMsg);
            return;
        }

        const data = await response.json();
        const base64Data = data.data?.[0]?.b64_json;
        if (base64Data) {
            onUsage?.({ prompt_tokens: 0, completion_tokens: multiplier, total_tokens: 0 });
            onDelta?.(base64Data);
        } else onError?.('Сервер не вернул изображение.');

        onDone?.();
    } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') onError?.(err.message);
    }
}

// ===== Stream You.com =====
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
            onStatus?.({ type: 'status', message: 'Поиск...' });
            const query = messages[messages.length - 1]?.content || '';
            const response = await fetch(`${API_URLS.youSearch}/v1/search?query=${encodeURIComponent(query)}&count=10`, {
                headers: { 'X-API-Key': apiKey },
                signal: controller.signal,
            });
            if (!response.ok) throw new Error(`Search error: ${response.status}`);
            const data = await response.json();
            const resultsText = data.results?.web?.map((r: any) => `**${r.title}**\n${r.url}\n${r.description}\n`).join('\n') || 'No results.';
            onDelta?.(resultsText);
            onDone?.();
        } catch (err: any) {
            if (err.name !== 'AbortError') onError?.(err.message);
        }
        return;
    }

    try {
        onStatus?.({ type: 'status', message: 'Исследование...' });
        const lastMsg = messages[messages.length - 1]?.content || '';
        const response = await fetch(`${API_URLS.youAgent}/v1/agents/runs`, {
            method: 'POST',
            headers: { 'X-API-Key': apiKey, 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent: 'advanced', input: lastMsg, stream: true }),
            signal: controller.signal,
        });

        if (!response.ok) throw new Error(`Agent error: ${response.status}`);

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let isDone = false;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;
                if (trimmed === 'data: [DONE]') { isDone = true; break; }
                try {
                    const parsed = JSON.parse(trimmed.slice(6));
                    if (parsed.type === 'response.output_text.delta') onDelta?.(parsed.response.delta);
                    else if (parsed.type === 'response.thought.delta' || parsed.type === 'response.reasoning.delta') onStatus?.({ type: 'thought', message: parsed.delta || parsed.response?.delta || '' });
                } catch { }
            }
            if (isDone) break;
        }
        onDone?.();
    } catch (err: any) {
        if (err.name !== 'AbortError') onError?.(err.message);
    }
}

// ===== Common interface =====
interface StreamResponseParams extends StreamCallbacks {
    apiKey: string;
    youApiKey: string;
    model: string;
    messages?: Message[];
    systemInstructions?: string;
    fileContents?: Attachment[];
    imageSize?: string;
    imageQuality?: string;
    enableReasoning?: boolean;
    onUsage?: (usage: any) => void;
    bypassCache?: boolean;
}

export function streamResponse({
    apiKey,
    youApiKey,
    model,
    messages = [],
    systemInstructions = '',
    fileContents = [],
    imageSize = '1024x1024',
    imageQuality = 'high',
    onDelta,
    onStatus,
    onUsage,
    onDone,
    onError,
    bypassCache = false,
}: StreamResponseParams): AbortController {
    const controller = new AbortController();
    if (model.startsWith('you-')) {
        streamYouResponse({ apiKey: youApiKey, model, messages, controller, onDelta, onStatus, onDone, onError });
    } else {
        const formatted = formatMessages(messages, systemInstructions, fileContents);
        const requestBody = { model, messages: formatted, stream: true, stream_options: { include_usage: true } };
        const cacheKey = JSON.stringify({ model, messages: formatted });
        if (!bypassCache) {
            const cached = responseCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
                onDelta?.(cached.content);
                if (cached.usage) onUsage?.(cached.usage);
                onDone?.();
                return controller;
            }
        }
        let fullContent = '';
        let capturedUsage: any = null;
        const isImage = model.includes('image-preview') || model.includes('image');

        if (isImage) {
            generateImageNeuro({ apiKey, model, messages, controller, imageSize, imageQuality, onDelta: (d) => { fullContent += d; onDelta?.(d); }, onUsage: (u) => { capturedUsage = u; onUsage?.(u); }, onStatus, onDone: () => { if (fullContent) responseCache.set(cacheKey, { content: fullContent, usage: capturedUsage, timestamp: Date.now() }); onDone?.(); }, onError });
        } else {
            streamNeuroResponse({ apiKey, model, requestBody, controller, onDelta: (d) => { fullContent += d; onDelta?.(d); }, onUsage: (u) => { capturedUsage = u; onUsage?.(u); }, onDone: () => { if (fullContent) responseCache.set(cacheKey, { content: fullContent, usage: capturedUsage, timestamp: Date.now() }); onDone?.(); }, onError });
        }
    }
    return controller;
}

const responseCache = new Map<string, { content: string, usage: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;
