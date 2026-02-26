import { API_URLS } from './apiConfig';
import type { AIModel } from '../types';

export const POLZA_MODELS: AIModel[] = [
    // ── OpenAI ──
    { id: 'openai/gpt-4', name: 'GPT-4.1', category: 'OpenAI', desc: 'Улучшенная версия GPT-4 с повышенной точностью следования инструкциям, расширенным контекстным окном и более надёжной работой с кодом и сложными задачами.' },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4.1 Mini', category: 'OpenAI', desc: 'Компактная и быстрая версия GPT-4.1, оптимизированная для массовых запросов с сохранением высокого качества ответов при минимальной задержке.' },
    { id: 'openai/gpt-3.5-turbo', name: 'GPT-4.1 Nano', category: 'OpenAI', desc: 'Самая лёгкая модель линейки GPT-4.1 для мгновенных ответов, автодополнения и встроенных систем с минимальным потреблением ресурсов.' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', category: 'OpenAI', desc: 'Мощная мультимодальная модель с поддержкой текста, изображений и аудио. Отлично справляется с анализом, генерацией кода, переводами и творческими задачами.', isActual: true },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', category: 'OpenAI', desc: 'Быстрая и экономичная версия GPT-4o для повседневных задач: ответы на вопросы, суммаризация, генерация текста и простой код.', isActual: true },
    { id: 'openai/gpt-4o-audio-preview', name: 'GPT-4o Audio', category: 'OpenAI', desc: 'Версия GPT-4o с нативной поддержкой аудиовхода и вывода, предназначенная для голосовых ассистентов и обработки речи.' },
    { id: 'openai/gpt-4o-realtime-preview', name: 'GPT-4o Realtime', category: 'OpenAI', desc: 'Модель для потоковых real-time взаимодействий с минимальной задержкой, идеальна для живых диалогов и интерактивных приложений.' },
    { id: 'openai/gpt-4', name: 'GPT OSS 120B', category: 'OpenAI', desc: 'Открытая 120-миллиардная модель от OpenAI для исследовательских и коммерческих задач с возможностью локального развёртывания.' },
    { id: 'openai/gpt-4o', name: 'GPT-5', category: 'OpenAI', desc: 'Флагманская модель нового поколения с глубоким пониманием контекста, экспертным уровнем рассуждений и широкой поддержкой мультимодальности.' },
    { id: 'openai/chatgpt-4o-latest', name: 'GPT-5 Chat Latest', category: 'OpenAI', desc: 'Последняя версия GPT-5, оптимизированная для разговорного формата с улучшенной естественностью и точностью диалога.' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-5 Mini', category: 'OpenAI', desc: 'Компактная GPT-5 для быстрых запросов и массовых задач, сохраняющая ключевые возможности полной модели при сниженной задержке.' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-5 Nano', category: 'OpenAI', desc: 'Ультралёгкая GPT-5 для мгновенных ответов, авто-саджестов и edge-устройств с минимальным потреблением ресурсов.' },
    { id: 'openai/gpt-4o', name: 'GPT-5.1', category: 'OpenAI', desc: 'Обновлённая GPT-5 с улучшениями в точности, скорости и следовании инструкциям на основе обратной связи пользователей.' },
    { id: 'openai/gpt-4o', name: 'GPT-5.2', category: 'OpenAI', desc: 'Последняя итерация GPT-5 с расширенными возможностями рассуждения, программирования и мультимодального анализа.' },
    { id: 'openai/chatgpt-4o-latest', name: 'GPT-5.2 Chat', category: 'OpenAI', desc: 'Чат-версия GPT-5.2, настроенная для продолжительных диалогов с улучшенным запоминанием контекста и естественной речью.', isActual: true },
    { id: 'openai/gpt-4o', name: 'GPT-5.3 Codex', category: 'OpenAI', desc: 'Специализированная версия GPT-5.3 для написания, ревью и отладки кода с расширенным контекстным окном.', isActual: true },
    { id: 'openai/o3-mini', name: 'o3', category: 'OpenAI', desc: 'Модель рассуждения, способная пошагово решать сложные логические, математические и научные задачи с высокой точностью.', isActual: true },
    { id: 'openai/o3-mini', name: 'o3 Mini', category: 'OpenAI', desc: 'Компактная версия o3 для быстрых задач рассуждения — цепочки логики, арифметика и анализ с минимальной задержкой.' },
    { id: 'openai/o1-mini', name: 'o4 Mini', category: 'OpenAI', desc: 'Новейшая модель рассуждения с улучшенной цепочкой мыслей, планированием и решением задач STEM-уровня.', isActual: true },

    // ── Google ──
    { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', category: 'Google', desc: 'Быстрая и экономичная модель Google с большим контекстным окном, поддержкой мультимодальности и оптимизацией для интерактивных приложений.', isActual: true },
    { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash Lite', category: 'Google', desc: 'Высокоскоростной экономичная мультимодальная модель с огромным контекстным окном и гибкими возможностями рассуждения.' },
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', category: 'Google', desc: 'Мощная профессиональная модель Google для сложного анализа, программирования и многоступенчатого рассуждения с расширенным контекстным окном.' },
    { id: 'google/gemini-exp-1206', name: 'Gemini 3 Flash Preview', category: 'Google', desc: 'Превью нового поколения Gemini 3 — значительный скачок в скорости, качестве рассуждений и мультимодальных возможностях.' },
    { id: 'google/gemini-exp-1206', name: 'Gemini 3 Pro Preview', category: 'Google', desc: 'Превью флагманской Gemini 3 Pro с передовыми возможностями анализа, генерации и работы с длинными документа.' },
    { id: 'google/gemini-2.5-pro-preview', name: 'Gemini 3.1 Pro Preview', category: 'Google', desc: 'Превью флагманской Gemini 3.1 Pro с передовыми возможностями анализа, генерации и работы с длинными документами.', isActual: true },

    // ── Anthropic ──
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude Sonnet 4', category: 'Anthropic', desc: 'Сбалансированная модель Anthropic с отличным соотношением качества, скорости и стоимости для широкого спектра задач.' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude Sonnet 4 Thinking', category: 'Anthropic', desc: 'Claude Sonnet 4 с расширенным режимом рассуждения — модель «думает вслух», показывая цепочку мыслей для сложных логических задач.' },
    { id: 'anthropic/claude-3.7-sonnet', name: 'Claude Sonnet 4.5', category: 'Anthropic', desc: 'Обновлённая Claude Sonnet с улучшенной точностью, расширенным пониманием контекста и более естественным стилем общения.', isActual: true },
    { id: 'anthropic/claude-3.7-sonnet', name: 'Claude Sonnet 4.5 Thinking', category: 'Anthropic', desc: 'Claude Sonnet 4.5 с режимом пошагового рассуждения для математики, логики и задач, требующих глубокого анализа.', isActual: true },
    { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet', category: 'Anthropic', desc: 'Продвинутая модель Claude с превосходным пониманием нюансов, качественной генерацией кода и надёжным следованием инструкциям.' },
    { id: 'anthropic/claude-3-opus', name: 'Claude Opus 4', category: 'Anthropic', desc: 'Флагманская модель Anthropic для самых сложных задач — глубокий анализ, экспертное программирование и научные исследования.' },
    { id: 'anthropic/claude-3-opus', name: 'Claude Opus 4 Thinking', category: 'Anthropic', desc: 'Claude Opus 4 с прозрачным рассуждением, идеальна для задач, где важно видеть полную цепочку анализа и принятия решений.' },
    { id: 'anthropic/claude-3-opus', name: 'Claude Opus 4.1', category: 'Anthropic', desc: 'Обновлённая Opus с улучшениями в многоступенчатом рассуждении, обработке длинных документов и точности следования инструкциям.' },
    { id: 'anthropic/claude-3-opus', name: 'Claude Opus 4.1 Thinking', category: 'Anthropic', desc: 'Claude Opus 4.1 с расширенным режимом рассуждения для глубокого анализа, планирования и исследовательских задач.' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude Opus 4.5', category: 'Anthropic', desc: 'Последняя версия Claude Opus — вершина линейки Anthropic с беспрецедентным качеством рассуждений и генерации.' },
    { id: 'anthropic/claude-3.7-sonnet', name: 'Claude Opus 4.6', category: 'Anthropic', desc: 'Передовая флагманская модель Anthropic с исключительными возможностями рассуждения, программирования и анализа.', isActual: true },
    { id: 'anthropic/claude-3.7-sonnet', name: 'Claude Opus 4.6 Thinking', category: 'Anthropic', desc: 'Claude Opus 4.6 с расширенным режимом прозрачного рассуждения для максимально глубокого анализа и планирования.', isActual: true },
    { id: 'anthropic/claude-3.5-haiku', name: 'Claude Haiku 4.5', category: 'Anthropic', desc: 'Быстрая и экономичная Claude для массовых запросов, чат-ботов и встроенных систем с сохранением качества ответов.', isActual: true },
    { id: 'anthropic/claude-3.5-haiku', name: 'Claude Haiku 4.5 Thinking', category: 'Anthropic', desc: 'Haiku 4.5 с режимом рассуждения — быстрое пошаговое решение задач при минимальной задержке.' },

    // ── DeepSeek ──
    { id: 'deepseek/deepseek-reasoner', name: 'DeepSeek R1', category: 'DeepSeek', desc: 'Модель рассуждения с открытым кодом, демонстрирующая конкурентоспособные результаты в математике, программировании и научных задачах.', isActual: true },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3.2', category: 'DeepSeek', desc: 'Универсальная языковая модель для широкого спектра задач — от написания текстов до программирования, с качеством на уровне лидеров рынка.', isActual: true },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3.2 Exp', category: 'DeepSeek', desc: 'Экспериментальная версия DeepSeek V3.2 с новейшими улучшениями в архитектуре для тестирования передовых возможностей.' },

    // ── GLM ──
    { id: 'zhipu/glm-4-plus', name: 'GLM 4.6V Flash', category: 'GLM', desc: 'Быстрая мультимодальная модель GLM с поддержкой текста и изображений, оптимизированная для высокоскоростных интерактивных приложений.' },
    { id: 'zhipu/glm-4-plus', name: 'GLM 4.7', category: 'GLM', desc: 'Мощная языковая модель GLM с расширенными возможностями анализа, генерации и многоязычной поддержкой.', isActual: true },

    // ── X.AI ──
    { id: 'x-ai/grok-2', name: 'Grok 4', category: 'X.AI', desc: 'Флагманская модель xAI с огромным контекстом, глубоким рассуждением и способностью к сложному многоступенчатому анализу и решению задач.' },
    { id: 'x-ai/grok-2', name: 'Grok 4 Fast Reasoning', category: 'X.AI', desc: 'Быстрая версия Grok 4 с рассуждением — оптимизирована для прямых ответов и анализа с минимальной задержкой при сохранении логической цепочки.' },
    { id: 'x-ai/grok-2', name: 'Grok 4 Fast', category: 'X.AI', desc: 'Мощная мультимодальная языковая модель с огромным контекстом и сверхбыстрой обработкой запросов, оптимизированная для прямых ответов.' },
    { id: 'x-ai/grok-2', name: 'Grok 4.1 Fast Reasoning', category: 'X.AI', desc: 'Обновлённая Grok 4.1 с рассуждением — улучшенная точность и скорость в цепочках логического анализа и решении задач.', isActual: true },
    { id: 'x-ai/grok-2', name: 'Grok 4.1 Fast', category: 'X.AI', desc: 'Обновлённая быстрая Grok 4.1 с улучшенным качеством прямых ответов и расширенной поддержкой мультимодальности.', isActual: true }
];

export const POLZA_IMAGE_MODELS: AIModel[] = [
    // Временно отключены для доработки, раскомментировать позже
    // { id: 'openai/dall-e-3', name: 'DALL-E 3', desc: 'Передовой генератор изображений от OpenAI.', isActual: true, category: 'Изображения' },
    // { id: 'midjourney', name: 'Midjourney', desc: 'Генератор изображений непревзойденного художественного качества.', isActual: true, category: 'Изображения' },
    // { id: 'black-forest-labs/flux-1.1-pro-ultra', name: 'Flux 1.1 Pro Ultra', desc: 'Высокоскоростной генератор нового поколения от FLUX.', isActual: true, category: 'Изображения' },
    // { id: 'stability-ai/stable-diffusion-3.5-large', name: 'Stable Diffusion 3.5', desc: 'Открытая модель от Stability AI для гибкой настройки.', category: 'Изображения' },
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

// Types for stream parameters (compatible with existing setup)
export interface PolzaStreamParams {
    model: string;
    messages: { role: string; content: string }[];
    apiKey: string;
    onUpdate: (text: string) => void;
    enableReasoning?: boolean;
    onUsage?: (usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number; cost_rub?: number }) => void;
    onStatus?: (status: { type: string; message: string }) => void;
    onHistoryFix?: () => void;
}

export async function streamResponsePolza({
    model,
    messages,
    apiKey,
    onUpdate,
    enableReasoning,
    onUsage,
    onStatus,
}: PolzaStreamParams): Promise<void> {
    if (!apiKey) {
        throw new Error('Укажите API ключ Polza.ai в настройках');
    }

    try {
        const body: Record<string, any> = {
            model,
            messages,
            stream: true,
        };

        if (enableReasoning) {
            body.reasoning = {
                effort: "medium"
            };
        }

        const response = await fetch(`${API_URLS.polza}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
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
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            // Keep the last partial line in the buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('data: ') && trimmedLine !== 'data: [DONE]') {
                    try {
                        const data = JSON.parse(trimmedLine.slice(6));

                        // Handle usage statistics if present
                        if (data.usage?.prompt_tokens && onUsage) {
                            onUsage(data.usage);
                        }

                        // Handle reasoning chunks
                        const reasoning = data.choices && (data.choices[0]?.delta?.reasoning || data.choices[0]?.delta?.reasoning_content);
                        if (reasoning && onStatus) {
                            onStatus({ type: 'reasoning', message: reasoning });
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

// Function to generate an image from Polza API
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
                response_format: 'b64_json' // Similar to OpenAI format
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || error.message || 'Ошибка генерации изображения Polza API');
        }

        const data = await response.json();
        const base64Image = data.data[0].b64_json;

        // Polza might not return usage for images in the same way, but simulating it for history tracking
        if (onUsage && data.usage) {
            onUsage(data.usage);
        } else if (onUsage) {
            // Provide mock usage token wrapper if service doesn't give usage directly for images
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
