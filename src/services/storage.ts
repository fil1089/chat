import type { Chat, Space, Settings } from '../types';
import { supabase } from '../lib/supabase';

const KEYS = {
    CHATS: 'aggregator_chats',
    SPACES: 'aggregator_spaces',
    SETTINGS: 'aggregator_settings',
} as const;

const LS_PREFIX = 'app_';

// --- Auth token (set from AuthContext) ---
let _authToken: string | null = null;

export function setAuthToken(token: string | null): void {
    _authToken = token;
}

// --- localStorage helpers ---
function lsGet<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(LS_PREFIX + key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

function lsSet(key: string, value: unknown): void {
    try {
        localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
    } catch (e) {
        console.warn('[Storage LS] write error:', e);
    }
}

function lsDelete(key: string): void {
    try {
        localStorage.removeItem(LS_PREFIX + key);
    } catch { }
}

async function authHeaders(): Promise<Record<string, string>> {
    // 1. Use token pushed from AuthContext
    let token = _authToken;
    // 2. Fallback: try supabase.auth.getSession()
    if (!token) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            token = session?.access_token ?? null;
        } catch { }
    }
    return token
        ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        : { 'Content-Type': 'application/json' };
}

async function apiGet<T>(key: string): Promise<T | null> {
    const headers = await authHeaders();
    if (!headers.Authorization) {
        return lsGet<T>(key);
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(`/api/store/${key}`, {
            headers: await authHeaders(),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            // Fallback to localStorage on auth/server error
            return lsGet<T>(key);
        }

        const data = await res.json();
        const value = data.value as T;
        // Sync successful API read to localStorage as backup
        if (value !== null && value !== undefined) {
            lsSet(key, value);
        }
        return value;
    } catch {
        // Network error — fallback to localStorage
        return lsGet<T>(key);
    }
}

async function apiSet(key: string, value: unknown): Promise<void> {
    // Always save to localStorage first (instant, reliable)
    lsSet(key, value);

    const headers = await authHeaders();
    if (!headers.Authorization) {
        return;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const body = JSON.stringify({ value });
        if (body.length > 1 * 1024 * 1024) {
            console.warn(`[Storage API] Large payload for ${key}: ${(body.length / 1024 / 1024).toFixed(2)} MB`);
        }

        await fetch(`/api/store/${key}`, {
            method: 'POST',
            headers: await authHeaders(),
            body,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
    } catch (e) {
        console.warn('[Storage API] write failed, data saved to localStorage:', e);
    }
}
async function apiDelete(key: string): Promise<void> {
    lsDelete(key);
    const headers = await authHeaders();
    if (!headers.Authorization) {
        return;
    }
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        await fetch(`/api/store/${key}`, {
            method: 'DELETE',
            headers: await authHeaders(),
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
    // Optimization: only process if the stringified JSON indicates it's huge
    let dbChats = chats;
    try {
        const chatsJsonSize = JSON.stringify(chats).length;
        if (chatsJsonSize > 1024 * 1024) { // Only do heavy mapping if total size > 1MB
            dbChats = chats.map(c => {
                const dbM = c.messages.map(m => {
                    let newM = m;
                    let needsClone = false;

                    // 1. Strip attachments
                    if (m.fullAttachments && m.fullAttachments.some(a => a.content && a.content.length > 256 * 1024)) {
                        needsClone = true;
                        newM = { ...newM, fullAttachments: m.fullAttachments.map(a => (a.content && a.content.length > 256 * 1024) ? { ...a, content: '' } : a) };
                    }

                    // 2. Strip text content
                    if (m.content && m.content.length > 256 * 1024) {
                        needsClone = true;
                        const half = 120 * 1024;
                        newM = { ...newM, content: m.content.substring(0, half) + '\n\n...[TRUNCATED_LARGE_PAYLOAD_FOR_DB_STORAGE]...\n\n' + m.content.slice(-half) };
                    }

                    // 3. Strip version content
                    if (m.versions && m.versions.some(v => v.content && v.content.length > 256 * 1024)) {
                        needsClone = true;
                        newM = {
                            ...newM, versions: m.versions.map(v => {
                                if (v.content && v.content.length > 256 * 1024) {
                                    const half = 120 * 1024;
                                    return { ...v, content: v.content.substring(0, half) + '\n\n...[TRUNCATED_LARGE_PAYLOAD_FOR_DB_STORAGE]...\n\n' + v.content.slice(-half) };
                                }
                                return v;
                            })
                        };
                    }

                    return needsClone ? newM : m;
                });

                // Only clone the chat if any of its messages were actually modified
                if (dbM.some((m, idx) => m !== c.messages[idx])) {
                    return { ...c, messages: dbM };
                }
                return c;
            });
        }
    } catch (err) {
        console.error("Error optimizing chat DB payload:", err);
    }

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

export async function saveAllSpaces(spaces: Space[]): Promise<Space[]> {
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

export async function getPublicSpaces(): Promise<Space[]> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        // Note: this endpoint doesn't strictly need auth for reading, but we pass headers just in case
        const res = await fetch(`/api/store/public_spaces`, {
            headers: await authHeaders(),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            console.error('[Storage API] Failed to fetch public spaces', res.status);
            return [];
        }

        const data = await res.json();
        return Array.isArray(data.spaces) ? data.spaces as Space[] : [];
    } catch (e) {
        console.error('[Storage API] getPublicSpaces failed:', e);
        return [];
    }
}

// --- Settings ---
const DEFAULT_SETTINGS: Settings = {
    youApiKey: '',
    polzaApiKey: '',
    hfToken: '',
    defaultModel: 'gpt-4o',
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
