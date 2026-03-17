import { AIModel } from '../types';

export const POLZA_MODELS: AIModel[] = [

    // ── Claude ──
    { 
        id: 'anthropic/claude-sonnet-4.6', 
        name: 'Anthropic: Claude Sonnet 4.6', 
        category: 'Claude', 
        subCategory: 'advanced', 
        desc: 'Высокая скорость, большой контекст и отличное понимание нюансов.', 
        isActual: true, 
        pricing: { 
            prompt: '261,31 ₽/1M', 
            completion: '1 306,53 ₽/1M',
            search: '871,02 ₽/1K',
            cacheRead: '26,13 ₽/1M',
            cacheWrite: '326,63 ₽/1M'
        }, 
        specs: {
            context: '1 000 000',
            tokens: '128 000'
        },
        capabilities: {"text": true, "image": true, "file": true, "audio": false, "video": false} 
    },
    { 
        id: 'anthropic/claude-haiku-4.5', 
        name: 'Anthropic: Claude Haiku 4.5', 
        category: 'Claude', 
        subCategory: 'fast', 
        desc: 'Самая быстрая и эффективная модель в линейке Anthropic.', 
        isActual: true, 
        pricing: { 
            prompt: '87,1 ₽/1M', 
            completion: '435,51 ₽/1M',
            search: '871,02 ₽/1K',
            cacheRead: '8,71 ₽/1M',
            cacheWrite: '108,88 ₽/1M'
        }, 
        specs: {
            context: '200 000',
            tokens: '64 000'
        },
        capabilities: {"text": true, "image": true, "file": false, "audio": false, "video": false} 
    },
    { 
        id: 'anthropic/claude-3.5-haiku', 
        name: 'Anthropic: Claude 3.5 Haiku', 
        category: 'Claude', 
        subCategory: 'fast', 
        desc: 'Отличный баланс скорости и качества для повседневных задач.', 
        isActual: true, 
        pricing: { 
            prompt: '69,68 ₽/1M', 
            completion: '348,41 ₽/1M',
            search: '871,02 ₽/1K',
            cacheRead: '6,97 ₽/1M',
            cacheWrite: '87,1 ₽/1M'
        }, 
        specs: {
            context: '200 000',
            tokens: '8 192'
        },
        capabilities: {"text": true, "image": true, "file": false, "audio": false, "video": false} 
    },

    // ── Gemini ──
    { 
        id: 'google/gemini-3.1-pro-preview', 
        name: 'Google: Gemini 3.1 Pro Preview', 
        category: 'Gemini', 
        subCategory: 'advanced', 
        desc: 'Мощная мультимодальная модель с огромным контекстным окном.', 
        isActual: true, 
        pricing: { 
            prompt: '174,2 ₽/1M', 
            completion: '1 045,22 ₽/1M',
            image: '174,2 ₽/1 img',
            reasoning: '1 045,22 ₽/1M',
            cacheRead: '17,42 ₽/1M',
            cacheWrite: '32,66 ₽/1M'
        }, 
        specs: {
            context: '1 048 576',
            tokens: '65 536'
        },
        capabilities: {"text": true, "image": true, "file": true, "audio": true, "video": true} 
    },
    { 
        id: 'google/gemini-3.1-flash-lite-preview', 
        name: 'Google: Gemini 3.1 Flash Lite Preview', 
        category: 'Gemini', 
        subCategory: 'fast', 
        desc: 'Быстрая и экономичная модель для простых задач.', 
        isActual: true, 
        pricing: { 
            prompt: '21,78 ₽/1M', 
            completion: '130,65 ₽/1M',
            image: '21,78 ₽/1 img',
            reasoning: '130,65 ₽/1M',
            cacheRead: '2,18 ₽/1M',
            cacheWrite: '7,26 ₽/1M'
        }, 
        specs: {
            context: '1 048 576',
            tokens: '65 536'
        },
        capabilities: {"text": true, "image": true, "file": true, "audio": true, "video": true} 
    },

    // ── GPT ──
    { 
        id: 'openai/gpt-5.4', 
        name: 'OpenAI: GPT-5.4', 
        category: 'GPT', 
        subCategory: 'advanced', 
        desc: 'Флагманская модель OpenAI с максимальными возможностями рассуждения.', 
        isActual: true, 
        pricing: { 
            prompt: '217,75 ₽/1M', 
            completion: '1 306,53 ₽/1M',
            search: '871,02 ₽/1K',
            cacheRead: '21,78 ₽/1M'
        }, 
        specs: {
            context: '1 050 000',
            tokens: '128 000'
        },
        capabilities: {"text": true, "image": true, "file": true, "audio": false, "video": false} 
    },
    { 
        id: 'openai/gpt-5.3-chat', 
        name: 'OpenAI: GPT-5.3 Chat', 
        category: 'GPT', 
        subCategory: 'advanced', 
        desc: 'Оптимизирована для сложных диалогов и точного следования инструкциям.', 
        isActual: true, 
        pricing: { 
            prompt: '152,43 ₽/1M', 
            completion: '1 219,43 ₽/1M',
            search: '8 710,19 ₽/1K'
        }, 
        specs: {
            context: '128 000',
            tokens: '16 384'
        },
        capabilities: {"text": true, "image": true, "file": true, "audio": false, "video": false} 
    },
    { 
        id: 'openai/gpt-5-nano', 
        name: 'OpenAI: GPT-5 Nano', 
        category: 'GPT', 
        subCategory: 'fast', 
        desc: 'Предназначена для быстрой генерации кода и текстов. Низкая задержка.', 
        isActual: true, 
        pricing: { 
            prompt: '4,36 ₽/1M', 
            completion: '34,84 ₽/1M',
            search: '871,02 ₽/1K',
            cacheRead: '0,87 ₽/1M'
        }, 
        specs: {
            context: '400 000'
        },
        capabilities: {"text": true, "image": true, "file": true, "audio": false, "video": false} 
    },
    { 
        id: 'openai/o4-mini-deep-research', 
        name: 'OpenAI: o4 Mini Deep Research', 
        category: 'GPT', 
        subCategory: 'fast', 
        desc: 'Оптимизирована для глубокого исследования и анализа больших объемов данных.', 
        isActual: true, 
        pricing: { 
            prompt: '174,2 ₽/1M', 
            completion: '696,82 ₽/1M',
            search: '871,02 ₽/1K',
            cacheRead: '43,55 ₽/1M'
        }, 
        specs: {
            context: '200 000',
            tokens: '100 000'
        },
        capabilities: {"text": true, "image": true, "file": true, "audio": false, "video": false} 
    },

    // ── Grok ──
    { 
        id: 'x-ai/grok-4.1-fast', 
        name: 'xAI: Grok 4.1 Fast', 
        category: 'Grok', 
        subCategory: 'fast', 
        desc: 'Оптимизирована для агентных задач. Высокая скорость и продвинутое логическое рассуждение.', 
        isActual: true, 
        pricing: { 
            prompt: '17,42 ₽/1M', 
            completion: '43,55 ₽/1M',
            search: '435,51 ₽/1K',
            cacheRead: '4,36 ₽/1M'
        }, 
        specs: {
            context: '2 000 000',
            tokens: '30 000'
        },
        capabilities: {"text": true, "image": true, "file": false, "audio": false, "video": false} 
    },
    { 
        id: 'x-ai/grok-4', 
        name: 'xAI: Grok 4', 
        category: 'Grok', 
        subCategory: 'advanced', 
        desc: 'Предназначена для продвинутых рассуждений и анализа больших объемов данных.', 
        isActual: true, 
        pricing: { 
            prompt: '261,31 ₽/1M', 
            completion: '1 306,53 ₽/1M',
            search: '435,51 ₽/1K',
            cacheRead: '65,33 ₽/1M'
        }, 
        specs: {
            context: '256 000'
        },
        capabilities: {"text": true, "image": true, "file": false, "audio": false, "video": false} 
    },

    // ── GLM ──
    { 
        id: 'z-ai/glm-5', 
        name: 'Z.AI: GLM 5', 
        category: 'GLM', 
        subCategory: 'advanced', 
        desc: 'Новое поколение моделей GLM с улучшенным рассуждением.', 
        isActual: true, 
        pricing: { 
            prompt: '32,75 ₽/1M', 
            completion: '126,37 ₽/1M' 
        }, 
        capabilities: {"text": true, "image": false, "file": false, "audio": false, "video": false} 
    },
    { 
        id: 'z-ai/glm-4.7-flash', 
        name: 'Z.AI: GLM 4.7 Flash', 
        category: 'GLM', 
        subCategory: 'fast', 
        desc: 'Оптимизирована для скорости и работы в реальном времени.', 
        isActual: true, 
        pricing: { 
            prompt: '6,1 ₽/1M', 
            completion: '34,84 ₽/1M',
            cacheRead: '0,87 ₽/1M'
        }, 
        specs: {
            context: '200 000',
            tokens: '131 072'
        },
        capabilities: {"text": true, "image": false, "file": false, "audio": false, "video": false} 
    },

];
