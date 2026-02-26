import { API_URLS } from './apiConfig';
import type { AIModel } from '../types';

export const POLZA_MODELS: AIModel[] = [
    // ── Claude ──
    { id: 'anthropic/claude-3-haiku', name: 'Anthropic: Claude 3 Haiku', category: 'Claude', desc: 'Модель Anthropic: Claude 3 Haiku от Anthropic.', isActual: false },
    { id: 'anthropic/claude-3.5-haiku', name: 'Anthropic: Claude 3.5 Haiku', category: 'Claude', desc: 'Модель Anthropic: Claude 3.5 Haiku от Anthropic.', isActual: false },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic: Claude 3.5 Sonnet', category: 'Claude', desc: 'Модель Anthropic: Claude 3.5 Sonnet от Anthropic.', isActual: true },
    { id: 'anthropic/claude-3.7-sonnet', name: 'Anthropic: Claude 3.7 Sonnet', category: 'Claude', desc: 'Модель Anthropic: Claude 3.7 Sonnet от Anthropic.', isActual: true },
    { id: 'anthropic/claude-3.7-sonnet:thinking', name: 'Anthropic: Claude 3.7 Sonnet (thinking)', category: 'Claude', desc: 'Модель Anthropic: Claude 3.7 Sonnet (thinking) от Anthropic.', isActual: true },
    { id: 'anthropic/claude-haiku-4.5', name: 'Anthropic: Claude Haiku 4.5', category: 'Claude', desc: 'Модель Anthropic: Claude Haiku 4.5 от Anthropic.', isActual: false },
    { id: 'anthropic/claude-opus-4', name: 'Anthropic: Claude Opus 4', category: 'Claude', desc: 'Модель Anthropic: Claude Opus 4 от Anthropic.', isActual: false },
    { id: 'anthropic/claude-opus-4.1', name: 'Anthropic: Claude Opus 4.1', category: 'Claude', desc: 'Модель Anthropic: Claude Opus 4.1 от Anthropic.', isActual: false },
    { id: 'anthropic/claude-opus-4.5', name: 'Anthropic: Claude Opus 4.5', category: 'Claude', desc: 'Модель Anthropic: Claude Opus 4.5 от Anthropic.', isActual: false },
    { id: 'anthropic/claude-opus-4.6', name: 'Anthropic: Claude Opus 4.6', category: 'Claude', desc: 'Оптимизирована для кодирования и длительной работы с контентом. Обеспечивает глубокое контекстное понимание и надежность в сложных задачах.', isActual: false },
    { id: 'anthropic/claude-sonnet-4', name: 'Anthropic: Claude Sonnet 4', category: 'Claude', desc: 'Модель Anthropic: Claude Sonnet 4 от Anthropic.', isActual: false },
    { id: 'anthropic/claude-sonnet-4.5', name: 'Anthropic: Claude Sonnet 4.5', category: 'Claude', desc: 'Модель Anthropic: Claude Sonnet 4.5 от Anthropic.', isActual: false },
    { id: 'anthropic/claude-sonnet-4.6', name: 'Anthropic: Claude Sonnet 4.6', category: 'Claude', desc: 'Анализирует и генерирует текст, распознает намерения пользователя. Высокая скорость, большой контекст.', isActual: false },

    // ── DeepSeek ──
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek: DeepSeek V3', category: 'DeepSeek', desc: 'Модель DeepSeek: DeepSeek V3 от DeepSeek.', isActual: true },
    { id: 'deepseek/deepseek-chat-v3-0324', name: 'DeepSeek: DeepSeek V3 0324', category: 'DeepSeek', desc: 'Модель DeepSeek: DeepSeek V3 0324 от DeepSeek.', isActual: true },
    { id: 'deepseek/deepseek-chat-v3.1', name: 'DeepSeek: DeepSeek V3.1', category: 'DeepSeek', desc: 'Модель DeepSeek: DeepSeek V3.1 от DeepSeek.', isActual: true },
    { id: 'deepseek/deepseek-v3.1-terminus', name: 'DeepSeek: DeepSeek V3.1 Terminus', category: 'DeepSeek', desc: 'Модель DeepSeek: DeepSeek V3.1 Terminus от DeepSeek.', isActual: true },
    { id: 'deepseek/deepseek-v3.1-terminus:exacto', name: 'DeepSeek: DeepSeek V3.1 Terminus (exacto)', category: 'DeepSeek', desc: 'Модель DeepSeek: DeepSeek V3.1 Terminus (exacto) от DeepSeek.', isActual: true },
    { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek: DeepSeek V3.2', category: 'DeepSeek', desc: 'Модель DeepSeek: DeepSeek V3.2 от DeepSeek.', isActual: true },
    { id: 'deepseek/deepseek-v3.2-exp', name: 'DeepSeek: DeepSeek V3.2 Exp', category: 'DeepSeek', desc: 'Модель DeepSeek: DeepSeek V3.2 Exp от DeepSeek.', isActual: true },
    { id: 'deepseek/deepseek-v3.2-speciale', name: 'DeepSeek: DeepSeek V3.2 Speciale', category: 'DeepSeek', desc: 'Модель DeepSeek: DeepSeek V3.2 Speciale от DeepSeek.', isActual: true },
    { id: 'deepseek/deepseek-r1', name: 'DeepSeek: R1', category: 'DeepSeek', desc: 'Модель DeepSeek: R1 от DeepSeek.', isActual: true },
    { id: 'deepseek/deepseek-r1-0528', name: 'DeepSeek: R1 0528', category: 'DeepSeek', desc: 'Модель DeepSeek: R1 0528 от DeepSeek.', isActual: true },
    { id: 'deepseek/deepseek-r1-distill-llama-70b', name: 'DeepSeek: R1 Distill Llama 70B', category: 'DeepSeek', desc: 'Модель DeepSeek: R1 Distill Llama 70B от DeepSeek.', isActual: true },
    { id: 'deepseek/deepseek-r1-distill-qwen-32b', name: 'DeepSeek: R1 Distill Qwen 32B', category: 'DeepSeek', desc: 'Модель DeepSeek: R1 Distill Qwen 32B от DeepSeek.', isActual: true },

    // ── GLM ──
    { id: 'z-ai/glm-4.5v', name: 'Z.AI: GLM 4.5V', category: 'GLM', desc: 'Обрабатывает текст, изображения, видео. Архитектура MoE для быстрой и качественной генерации, глубокого рассуждения, оптимизирована под мультимодальных агентов.', isActual: false },
    { id: 'z-ai/glm-4.6v', name: 'Z.AI: GLM 4.6V', category: 'GLM', desc: 'Разрабатывает UI из скриншотов, обрабатывает изображения и текст. Контекстное окно 128K, нативное мультимодальное связывание функций.', isActual: false },

    // ── GPT ──
    { id: 'openai/gpt-4-turbo', name: 'OpenAI: GPT-4 Turbo', category: 'GPT', desc: 'Модель OpenAI: GPT-4 Turbo от OpenAI.', isActual: false },
    { id: 'openai/gpt-4.1', name: 'OpenAI: GPT-4.1', category: 'GPT', desc: 'Модель OpenAI: GPT-4.1 от OpenAI.', isActual: false },
    { id: 'openai/gpt-4.1-mini', name: 'OpenAI: GPT-4.1 Mini', category: 'GPT', desc: 'Обрабатывает сложные текстовые задачи, понимает 1 млн токенов контекста, генерирует код. Подходит для интерактивных приложений, требует минимальных ресурсов.', isActual: false },
    { id: 'openai/gpt-4.1-nano', name: 'OpenAI: GPT-4.1 Nano', category: 'GPT', desc: 'Оптимизированная для низкой задержки и экономичности. Обрабатывает 1М токенов, обеспечивает высокое понимание общих знаний и науки.', isActual: false },
    { id: 'openai/gpt-4o', name: 'OpenAI: GPT-4o', category: 'GPT', desc: 'Обрабатывает текст и изображения. Имеет контекст 128k токенов, быстрая, интеллектуальная.', isActual: true },
    { id: 'openai/gpt-4o-2024-05-13', name: 'OpenAI: GPT-4o (2024-05-13)', category: 'GPT', desc: 'Обрабатывает текст и изображения, быстрая, высокая производительность. Улучшена языковая поддержка.', isActual: true },
    { id: 'openai/gpt-4o-2024-08-06', name: 'OpenAI: GPT-4o (2024-08-06)', category: 'GPT', desc: 'Генерирует текст, код, анализирует изображения. Двойная скорость GPT-4 Turbo, 128K контекстное окно. ПоддержкаJSON-схемы.', isActual: true },
    { id: 'openai/gpt-4o-2024-11-20', name: 'OpenAI: GPT-4o (2024-11-20)', category: 'GPT', desc: 'Оптимизирована для быстрой обработки текста и изображений, поддерживает длинный контекст и многоязычность. Обеспечивает интеллектуальное решение сложных задач.', isActual: true },
    { id: 'openai/gpt-4o:extended', name: 'OpenAI: GPT-4o (extended)', category: 'GPT', desc: 'Обрабатывает текст и изображения, обеспечивает двукратное ускорение работы и сниженную стоимость. Подходит для сложных задач, требует большого контекстного окна.', isActual: true },
    { id: 'openai/gpt-4o-mini', name: 'OpenAI: GPT-4o-mini', category: 'GPT', desc: 'Обрабатывает текст и изображения, понимает длинный контекст. Быстрая, экономичная, подходит для разработки, контент-генерации и образовательных задач.', isActual: true },
    { id: 'openai/gpt-4o-mini-2024-07-18', name: 'OpenAI: GPT-4o-mini (2024-07-18)', category: 'GPT', desc: 'Генерирует тексты и код. Обрабатывает до 128 000 токенов, обеспечивает быстрые ответы.', isActual: true },
    { id: 'openai/gpt-5', name: 'OpenAI: GPT-5', category: 'GPT', desc: 'Решает задачи высшей сложности, обладает улучшенным пошаговым рассуждением и сниженными галлюцинациями. Подходит для генерации кода и критически важных сценариев.', isActual: false },
    { id: 'openai/gpt-5-chat', name: 'OpenAI: GPT-5 Chat', category: 'GPT', desc: 'Генерирует продвинутые, мультимодальные ответы. Понимает длинный контекст, сложные рассуждения, улучшенная обработка изображений.', isActual: false },
    { id: 'openai/gpt-5-codex', name: 'OpenAI: GPT-5 Codex', category: 'GPT', desc: 'Оптимизирована для разработки ПО. Обеспечивает продвинутое рассуждение и планирование, подходит для автоматизации сложных инженерных задач.', isActual: false },
    { id: 'openai/gpt-5-image', name: 'OpenAI: GPT-5 Image', category: 'GPT', desc: 'Генерирует текст и изображения, редактирует визуальный контент. Обеспечивает продвинутое рассуждение, улучшенное следование инструкциям.', isActual: false },
    { id: 'openai/gpt-5-image-mini', name: 'OpenAI: GPT-5 Image Mini', category: 'GPT', desc: 'Генерирует текст и изображения, снижает задержку, оптимизирует затраты. Подходит для создания контента, разработки приложений, требующих совместной обработки текста и визуального контента.', isActual: false },
    { id: 'openai/gpt-5-mini', name: 'OpenAI: GPT-5 Mini', category: 'GPT', desc: 'Генерирует быстрые, точные ответы. Оптимизирована для быстрой обработки текста и следования инструкциям.', isActual: false },
    { id: 'openai/gpt-5-nano', name: 'OpenAI: GPT-5 Nano', category: 'GPT', desc: 'Предназначена для быстрой генерации кода и текстов. Оптимизирована для разработчиков, обеспечивает низкую задержку и экономичность.', isActual: false },
    { id: 'openai/gpt-5-pro', name: 'OpenAI: GPT-5 Pro', category: 'GPT', desc: 'Оптимизирована для сложных задач, генерации кода и рассуждений. Обрабатывает большие объемы контекста, обеспечивает высокую точность и надежность.', isActual: false },
    { id: 'openai/gpt-5.1', name: 'OpenAI: GPT-5.1', category: 'GPT', desc: 'Оптимизирована под сложные рассуждения и точное следование инструкциям, обрабатывает большие объемы информации. Идеальна для генерации кода, анализа данных, поддержки и обучения.', isActual: false },
    { id: 'openai/gpt-5.1-chat', name: 'OpenAI: GPT-5.1 Chat', category: 'GPT', desc: 'Оптимизирована для низколатентного чата. Адаптивное рассуждение для сложных задач.', isActual: false },
    { id: 'openai/gpt-5.1-codex', name: 'OpenAI: GPT-5.1-Codex', category: 'GPT', desc: 'Оптимизирована для разработки ПО. Генерирует, отлаживает, рефакторит код. Настраиваемое \"усилие рассуждений\" для баланса скорости и глубины анализа.', isActual: false },
    { id: 'openai/gpt-5.1-codex-max', name: 'OpenAI: GPT-5.1-Codex-Max', category: 'GPT', desc: 'Оптимизирована под разработку ПО. Высокое контекстное окно, улучшенные рассуждения, ускорение задач.', isActual: false },
    { id: 'openai/gpt-5.1-codex-mini', name: 'OpenAI: GPT-5.1-Codex-Mini', category: 'GPT', desc: 'Оптимизирована для кода. Понимает 8192 токена, генерирует код быстро и эффективно.', isActual: false },
    { id: 'openai/gpt-5.2', name: 'OpenAI: GPT-5.2', category: 'GPT', desc: 'Оптимизирована для сложных задач, агентной деятельности и работы с длинным контекстом. Динамически распределяет ресурсы для точного и быстрого анализа.', isActual: false },
    { id: 'openai/gpt-5.2-chat', name: 'OpenAI: GPT-5.2 Chat', category: 'GPT', desc: 'Оптимизирована под низкую задержку в диалогах. Адаптивное рассуждение для точных ответов в сложных задачах, сохраняя скорость.', isActual: false },
    { id: 'openai/gpt-5.2-pro', name: 'OpenAI: GPT-5.2 Pro', category: 'GPT', desc: 'Оптимизирована для генерации кода и обработки длинного контекста. Повышенная точность, следование сложным инструкциям, снижены галлюцинации.', isActual: false },
    { id: 'openai/gpt-5.2-codex', name: 'OpenAI: GPT-5.2-Codex', category: 'GPT', desc: 'Оптимизирована под разработку ПО. Генерирует код, рефакторит, отвечает на задачи. Поддерживает мультимодальность, гибкую настройку рассуждений.', isActual: false },
    { id: 'openai/o1', name: 'OpenAI: o1', category: 'GPT', desc: 'Оптимизирована под STEM-задачи, глубокие рассуждения с \"цепочкой рассуждений\" (chain of thought) для сложных выводов. Превосходит конкурентов в научных и математических бенчмарках.', isActual: true },
    { id: 'openai/o1-pro', name: 'OpenAI: o1-pro', category: 'GPT', desc: 'Оптимизирована для сложных рассуждений и анализа. Работает с большим контекстом, улучшена точность ответов.', isActual: true },
    { id: 'openai/o3', name: 'OpenAI: o3', category: 'GPT', desc: 'Решает сложные математические, научные и программные задачи, анализирует изображения. Подходит для мультимодальных исследований и многошагового рассуждения.', isActual: true },
    { id: 'openai/o3-deep-research', name: 'OpenAI: o3 Deep Research', category: 'GPT', desc: 'Сделана для глубоких исследований. Использует `web_search` для доступа к актуальным данным, обеспечивает многоэтапные рассуждения и анализ больших объемов информации.', isActual: true },
    { id: 'openai/o3-mini', name: 'OpenAI: o3 Mini', category: 'GPT', desc: 'Оптимизирована под STEM-рассуждения, код. Контролирует глубину анализа, ускоряя вывод.', isActual: true },
    { id: 'openai/o3-mini-high', name: 'OpenAI: o3 Mini High', category: 'GPT', desc: 'Оптимизирована для STEM-рассуждений. Высокое \"усилие при рассуждении\", вызов функций, структурированные выводы.', isActual: true },
    { id: 'openai/o3-pro', name: 'OpenAI: o3 Pro', category: 'GPT', desc: 'Оптимизирована под сложные задачи, требующие глубокого анализа и последовательного рассуждения. Идеальна для разработки ПО, исследований и финансового анализа.', isActual: true },
    { id: 'openai/o4-mini', name: 'OpenAI: o4 Mini', category: 'GPT', desc: 'Оптимизирована для быстрых, экономически эффективных вычислений. Сильна в мультимодальных задачах, решении STEM-задач и кодировании.', isActual: false },
    { id: 'openai/o4-mini-deep-research', name: 'OpenAI: o4 Mini Deep Research', category: 'GPT', desc: 'Оптимизирована для глубокого исследования, работает с объемной информацией, использует `web_search` для актуальных данных. Подходит для многошаговых рассуждений и анализа.', isActual: false },
    { id: 'openai/o4-mini-high', name: 'OpenAI: o4 Mini High', category: 'GPT', desc: 'Оптимизирована под высокоуровневые рассуждения и мультимодальные задачи. Обеспечивает скорость, точность и эффективное использование инструментов.', isActual: false },

    // ── Gemini ──
    { id: 'google/gemini-2.0-flash-001', name: 'Google: Gemini 2.0 Flash', category: 'Gemini', desc: 'Модель Google: Gemini 2.0 Flash от Google.', isActual: false },
    { id: 'google/gemini-2.0-flash-lite-001', name: 'Google: Gemini 2.0 Flash Lite', category: 'Gemini', desc: 'Модель Google: Gemini 2.0 Flash Lite от Google.', isActual: false },
    { id: 'google/gemini-2.5-flash', name: 'Google: Gemini 2.5 Flash', category: 'Gemini', desc: 'Модель Google: Gemini 2.5 Flash от Google.', isActual: false },
    { id: 'google/gemini-2.5-flash-image', name: 'Google: Gemini 2.5 Flash Image (Nano Banana)', category: 'Gemini', desc: 'Генерирует и редактирует изображения, работает с текстом. Обрабатывает большие объемы данных за счет расширенного контекстного окна.', isActual: false },
    { id: 'google/gemini-2.5-flash-lite', name: 'Google: Gemini 2.5 Flash Lite', category: 'Gemini', desc: 'Модель Google: Gemini 2.5 Flash Lite от Google.', isActual: false },
    { id: 'google/gemini-2.5-flash-lite-preview-09-2025', name: 'Google: Gemini 2.5 Flash Lite Preview 09-2025', category: 'Gemini', desc: 'Модель Google: Gemini 2.5 Flash Lite Preview 09-2025 от Google.', isActual: false },
    { id: 'google/gemini-2.5-pro-preview-05-06', name: 'Google: Gemini 2.5 Pro Preview 05-06', category: 'Gemini', desc: 'Модель Google: Gemini 2.5 Pro Preview 05-06 от Google.', isActual: false },
    { id: 'google/gemini-2.5-pro', name: 'Google: Gemini 2.5 Pro Preview 05-06', category: 'Gemini', desc: 'Модель Google: Gemini 2.5 Pro Preview 05-06 от Google.', isActual: false },
    { id: 'google/gemini-2.5-pro-preview', name: 'Google: Gemini 2.5 Pro Preview 06-05', category: 'Gemini', desc: 'Модель Google: Gemini 2.5 Pro Preview 06-05 от Google.', isActual: false },
    { id: 'google/gemini-3-flash-preview', name: 'Google: Gemini 3 Flash Preview', category: 'Gemini', desc: 'Модель Google: Gemini 3 Flash Preview от Google.', isActual: false },
    { id: 'google/gemini-3-pro-preview', name: 'Google: Gemini 3 Pro Preview', category: 'Gemini', desc: 'Модель Google: Gemini 3 Pro Preview от Google.', isActual: false },
    { id: 'google/gemini-3.1-pro-preview', name: 'Google: Gemini 3.1 Pro Preview', category: 'Gemini', desc: 'Создана для задач с длинным контекстом. Быстро анализирует, генерирует текст, понимает запросы.', isActual: false },
    { id: 'google/gemma-3-12b-it', name: 'Google: Gemma 3 12B', category: 'Gemini', desc: 'Модель Google: Gemma 3 12B от Google.', isActual: false },
    { id: 'google/gemma-3-27b-it', name: 'Google: Gemma 3 27B', category: 'Gemini', desc: 'Модель Google: Gemma 3 27B от Google.', isActual: false },
    { id: 'google/gemma-3-4b-it', name: 'Google: Gemma 3 4B', category: 'Gemini', desc: 'Модель Google: Gemma 3 4B от Google.', isActual: false },
    { id: 'google/gemini-3.1-flash-image-preview', name: 'Google: Nano Banana 2 (Gemini 3.1 Flash Image Preview)', category: 'Gemini', desc: 'Модель Google: Nano Banana 2 (Gemini 3.1 Flash Image Preview) от Google.', isActual: false },
    { id: 'google/gemini-3-pro-image-preview', name: 'Google: Nano Banana Pro (Gemini 3 Pro Image Preview)', category: 'Gemini', desc: 'Модель Google: Nano Banana Pro (Gemini 3 Pro Image Preview) от Google.', isActual: false },

    // ── Grok ──
    { id: 'x-ai/grok-4', name: 'xAI: Grok 4', category: 'Grok', desc: 'Предназначена для продвинутых рассуждений и анализа больших объемов данных. Имеет контекстное окно 256 000 токенов.', isActual: false },
    { id: 'x-ai/grok-4-fast', name: 'xAI: Grok 4 Fast', category: 'Grok', desc: 'Обрабатывает огромный контекст (2М токенов), мультимодальная. Подходит для анализа данных, кода, контента.', isActual: false },
    { id: 'x-ai/grok-4.1-fast', name: 'xAI: Grok 4.1 Fast', category: 'Grok', desc: 'Оптимизирована для агентных задач. Обрабатывает 2 млн токенов, обеспечивает высокую скорость и продвинутое логическое рассуждение.', isActual: false },

    // ── Mistral ──
    { id: 'mistralai/ministral-14b-2512', name: 'Mistral: Ministral 3 14B 2512', category: 'Mistral', desc: 'Модель Mistral: Ministral 3 14B 2512 от Mistral.', isActual: false },
    { id: 'mistralai/ministral-3b-2512', name: 'Mistral: Ministral 3 3B 2512', category: 'Mistral', desc: 'Модель Mistral: Ministral 3 3B 2512 от Mistral.', isActual: false },
    { id: 'mistralai/ministral-8b-2512', name: 'Mistral: Ministral 3 8B 2512', category: 'Mistral', desc: 'Модель Mistral: Ministral 3 8B 2512 от Mistral.', isActual: false },
    { id: 'mistralai/mistral-large-2512', name: 'Mistral: Mistral Large 3 2512', category: 'Mistral', desc: 'Модель Mistral: Mistral Large 3 2512 от Mistral.', isActual: false },
    { id: 'mistralai/mistral-medium-3', name: 'Mistral: Mistral Medium 3', category: 'Mistral', desc: 'Модель Mistral: Mistral Medium 3 от Mistral.', isActual: false },
    { id: 'mistralai/mistral-medium-3.1', name: 'Mistral: Mistral Medium 3.1', category: 'Mistral', desc: 'Модель Mistral: Mistral Medium 3.1 от Mistral.', isActual: false },
    { id: 'mistralai/mistral-small-3.1-24b-instruct', name: 'Mistral: Mistral Small 3.1 24B', category: 'Mistral', desc: 'Модель Mistral: Mistral Small 3.1 24B от Mistral.', isActual: false },
    { id: 'mistralai/mistral-small-3.2-24b-instruct', name: 'Mistral: Mistral Small 3.2 24B', category: 'Mistral', desc: 'Модель Mistral: Mistral Small 3.2 24B от Mistral.', isActual: false },
    { id: 'mistralai/pixtral-large-2411', name: 'Mistral: Pixtral Large 2411', category: 'Mistral', desc: 'Модель Mistral: Pixtral Large 2411 от Mistral.', isActual: false },

    // ── Qwen ──
    { id: 'qwen/qwen-vl-max', name: 'Qwen: Qwen VL Max', category: 'Qwen', desc: 'Анализирует текст и изображения, решая комплексные задачи. Поддерживает 8192 токена контекста, сильна в кодировании и математических рассуждениях.', isActual: false },
    { id: 'qwen/qwen-vl-plus', name: 'Qwen: Qwen VL Plus', category: 'Qwen', desc: 'Обработает изображения до миллионов пикселей. Подходит для анализа деталей, OCR, больших документов.', isActual: false },
    { id: 'qwen/qwen2.5-vl-32b-instruct', name: 'Qwen: Qwen2.5 VL 32B Instruct', category: 'Qwen', desc: 'Анализирует текст, изображения, видео. Улучшенное математическое и логическое рассуждение, 32k контекст.', isActual: false },
    { id: 'qwen/qwen2.5-vl-72b-instruct', name: 'Qwen: Qwen2.5 VL 72B Instruct', category: 'Qwen', desc: 'Работает с текстом и изображениями. Обрабатывает до 32 768 токенов, решает задачи генерации кода, рассуждения и анализа визуального контента.', isActual: false },
    { id: 'qwen/qwen-2.5-vl-7b-instruct', name: 'Qwen: Qwen2.5-VL 7B Instruct', category: 'Qwen', desc: 'Обрабатывает изображения и видео. Понимает длинный контекст (8192 токена), подходит для агентов и анализа визуальных данных.', isActual: false },
    { id: 'qwen/qwen3-vl-235b-a22b-instruct', name: 'Qwen: Qwen3 VL 235B A22B Instruct', category: 'Qwen', desc: 'Анализирует текст, изображения, видео. Поддерживает длинные контексты, идеальна для автоматизации процессов и визуального анализа.', isActual: false },
    { id: 'qwen/qwen3-vl-235b-a22b-thinking', name: 'Qwen: Qwen3 VL 235B A22B Thinking', category: 'Qwen', desc: 'Оптимизирована для STEM, математики, программирования. Обрабатывает текст, изображения, видео. Превосходная мультимодальная логика и агенты.', isActual: false },
    { id: 'qwen/qwen3-vl-30b-a3b-instruct', name: 'Qwen: Qwen3 VL 30B A3B Instruct', category: 'Qwen', desc: 'Обрабатывает текст и изображения, понимает длинный контекст. Идеальна для генерации кода по визуальным эскизам и мультимодальных ИИ-агентов.', isActual: false },
    { id: 'qwen/qwen3-vl-30b-a3b-thinking', name: 'Qwen: Qwen3 VL 30B A3B Thinking', category: 'Qwen', desc: 'Оптимизирована под STEM-рассуждения и мультимодальный анализ (текст, видео). Подходит для решения сложных задач, требует значительных ресурсов.', isActual: false },
    { id: 'qwen/qwen3-vl-32b-instruct', name: 'Qwen: Qwen3 VL 32B Instruct', category: 'Qwen', desc: 'Анализирует текст, изображения, видео. Умеет работать с 32 языками, контекст 8192 токена.', isActual: false },
    { id: 'qwen/qwen3-vl-8b-instruct', name: 'Qwen: Qwen3 VL 8B Instruct', category: 'Qwen', desc: 'Обработка текста, изображений, видео. Контекстное окно до 1М токенов, анализ длинных последовательностей.', isActual: false },
    { id: 'qwen/qwen3-vl-8b-thinking', name: 'Qwen: Qwen3 VL 8B Thinking', category: 'Qwen', desc: 'Оптимизирована под рассуждения. Высокое контекстное окно (256k-1M токенов) для анализа изображений, документов, видео.', isActual: false },
    { id: 'qwen/qwen3.5-397b-a17b', name: 'Qwen: Qwen3.5 397B A17B', category: 'Qwen', desc: 'Генерирует текст, подбирает изображения. Высокая скорость, подходит для чат-ботов, генерации контента.', isActual: false },
    { id: 'qwen/qwen3.5-plus-02-15', name: 'Qwen: Qwen3.5 Plus 2026-02-15', category: 'Qwen', desc: 'Генерирует код и тексты. Высокое качество при значительной скорости.', isActual: false },
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
                        console.log('[Polza Chunk]', data);

                        // Handle usage statistics if present
                        if (data.usage?.prompt_tokens && onUsage) {
                            onUsage(data.usage);
                        }

                        // Handle reasoning chunks
                        const reasoning = data.choices && (
                            data.choices[0]?.delta?.reasoning ||
                            data.choices[0]?.delta?.reasoning_content ||
                            data.choices[0]?.delta?.thinking_content
                        );
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
