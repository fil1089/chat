import type { Chat, Space, Settings, SpaceFile } from '../types';

const KEYS = {
    CHATS: 'aggregator_chats',
    SPACES: 'aggregator_spaces',
    SETTINGS: 'aggregator_settings',
} as const;

async function apiGet<T>(key: string): Promise<T | null> {
    try {
        const res = await fetch(`/store/${key}`);
        const data = await res.json();
        return data.value as T;
    } catch {
        return null;
    }
}

async function apiSet(key: string, value: unknown): Promise<void> {
    try {
        await fetch(`/store/${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value }),
        });
    } catch (e) {
        console.error('Storage write error:', e);
    }
}

async function apiDelete(key: string): Promise<void> {
    try {
        await fetch(`/store/${key}`, { method: 'DELETE' });
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
    await apiSet(KEYS.CHATS, chats);
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
    await apiSet(KEYS.SPACES, spaces);
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
    defaultModel: 'gpt-4o',
    theme: 'dark',
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
