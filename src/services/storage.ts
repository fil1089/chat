import type { Chat, Space, Settings } from '../types';

const KEYS = {
    CHATS: 'aggregator_chats',
    SPACES: 'aggregator_spaces',
    SETTINGS: 'aggregator_settings',
} as const;

function authHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token
        ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        : { 'Content-Type': 'application/json' };
}

async function apiGet<T>(key: string): Promise<T | null> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(`/api/store/${key}`, {
            headers: authHeaders(),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) return null;

        const data = await res.json();
        return data.value as T;
    } catch {
        return null;
    }
}

async function apiSet(key: string, value: unknown): Promise<void> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const body = JSON.stringify({ value });
        if (body.length > 1 * 1024 * 1024) {
            console.warn(`[Storage API] Large payload for ${key}: ${(body.length / 1024 / 1024).toFixed(2)} MB`);
        }

        await fetch(`/api/store/${key}`, {
            method: 'POST',
            headers: authHeaders(),
            body,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
    } catch (e) {
        console.error('Storage write error:', e);
    }
}
async function apiDelete(key: string): Promise<void> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        await fetch(`/api/store/${key}`, {
            method: 'DELETE',
            headers: authHeaders(),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
    } catch (e) {
        console.error('Storage delete error:', e);
    }
}

// --- Chats ---
export async function getChats(): Promise<Chat[]> {
    return (await apiGet<Chat[]>(KEYS.CHATS)) ?? [];
}

export async function saveChat(chat: Chat): Promise<Chat[]> {
    const chats = await getChats();
    const idx = chats.findIndex((c) => c.id === chat.id);
    if (idx >= 0) {
        chats[idx] = { ...chat, updatedAt: Date.now() };
    } else {
        chats.unshift({ ...chat, createdAt: Date.now(), updatedAt: Date.now() });
    }

    // Strip extremely large base64 attachments before saving to DB 
    // to prevent hitting Vercel's strict 4.5MB request size limit.
    const dbChats = chats.map(c => ({
        ...c,
        messages: c.messages.map(m => {
            // First, strip large fullAttachments data
            let newM = { ...m };
            if (newM.fullAttachments && newM.fullAttachments.length > 0) {
                newM.fullAttachments = newM.fullAttachments.map(a => {
                    // Strip content if larger than ~256 KB
                    if (a.content && a.content.length > 256 * 1024) {
                        return { ...a, content: '' };
                    }
                    return a;
                });
            }

            // Second, check text 'content' itself 
            // Often text files or base64 are embedded directly into the prompt text
            if (newM.content && newM.content.length > 256 * 1024) {
                const half = 120 * 1024;
                newM.content = newM.content.substring(0, half) + '\n\n...[TRUNCATED_LARGE_PAYLOAD_FOR_DB_STORAGE]...\n\n' + newM.content.slice(-half);
            }

            // Third, do the same for message 'versions' content strings
            if (newM.versions && newM.versions.length > 0) {
                newM.versions = newM.versions.map(v => {
                    let newV = { ...v };
                    if (newV.content && newV.content.length > 256 * 1024) {
                        const half = 120 * 1024;
                        newV.content = newV.content.substring(0, half) + '\n\n...[TRUNCATED_LARGE_PAYLOAD_FOR_DB_STORAGE]...\n\n' + newV.content.slice(-half);
                    }
                    return newV;
                });
            }

            return newM;
        })
    }));

    await apiSet(KEYS.CHATS, dbChats);
    return chats;
}

export async function deleteChat(chatId: string): Promise<Chat[]> {
    const chats = (await getChats()).filter((c) => c.id !== chatId);
    await apiSet(KEYS.CHATS, chats);
    return chats;
}

// --- Spaces ---
export async function getSpaces(): Promise<Space[]> {
    return (await apiGet<Space[]>(KEYS.SPACES)) ?? [];
}

export async function saveSpace(space: Space): Promise<Space[]> {
    const spaces = await getSpaces();
    const idx = spaces.findIndex((s) => s.id === space.id);
    if (idx >= 0) {
        spaces[idx] = { ...space, updatedAt: Date.now() };
    } else {
        spaces.unshift({ ...space, createdAt: Date.now(), updatedAt: Date.now() });
    }

    // Strip large attachments to prevent Vercel 4.5MB error
    const dbSpaces = spaces.map(s => {
        if (!s.files || s.files.length === 0) return s;
        return {
            ...s,
            files: s.files.map(f => {
                if (f.content && f.content.length > 256 * 1024) {
                    return { ...f, content: '' };
                }
                return f;
            })
        };
    });

    await apiSet(KEYS.SPACES, dbSpaces);
    return spaces;
}

export async function deleteSpace(spaceId: string): Promise<Space[]> {
    const spaces = (await getSpaces()).filter((s) => s.id !== spaceId);
    await apiSet(KEYS.SPACES, spaces);
    const chats = (await getChats()).filter((c) => c.spaceId !== spaceId);
    await apiSet(KEYS.CHATS, chats);
    return spaces;
}

// --- Settings ---
const DEFAULT_SETTINGS: Settings = {
    apiKey: '',
    youApiKey: '',
    polzaApiKey: '',
    apiProvider: 'polza',
    defaultModel: 'openai/gpt-4o-mini',
    theme: 'dark',
    imageSize: '1024x1024',
    imageQuality: 'high',
    enableReasoning: false,
};

export async function getSettings(): Promise<Settings> {
    const saved = (await apiGet<Partial<Settings>>(KEYS.SETTINGS)) ?? {};
    return { ...DEFAULT_SETTINGS, ...saved };
}

export async function saveSettings(settings: Partial<Settings>): Promise<Settings> {
    const current = await getSettings();
    const merged = { ...current, ...settings };
    await apiSet(KEYS.SETTINGS, merged);
    return merged;
}

// --- Export / Import ---
export async function exportAllData(): Promise<string> {
    return JSON.stringify({
        chats: await getChats(),
        spaces: await getSpaces(),
        settings: await getSettings(),
        exportedAt: new Date().toISOString(),
    }, null, 2);
}

export async function importAllData(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    if (data.chats) await apiSet(KEYS.CHATS, data.chats);
    if (data.spaces) await apiSet(KEYS.SPACES, data.spaces);
    if (data.settings) await apiSet(KEYS.SETTINGS, data.settings);
}

export async function clearAllData(): Promise<void> {
    await apiDelete(KEYS.CHATS);
    await apiDelete(KEYS.SPACES);
    await apiDelete(KEYS.SETTINGS);
}
