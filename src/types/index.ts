// ===== Core Types =====

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    displayContent?: string;
    attachments?: { name: string; size: number }[];
    timestamp?: number;
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

export interface SpaceFile {
    name: string;
    content: string;
}

export interface Space {
    id: string;
    name: string;
    description?: string;
    instructions?: string;
    icon?: string;
    model?: string;
    files?: SpaceFile[];
    createdAt?: number;
    updatedAt?: number;
}

export interface Settings {
    apiKey: string;
    youApiKey: string;
    defaultModel: string;
    theme: string;
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
    | { type: 'SET_SIDEBAR'; payload: boolean };

// ===== Model Types =====

export interface AIModel {
    id: string;
    name: string;
    category: string;
    desc: string;
}

export interface StreamCallbacks {
    onDelta?: (delta: string) => void;
    onStatus?: (status: StatusEvent) => void;
    onDone?: () => void;
    onError?: (error: string) => void;
}

export interface StatusEvent {
    type: 'status' | 'search' | 'thought';
    message: string;
}

export interface Attachment {
    name: string;
    content: string;
    size: number;
}

// ===== Icon Props =====

export interface IconProps {
    size?: number;
    className?: string;
}
