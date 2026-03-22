import { createContext, useContext, useReducer, useEffect, useCallback, useRef, type ReactNode, type Dispatch } from 'react';
import * as storage from '../services/storage';
import { useAuth } from './AuthContext';
import type { AppState, AppAction, Settings, Chat, Space } from '../types';

interface AppContextValue {
    state: AppState;
    dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialState: AppState = {
    chats: [],
    activeChat: null,
    spaces: [],
    activeSpace: null,
    settings: {
        polzaApiKey: '',
        hfToken: '',
        defaultModel: 'openai/gpt-4o',
        theme: 'dark',
        imageSize: '1024x1024',
        imageQuality: 'high',
        enableReasoning: false,
        enableWebSearch: false,
        autoTranslate: false,
    },
    sidebarOpen: typeof window !== 'undefined' ? window.innerWidth > 768 : true,
    storageReady: false,
};

function reducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'LOAD_DATA':
            return {
                ...state,
                chats: action.payload.chats,
                spaces: action.payload.spaces,
                settings: { ...state.settings, ...action.payload.settings, enableWebSearch: false },
                storageReady: true,
            };

        case 'SET_ACTIVE_CHAT':
            return { ...state, activeChat: action.payload };

        case 'NEW_CHAT': {
            const chat = action.payload;
            const currentChats = Array.isArray(state.chats) ? state.chats : [];
            return { ...state, chats: [chat, ...currentChats], activeChat: chat.id };
        }

        case 'UPDATE_CHAT': {
            const chat = action.payload;
            const chats = state.chats.map((c) =>
                c.id === chat.id ? { ...chat, updatedAt: Date.now() } : c
            );
            const exists = state.chats.some((c) => c.id === chat.id);
            const finalChats = exists ? chats : [{ ...chat, createdAt: Date.now(), updatedAt: Date.now() }, ...state.chats];
            return { ...state, chats: finalChats };
        }

        case 'UPDATE_CHAT_MESSAGES': {
            const { chatId, messages } = action.payload;
            const chats = state.chats.map((c) =>
                c.id === chatId ? { ...c, messages: messages.length > 0 ? messages : c.messages } : c
            );
            return { ...state, chats };
        }

        case 'DELETE_CHAT': {
            return {
                ...state,
                chats: state.chats.filter((c) => c.id !== action.payload),
                activeChat: state.activeChat === action.payload ? null : state.activeChat,
            };
        }

        case 'SET_ACTIVE_SPACE':
            return { ...state, activeSpace: action.payload };

        case 'SAVE_SPACE': {
            const space = action.payload;
            const spaces = state.spaces.map((s) =>
                s.id === space.id ? { ...space, updatedAt: Date.now() } : s
            );
            const exists = state.spaces.some((s) => s.id === space.id);
            const finalSpaces = exists ? spaces : [{ ...space, createdAt: Date.now(), updatedAt: Date.now() }, ...state.spaces];
            return { ...state, spaces: finalSpaces };
        }

        case 'DELETE_SPACE': {
            return {
                ...state,
                spaces: state.spaces.filter((s) => s.id !== action.payload),
                activeSpace: state.activeSpace === action.payload ? null : state.activeSpace,
                chats: state.chats.filter((c) => c.spaceId !== action.payload),
            };
        }

        case 'UPDATE_SETTINGS':
            return { ...state, settings: { ...state.settings, ...action.payload } };

        case 'TOGGLE_SIDEBAR':
            return { ...state, sidebarOpen: !state.sidebarOpen };

        case 'SET_SIDEBAR':
            return { ...state, sidebarOpen: action.payload };

        case 'SET_MESSAGE_VERSION': {
            const { chatId, messageId, versionIndex } = action.payload;
            const chats = state.chats.map(chat => {
                if (chat.id !== chatId) return chat;
                const messages = chat.messages.map(msg => {
                    if (msg.id !== messageId) return msg;
                    return { ...msg, activeVersion: versionIndex };
                });
                return { ...chat, messages };
            });
            return { ...state, chats };
        }

        case 'REORDER_SPACES':
            return { ...state, spaces: action.payload };

        default:
            return state;
    }
}

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { token } = useAuth();

    // Reload data when auth token changes (login/logout)
    useEffect(() => {
        async function loadData() {
            const [chats, spaces, settings] = await Promise.all([
                storage.getChats(),
                storage.getSpaces(),
                storage.getSettings(),
            ]);
            dispatch({ type: 'LOAD_DATA', payload: { chats, spaces, settings } });
        }
        loadData();
    }, [token]);

    // Debounce timers for UPDATE_CHAT: keyed by chatId
    const saveChatTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const asyncDispatch = useCallback(async (action: AppAction) => {
        dispatch(action);
        switch (action.type) {
            case 'SET_ACTIVE_CHAT': {
                const chatId = action.payload;
                if (chatId) {
                    const chat = state.chats.find(c => c.id === chatId);
                    if (chat && (!chat.messages || chat.messages.length === 0)) {
                        storage.getChatMessages(chatId).then(messages => {
                            if (messages.length > 0) {
                                dispatch({ type: 'UPDATE_CHAT_MESSAGES', payload: { chatId, messages } });
                            }
                        });
                    }
                }
                break;
            }
            case 'NEW_CHAT': {
                await storage.saveChat(action.payload);
                break;
            }
            case 'UPDATE_CHAT': {
                const chat = action.payload;
                // Debounce: cancel pending save for this chat and schedule a new one
                const existing = saveChatTimers.current.get(chat.id);
                if (existing) clearTimeout(existing);
                const timer = setTimeout(() => {
                    storage.saveChat(chat);
                    saveChatTimers.current.delete(chat.id);
                }, 2000);
                saveChatTimers.current.set(chat.id, timer);
                break;
            }
            case 'DELETE_CHAT':
                // If there's a pending save for this chat, cancel it
                const pendingTimer = saveChatTimers.current.get(action.payload);
                if (pendingTimer) {
                    clearTimeout(pendingTimer);
                    saveChatTimers.current.delete(action.payload);
                }
                await storage.deleteChat(action.payload);
                break;
            case 'SAVE_SPACE':
                await storage.saveSpace(action.payload);
                break;
            case 'DELETE_SPACE':
                await storage.deleteSpace(action.payload);
                break;
            case 'UPDATE_SETTINGS':
                await storage.saveSettings(action.payload);
                break;
            case 'SET_MESSAGE_VERSION': {
                const chat = state.chats.find(c => c.id === action.payload.chatId);
                if (chat) await storage.saveChat(chat);
                break;
            }
            case 'REORDER_SPACES': {
                await storage.saveAllSpaces(action.payload);
                break;
            }
        }
    }, []);


    return (
        <AppContext.Provider value={{ state, dispatch: asyncDispatch as Dispatch<AppAction> }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp(): AppContextValue {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
}
