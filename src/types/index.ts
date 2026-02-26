// ===== Core Types =====

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    displayContent?: string;
    model?: string;
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number; cost_rub?: number };
    attachments?: { name: string; size: number }[];
    fullAttachments?: Attachment[];
    timestamp?: number;
    reasoningContent?: string;
    annotations?: any[];
    versions?: {
        content: string;
        model?: string;
        usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number; cost_rub?: number };
        timestamp?: number;
        reasoningContent?: string;
        annotations?: any[];
    }[];
    activeVersion?: number;
}

export interface Chat {
    id: string;
    title: string;
    messages: Message[];
    model: string;
    spaceId?: string;
    timestamp?: number;
    createdAt?: number;
    updatedAt?: number;
}

export interface Space {
    id: string;
    name: string;
    description?: string;
    instructions?: string;
    icon?: string;
    color?: string;
    model?: string;
    files?: Attachment[];
    createdAt?: number;
    updatedAt?: number;
}

export type ContextMode = 'full' | 'last_n' | 'system_only';

export interface Settings {
    apiKey: string;
    youApiKey: string;
    polzaApiKey: string;
    apiProvider: 'neuro' | 'polza';
    defaultModel: string;
    theme: string;
    imageSize?: string;
    imageQuality?: string;
    enableReasoning: boolean;
    enableWebSearch?: boolean;
}

export interface AppState {
    chats: Chat[];
    activeChat: string | null;
    spaces: Space[];
    activeSpace: string | null;
    settings: Settings;
    sidebarOpen: boolean;
    storageReady: boolean;
}

// ===== Action Types =====

export type AppAction =
    | { type: 'LOAD_DATA'; payload: { chats: Chat[]; spaces: Space[]; settings: Settings } }
    | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
    | { type: 'NEW_CHAT'; payload: Chat }
    | { type: 'UPDATE_CHAT'; payload: Chat }
    | { type: 'DELETE_CHAT'; payload: string }
    | { type: 'SET_ACTIVE_SPACE'; payload: string | null }
    | { type: 'SAVE_SPACE'; payload: Space }
    | { type: 'DELETE_SPACE'; payload: string }
    | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
    | { type: 'TOGGLE_SIDEBAR' }
    | { type: 'SET_SIDEBAR'; payload: boolean }
    | { type: 'SET_MESSAGE_VERSION'; payload: { chatId: string; messageId: string; versionIndex: number } }
    | { type: 'REORDER_SPACES'; payload: Space[] };

// ===== Model Types =====

export interface AIModel {
    id: string;
    name: string;
    category: string;
    desc: string;
    isActual?: boolean;
}

export interface StreamCallbacks {
    onDelta?: (delta: string) => void;
    onStatus?: (status: StatusEvent) => void;
    onDone?: () => void;
    onError?: (error: string) => void;
}

export interface StatusEvent {
    type: 'status' | 'search' | 'thought' | 'reasoning';
    message: string;
}

export interface Attachment {
    name: string;
    content: string;
    size: number;
    type: 'image' | 'text' | 'file';
    mimeType?: string;
}

// ===== Icon Props =====

export interface IconProps {
    size?: number;
    className?: string;
}
