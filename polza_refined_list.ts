import { AIModel } from './src/types';

export const POLZA_MODELS: AIModel[] = [

    // ── Grok ──
    { id: 'x-ai/grok-4.1-fast', name: 'xAI: Grok 4.1 Fast', category: 'Grok', subCategory: 'fast', desc: 'Оптимизирована для агентных задач. Высокая скорость и продвинутое логическое рассуждение.', isActual: true, pricing: { prompt: '17,42 ₽', completion: '43,55 ₽' }, capabilities: {"text": true, "image": true, "file": false, "audio": false, "video": false} },
    { id: 'x-ai/grok-4', name: 'xAI: Grok 4', category: 'Grok', subCategory: 'advanced', desc: 'Предназначена для продвинутых рассуждений и анализа больших объемов данных.', isActual: true, pricing: { prompt: '261,31 ₽', completion: '1306,53 ₽' }, capabilities: {"text": true, "image": true, "file": false, "audio": false, "video": false} },

    // ── GPT ──
    { id: 'openai/gpt-5.4', name: 'OpenAI: GPT-5.4', category: 'GPT', subCategory: 'advanced', desc: 'Флагманская модель OpenAI с максимальными возможностями рассуждения.', isActual: true, pricing: { prompt: '217,75 ₽', completion: '1306,53 ₽' }, capabilities: {"text": true, "image": true, "file": true, "audio": false, "video": false} },
    { id: 'openai/gpt-5.3-chat', name: 'OpenAI: GPT-5.3 Chat', category: 'GPT', subCategory: 'advanced', desc: 'Оптимизирована для сложных диалогов и точного следования инструкциям.', isActual: true, pricing: { prompt: '152,43 ₽', completion: '1219,43 ₽' }, capabilities: {"text": true, "image": true, "file": true, "audio": false, "video": false} },
    { id: 'openai/gpt-5-nano', name: 'OpenAI: GPT-5 Nano', category: 'GPT', subCategory: 'fast', desc: 'Предназначена для быстрой генерации кода и текстов. Низкая задержка.', isActual: true, pricing: { prompt: '4,36 ₽', completion: '34,84 ₽' }, capabilities: {"text": true, "image": true, "file": true, "audio": false, "video": false} },
    { id: 'openai/o4-mini-deep-research', name: 'OpenAI: o4 Mini Deep Research', category: 'GPT', subCategory: 'fast', desc: 'Оптимизирована для глубокого исследования и анализа больших объемов данных.', isActual: true, pricing: { prompt: '174,2 ₽', completion: '696,82 ₽' }, capabilities: {"text": true, "image": true, "file": true, "audio": false, "video": false} },

    // ── Gemini ──
    { id: 'google/gemini-3.1-pro-preview', name: 'Google: Gemini 3.1 Pro Preview', category: 'Gemini', subCategory: 'advanced', desc: 'Мощная мультимодальная модель с огромным контекстным окном.', isActual: true, pricing: { prompt: '174,2 ₽', completion: '1045,22 ₽' }, capabilities: {"text": true, "image": true, "file": true, "audio": true, "video": true} },
    { id: 'google/gemini-3.1-flash-lite-preview', name: 'Google: Gemini 3.1 Flash Lite Preview', category: 'Gemini', subCategory: 'fast', desc: 'Быстрая и экономичная модель для простых задач.', isActual: true, pricing: { prompt: '21,78 ₽', completion: '130,65 ₽' }, capabilities: {"text": true, "image": true, "file": true, "audio": true, "video": true} },

    // ── Claude ──
    { id: 'anthropic/claude-sonnet-4.6', name: 'Anthropic: Claude Sonnet 4.6', category: 'Claude', subCategory: 'advanced', desc: 'Высокая скорость, большой контекст и отличное понимание нюансов.', isActual: true, pricing: { prompt: '261,31 ₽', completion: '1306,53 ₽' }, capabilities: {"text": true, "image": true, "file": true, "audio": false, "video": false} },
    { id: 'anthropic/claude-haiku-4.5', name: 'Anthropic: Claude Haiku 4.5', category: 'Claude', subCategory: 'fast', desc: 'Самая быстрая и эффективная модель в линейке Anthropic.', isActual: true, pricing: { prompt: '87,1 ₽', completion: '435,51 ₽' }, capabilities: {"text": true, "image": true, "file": false, "audio": false, "video": false} },
    { id: 'anthropic/claude-3.5-haiku', name: 'Anthropic: Claude 3.5 Haiku', category: 'Claude', subCategory: 'fast', desc: 'Отличный баланс скорости и качества для повседневных задач.', isActual: true, pricing: { prompt: '69,68 ₽', completion: '348,41 ₽' }, capabilities: {"text": true, "image": true, "file": false, "audio": false, "video": false} },

    // ── GLM ──
    { id: 'z-ai/glm-5', name: 'Z.AI: GLM 5', category: 'GLM', subCategory: 'advanced', desc: 'Новое поколение моделей GLM с улучшенным рассуждением.', isActual: true, pricing: { prompt: '32,75 ₽', completion: '126,37 ₽' }, capabilities: {"text": true, "image": false, "file": false, "audio": false, "video": false} },
    { id: 'z-ai/glm-4.7-flash', name: 'Z.AI: GLM 4.7 Flash', category: 'GLM', subCategory: 'fast', desc: 'Оптимизирована для скорости и работы в реальном времени.', isActual: true, pricing: { prompt: '6,1 ₽', completion: '34,84 ₽' }, capabilities: {"text": true, "image": false, "file": false, "audio": false, "video": false} },

];
