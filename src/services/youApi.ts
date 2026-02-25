// NeuroAPI Service — OpenAI-compatible API
// Endpoint: POST https://neuroapi.host/v1/chat/completions
// SSE streaming with Bearer auth
import { API_URLS } from './apiConfig';
import type { AIModel, Message, StreamCallbacks, StatusEvent, Attachment } from '../types';

// ===== Model Pricing ($ per 1M tokens) =====
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
        return pricing.fixedRub.toFixed(2);
    }
    const usdCost = (promptTokens * pricing.input + completionTokens * pricing.output) / 1_000_000;
    const rubCost = usdCost * 79; // Fixed exchange rate of NeuroAPI (79 RUB = 1 USD)
    if (rubCost < 0.0001) return '0.0001';
    if (rubCost < 0.1) return rubCost.toFixed(4);
    return rubCost.toFixed(2);
}

// ===== Available Models =====
export const MODELS: AIModel[] = [
    // ── OpenAI ──
    { id: 'gpt-4.1', name: 'GPT-4.1', category: 'OpenAI', desc: 'Улучшенная версия GPT-4 с повышенной точностью следования инструкциям, расширенным контекстным окном и более надёжной работой с кодом и сложными задачами.' },
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', category: 'OpenAI', desc: 'Компактная и быстрая версия GPT-4.1, оптимизированная для массовых запросов с сохранением высокого качества ответов при минимальной задержке.' },
    { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', category: 'OpenAI', desc: 'Самая лёгкая модель линейки GPT-4.1 для мгновенных ответов, автодополнения и встроенных систем с минимальным потреблением ресурсов.' },
    { id: 'gpt-4o', name: 'GPT-4o', category: 'OpenAI', desc: 'Мощная мультимодальная модель с поддержкой текста, изображений и аудио. Отлично справляется с анализом, генерацией кода, переводами и творческими задачами.', isActual: true },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', category: 'OpenAI', desc: 'Быстрая и экономичная версия GPT-4o для повседневных задач: ответы на вопросы, суммаризация, генерация текста и простой код.', isActual: true },
    { id: 'gpt-4o-audio-preview', name: 'GPT-4o Audio', category: 'OpenAI', desc: 'Версия GPT-4o с нативной поддержкой аудиовхода и вывода, предназначенная для голосовых ассистентов и обработки речи.' },
    { id: 'gpt-4o-realtime-preview', name: 'GPT-4o Realtime', category: 'OpenAI', desc: 'Модель для потоковых real-time взаимодействий с минимальной задержкой, идеальна для живых диалогов и интерактивных приложений.' },
    { id: 'gpt-oss-120b', name: 'GPT OSS 120B', category: 'OpenAI', desc: 'Открытая 120-миллиардная модель от OpenAI для исследовательских и коммерческих задач с возможностью локального развёртывания.' },
    { id: 'gpt-5', name: 'GPT-5', category: 'OpenAI', desc: 'Флагманская модель нового поколения с глубоким пониманием контекста, экспертным уровнем рассуждений и широкой поддержкой мультимодальности.' },
    { id: 'gpt-5-chat-latest', name: 'GPT-5 Chat Latest', category: 'OpenAI', desc: 'Последняя версия GPT-5, оптимизированная для разговорного формата с улучшенной естественностью и точностью диалога.' },
    { id: 'gpt-5-mini', name: 'GPT-5 Mini', category: 'OpenAI', desc: 'Компактная GPT-5 для быстрых запросов и массовых задач, сохраняющая ключевые возможности полной модели при сниженной задержке.' },
    { id: 'gpt-5-nano', name: 'GPT-5 Nano', category: 'OpenAI', desc: 'Ультралёгкая GPT-5 для мгновенных ответов, авто-саджестов и edge-устройств с минимальным потреблением ресурсов.' },
    { id: 'gpt-5.1', name: 'GPT-5.1', category: 'OpenAI', desc: 'Обновлённая GPT-5 с улучшениями в точности, скорости и следовании инструкциям на основе обратной связи пользователей.' },
    { id: 'gpt-5.2', name: 'GPT-5.2', category: 'OpenAI', desc: 'Последняя итерация GPT-5 с расширенными возможностями рассуждения, программирования и мультимодального анализа.' },
    { id: 'gpt-5.2-chat', name: 'GPT-5.2 Chat', category: 'OpenAI', desc: 'Чат-версия GPT-5.2, настроенная для продолжительных диалогов с улучшенным запоминанием контекста и естественной речью.', isActual: true },
    { id: 'gpt-5.3-codex', name: 'GPT-5.3 Codex', category: 'OpenAI', desc: 'Специализированная версия GPT-5.3 для написания, ревью и отладки кода с расширенным контекстным окном.', isActual: true },
    { id: 'o3', name: 'o3', category: 'OpenAI', desc: 'Модель рассуждения, способная пошагово решать сложные логические, математические и научные задачи с высокой точностью.', isActual: true },
    { id: 'o3-mini', name: 'o3 Mini', category: 'OpenAI', desc: 'Компактная версия o3 для быстрых задач рассуждения — цепочки логики, арифметика и анализ с минимальной задержкой.' },
    { id: 'o4-mini', name: 'o4 Mini', category: 'OpenAI', desc: 'Новейшая модель рассуждения с улучшенной цепочкой мыслей, планированием и решением задач STEM-уровня.', isActual: true },
    { id: 'gpt-image-1', name: 'GPT Image 1', category: 'OpenAI', desc: 'Модель для генерации и редактирования изображений по текстовому описанию с высоким качеством и детализацией.' },
    { id: 'text-embedding-3-large', name: 'Embedding 3 Large', category: 'OpenAI', desc: 'Большая модель эмбеддингов для точного семантического поиска, кластеризации и сравнения текстов.', isActual: true },
    { id: 'text-embedding-3-small', name: 'Embedding 3 Small', category: 'OpenAI', desc: 'Компактная модель эмбеддингов для быстрого семантического поиска с хорошим соотношением качества и скорости.' },
    { id: 'tts', name: 'TTS', category: 'OpenAI', desc: 'Модель синтеза речи, преобразующая текст в естественную речь с поддержкой нескольких голосов и языков.' },
    { id: 'whisper', name: 'Whisper', category: 'OpenAI', desc: 'Модель распознавания речи, способная транскрибировать аудио на множестве языков с высокой точностью.' },

    // ── Google ──
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', category: 'Google', desc: 'Быстрая и экономичная модель Google с большим контекстным окном, поддержкой мультимодальности и оптимизацией для интерактивных приложений.', isActual: true },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', category: 'Google', desc: 'Высокоскоростная и экономичная мультимодальная модель с огромным контекстным окном и гибкими возможностями рассуждения, предназначенная для real-time приложений, интерактивных систем и обработки длинных сессий.' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', category: 'Google', desc: 'Мощная профессиональная модель Google для сложного анализа, программирования и многоступенчатого рассуждения с расширенным контекстным окном.' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', category: 'Google', desc: 'Превью нового поколения Gemini 3 — значительный скачок в скорости, качестве рассуждений и мультимодальных возможностях.' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', category: 'Google', desc: 'Превью флагманской Gemini 3 Pro с передовыми возможностями анализа, генерации и работы с длинными документами.' },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', category: 'Google', desc: 'Превью флагманской Gemini 3.1 Pro с передовыми возможностями анализа, генерации и работы с длинными документами.', isActual: true },
    { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image Preview', category: 'Google', desc: 'Превью модели на базе Gemini 3 Pro, специализированной для анализа и генерации изображений.', isActual: true },
    { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', category: 'Google', desc: 'Модель генерации и редактирования изображений на базе Gemini 2.5 Flash с поддержкой текстовых описаний и мультимодального ввода.' },

    // ── Anthropic ──
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', category: 'Anthropic', desc: 'Сбалансированная модель Anthropic с отличным соотношением качества, скорости и стоимости для широкого спектра задач — от написания текстов до анализа данных.' },
    { id: 'claude-sonnet-4-20250514-thinking', name: 'Claude Sonnet 4 Thinking', category: 'Anthropic', desc: 'Claude Sonnet 4 с расширенным режимом рассуждения — модель «думает вслух», показывая цепочку мыслей для сложных логических задач.' },
    { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', category: 'Anthropic', desc: 'Обновлённая Claude Sonnet с улучшенной точностью, расширенным пониманием контекста и более естественным стилем общения.', isActual: true },
    { id: 'claude-sonnet-4-5-20250929-thinking', name: 'Claude Sonnet 4.5 Thinking', category: 'Anthropic', desc: 'Claude Sonnet 4.5 с режимом пошагового рассуждения для математики, логики и задач, требующих глубокого анализа.', isActual: true },
    { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', category: 'Anthropic', desc: 'Продвинутая модель Claude с превосходным пониманием нюансов, качественной генерацией кода и надёжным следованием инструкциям.' },
    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', category: 'Anthropic', desc: 'Флагманская модель Anthropic для самых сложных задач — глубокий анализ, экспертное программирование и научные исследования.' },
    { id: 'claude-opus-4-20250514-thinking', name: 'Claude Opus 4 Thinking', category: 'Anthropic', desc: 'Claude Opus 4 с прозрачным рассуждением, идеальна для задач, где важно видеть полную цепочку анализа и принятия решений.' },
    { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1', category: 'Anthropic', desc: 'Обновлённая Opus с улучшениями в многоступенчатом рассуждении, обработке длинных документов и точности следования инструкциям.' },
    { id: 'claude-opus-4-1-20250805-thinking', name: 'Claude Opus 4.1 Thinking', category: 'Anthropic', desc: 'Claude Opus 4.1 с расширенным режимом рассуждения для глубокого анализа, планирования и исследовательских задач.' },
    { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', category: 'Anthropic', desc: 'Последняя версия Claude Opus — вершина линейки Anthropic с беспрецедентным качеством рассуждений и генерации.' },
    { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', category: 'Anthropic', desc: 'Передовая флагманская модель Anthropic с исключительными возможностями рассуждения, программирования и анализа.', isActual: true },
    { id: 'claude-opus-4-6-thinking', name: 'Claude Opus 4.6 Thinking', category: 'Anthropic', desc: 'Claude Opus 4.6 с расширенным режимом прозрачного рассуждения для максимально глубокого анализа и планирования.', isActual: true },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', category: 'Anthropic', desc: 'Быстрая и экономичная Claude для массовых запросов, чат-ботов и встроенных систем с сохранением качества ответов.', isActual: true },
    { id: 'claude-haiku-4-5-thinking', name: 'Claude Haiku 4.5 Thinking', category: 'Anthropic', desc: 'Haiku 4.5 с режимом рассуждения — быстрое пошаговое решение задач при минимальной задержке.' },

    // ── DeepSeek ──
    { id: 'deepseek-r1', name: 'DeepSeek R1', category: 'DeepSeek', desc: 'Модель рассуждения с открытым кодом, демонстрирующая конкурентоспособные результаты в математике, программировании и научных задачах.', isActual: true },
    { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', category: 'DeepSeek', desc: 'Универсальная языковая модель для широкого спектра задач — от написания текстов до программирования, с качеством на уровне лидеров рынка.', isActual: true },
    { id: 'deepseek-v3.2-exp', name: 'DeepSeek V3.2 Exp', category: 'DeepSeek', desc: 'Экспериментальная версия DeepSeek V3.2 с новейшими улучшениями в архитектуре для тестирования передовых возможностей.' },

    // ── GLM ──
    { id: 'glm-4.6v-flash', name: 'GLM 4.6V Flash', category: 'GLM', desc: 'Быстрая мультимодальная модель GLM с поддержкой текста и изображений, оптимизированная для высокоскоростных интерактивных приложений.' },
    { id: 'glm-4.7', name: 'GLM 4.7', category: 'GLM', desc: 'Мощная языковая модель GLM с расширенными возможностями анализа, генерации и многоязычной поддержкой.', isActual: true },

    // ── X.AI ──
    { id: 'grok-4', name: 'Grok 4', category: 'X.AI', desc: 'Флагманская модель xAI с огромным контекстом, глубоким рассуждением и способностью к сложному многоступенчатому анализу и решению задач.' },
    { id: 'grok-4-fast-reasoning', name: 'Grok 4 Fast Reasoning', category: 'X.AI', desc: 'Быстрая версия Grok 4 с рассуждением — оптимизирована для прямых ответов и анализа с минимальной задержкой при сохранении логической цепочки.' },
    { id: 'grok-4-fast-non-reasoning', name: 'Grok 4 Fast', category: 'X.AI', desc: 'Мощная мультимодальная языковая модель с огромным контекстом и сверхбыстрой обработкой запросов, оптимизированная для прямых ответов, поиска информации и масштабных real-time приложений без глубоких рассуждений.' },
    { id: 'grok-4.1-fast-reasoning', name: 'Grok 4.1 Fast Reasoning', category: 'X.AI', desc: 'Обновлённая Grok 4.1 с рассуждением — улучшенная точность и скорость в цепочках логического анализа и решении задач.', isActual: true },
    { id: 'grok-4.1-fast-non-reasoning', name: 'Grok 4.1 Fast', category: 'X.AI', desc: 'Обновлённая быстрая Grok 4.1 с улучшенным качеством прямых ответов и расширенной поддержкой мультимодальности.', isActual: true },

    // ── You.com ──
    { id: 'you-research', name: 'You Research', category: 'You.com', desc: 'Продвинутый ИИ-агент с итеративным поиском в интернете — исследует множество источников, анализирует и синтезирует информацию для глубоких и актуальных ответов.' },
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
        // Check if user message has image attachments
        const fullAttachments: Attachment[] = msg.fullAttachments || [];
        const imageAttachments = fullAttachments.filter(a => a.type === 'image');
        const textAttachments = fullAttachments.filter(a => a.type === 'text');

        if (msg.role === 'user' && imageAttachments.length > 0) {
            // Build multimodal content array
            const contentParts: ContentPart[] = [];

            // Text part: user message + any text file attachments
            let textContent = msg.displayContent || msg.content;
            if (textAttachments.length > 0) {
                textContent += '\n\n' + textAttachments.map(a => `[Файл: ${a.name}]\n${a.content}`).join('\n\n');
            }
            if (textContent.trim()) {
                contentParts.push({ type: 'text', text: textContent });
            }

            // Image parts
            imageAttachments.forEach(a => {
                contentParts.push({
                    type: 'image_url',
                    image_url: { url: a.content } // data:image/...;base64,...
                });
            });

            formatted.push({ role: msg.role, content: contentParts });
        } else {
            formatted.push({ role: msg.role, content: msg.displayContent || msg.content });
        }
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
    onUsage?: (usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) => void;
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
                    if (parsed.usage) onUsage?.(parsed.usage);
                } catch { /* skip */ }
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
    imageSize,
}: {
    apiKey: string;
    model: string;
    messages: Message[];
    controller: AbortController;
    onDelta?: (delta: string) => void;
    onStatus?: (status: StatusEvent) => void;
    onDone?: () => void;
    onError?: (error: string) => void;
    imageSize: string;
}) {
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
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: mimeType });

                let fileName = imageAttachment.name || 'image.png';
                if (!fileName.includes('.')) {
                    fileName += mimeType === 'image/jpeg' ? '.jpg' : '.png';
                }

                formData.append('image', blob, fileName);
            } else {
                throw new Error("Неверный формат прикрепленного изображения");
            }

            formData.append('prompt', prompt);
            formData.append('model', model);
            formData.append('size', imageSize);
            formData.append('response_format', 'b64_json');

            console.log(`[NeuroAPI Image] Edit Request:`, { model, prompt, size: imageSize, hasImage: true });

            response = await fetch(`${API_URLS.neuro}/v1/images/edits`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
                body: formData,
                signal: controller.signal,
            });
        } else {
            const requestBody = {
                model: model,
                prompt: prompt,
                size: imageSize,
                response_format: 'b64_json'
            };

            console.log(`[NeuroAPI Image] Request:`, requestBody);

            response = await fetch(`${API_URLS.neuro}/v1/images/generations`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            let errorMsg = `Ошибка API (${response.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMsg = errorJson.error?.message || errorJson.detail || errorMsg;
            } catch { /* ignore */ }
            onError?.(errorMsg);
            return;
        }

        const data = await response.json();
        const base64Data = data.data?.[0]?.b64_json;
        if (base64Data) {
            onDelta?.(base64Data);
        } else {
            onError?.('Сервер не вернул изображение в формате base64.');
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
        onStatus?.({ type: 'status', message: `Ошибка: ${msg}` });
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
    fileContents?: Attachment[];
    imageSize?: string;
    onUsage?: (usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) => void;
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
    onDelta,
    onStatus,
    onUsage,
    onDone,
    onError,
    bypassCache = false,
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
        const requestBody = { model, messages: formatted, stream: true, stream_options: { include_usage: true } };

        // Check cache (skip if bypassing)
        const cacheKey = JSON.stringify({ model, messages: formatted });
        if (!bypassCache) {
            const cached = responseCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
                console.log('[Cache] HIT — returning cached response');
                onDelta?.(cached.content);
                if (cached.usage) onUsage?.(cached.usage);
                onDone?.();
                return controller;
            }
        } else {
            // Invalidate stale cache for this key so regeneration is fresh
            responseCache.delete(cacheKey);
            console.log('[Cache] BYPASS — regenerating fresh response');
        }

        // Track full response for caching
        let fullContent = '';
        let capturedUsage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null = null;

        const isImageModel = model.includes('image-preview') || model.includes('image');

        if (isImageModel) {
            generateImageNeuro({
                apiKey,
                model,
                messages,
                controller,
                imageSize,
                onDelta: (delta) => {
                    fullContent += delta;
                    onDelta?.(delta);
                },
                onStatus,
                onDone: () => {
                    if (fullContent) {
                        responseCache.set(cacheKey, {
                            content: fullContent,
                            usage: capturedUsage,
                            timestamp: Date.now(),
                        });
                        if (responseCache.size > MAX_CACHE_SIZE) {
                            const firstKey = responseCache.keys().next().value;
                            if (firstKey) responseCache.delete(firstKey);
                        }
                    }
                    onDone?.();
                },
                onError
            });
        } else {
            streamNeuroResponse({
                apiKey,
                model,
                requestBody,
                controller,
                onDelta: (delta) => {
                    fullContent += delta;
                    onDelta?.(delta);
                },
                onUsage: (usage) => {
                    capturedUsage = usage;
                    onUsage?.(usage);
                },
                onDone: () => {
                    // Cache the response
                    if (fullContent) {
                        responseCache.set(cacheKey, {
                            content: fullContent,
                            usage: capturedUsage,
                            timestamp: Date.now(),
                        });
                        // Limit cache size
                        if (responseCache.size > MAX_CACHE_SIZE) {
                            const firstKey = responseCache.keys().next().value;
                            if (firstKey) responseCache.delete(firstKey);
                        }
                    }
                    onDone?.();
                },
                onError,
            });
        }
    }

    return controller;
}

// ===== Response Cache =====
interface CachedResponse {
    content: string;
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null;
    timestamp: number;
}

const responseCache = new Map<string, CachedResponse>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;
