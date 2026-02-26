import { API_URLS } from './apiConfig';
import type { AIModel } from '../types';

export const POLZA_MODELS: AIModel[] = [
    { id: 'openai/gpt-4o', name: 'GPT-4o', desc: 'Флагманская модель OpenAI', isActual: true, category: 'OpenAI' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o-mini', desc: 'Быстрая модель OpenAI', category: 'OpenAI' },
    { id: 'anthropic/claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', desc: 'Быстрая и умная модель Anthropic', isActual: true, category: 'Anthropic' },
    { id: 'anthropic/claude-3-5-haiku', name: 'Claude 3.5 Haiku', desc: 'Самая быстрая модель Anthropic', category: 'Anthropic' },
    { id: 'google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro (Preview)', desc: 'Новейшая модель Google', isActual: true, category: 'Google' },
    { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash (Preview)', desc: 'Быстрая модель Google', category: 'Google' },
    { id: 'google/gemini-exp-1206', name: 'Gemini Experimental', desc: 'Экспериментальная модель', category: 'Google' },
    { id: 'meta-llama/llama-3.3-70b', name: 'Llama 3.3 70B', desc: 'Open-weight модель от Meta', category: 'Meta' },
    { id: 'x-ai/grok-2', name: 'Grok 2', desc: 'Модель от xAI', category: 'xAI' },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', desc: 'Мощная китайская модель', category: 'DeepSeek' },
    { id: 'deepseek/deepseek-reasoner', name: 'DeepSeek R1', desc: 'Модель с рассуждениями', isActual: true, category: 'DeepSeek' },
    { id: 'openai/o1-mini', name: 'o1-mini', desc: 'Компактная reasoning модель', category: 'Reasoning' },
    { id: 'openai/o3-mini', name: 'o3-mini', desc: 'Новая reasoning модель', isActual: true, category: 'Reasoning' },
];

export const POLZA_IMAGE_MODELS: AIModel[] = [
    { id: 'openai/dall-e-3', name: 'DALL-E 3', desc: 'Генератор изображений OpenAI', isActual: true, category: 'Изображения' },
    { id: 'black-forest-labs/flux-1.1-pro-ultra', name: 'Flux 1.1 Pro Ultra', desc: 'Лучшая модель Flux', isActual: true, category: 'Изображения' },
    { id: 'black-forest-labs/flux-1-schnell', name: 'Flux 1 Schnell', desc: 'Быстрая модель Flux', category: 'Изображения' },
    { id: 'stability-ai/stable-diffusion-3.5-large', name: 'Stable Diffusion 3.5', desc: 'Модель от Stability AI', category: 'Изображения' },
    { id: 'midjourney', name: 'Midjourney', desc: 'Генератор от Midjourney', isActual: true, category: 'Изображения' },
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
    onUsage?: (usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) => void;
    onHistoryFix?: () => void;
}

export async function streamResponsePolza({
    model,
    messages,
    apiKey,
    onUpdate,
    onUsage,
}: PolzaStreamParams): Promise<void> {
    if (!apiKey) {
        throw new Error('Укажите API ключ Polza.ai в настройках');
    }

    try {
        const response = await fetch(`${API_URLS.polza}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                stream: true,
            }),
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
