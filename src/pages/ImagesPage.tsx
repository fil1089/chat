import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ChatView from '../components/ChatView';
import ChatInput from '../components/ChatInput';
import { IconMessage, IconTrash, IconEdit, IconImage } from '../components/Icons';
import { v4 as uuidv4 } from 'uuid';
import type { Chat, Attachment, ContextMode } from '../types';

export default function ImagesPage() {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [contextMode, setContextMode] = useState<ContextMode>('full');
    const [contextN, setContextN] = useState(20);

    const imageChats = state.chats.filter((c) => c.model === 'gemini-3-pro-image-preview');

    const handleNewChat = (initialText?: string, attachments: Attachment[] = []) => {
        if (!initialText && attachments.length === 0) return;

        const chatId = uuidv4();
        const chat: Chat = {
            id: chatId,
            title: initialText?.slice(0, 50) || 'Новая генерация',
            messages: initialText ? [{
                id: uuidv4(),
                role: 'user',
                content: initialText,
                fullAttachments: attachments,
                timestamp: Date.now(),
            }] : [],
            model: 'gemini-3-pro-image-preview',
            timestamp: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        dispatch({ type: 'NEW_CHAT', payload: chat });
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });
        dispatch({ type: 'SET_ACTIVE_SPACE', payload: null });
    };

    const handleSelectChat = (chatId: string) => {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });
        dispatch({ type: 'SET_ACTIVE_SPACE', payload: null });
    };

    const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        dispatch({ type: 'DELETE_CHAT', payload: chatId });
    };

    const handleStartRename = (e: React.MouseEvent, chat: Chat) => {
        e.stopPropagation();
        setEditingChatId(chat.id);
        setEditTitle(chat.title);
    };

    const handleSaveRename = (chatId: string) => {
        if (editTitle.trim()) {
            const chat = state.chats.find(c => c.id === chatId);
            if (chat) {
                dispatch({
                    type: 'UPDATE_CHAT',
                    payload: { ...chat, title: editTitle.trim(), updatedAt: Date.now() }
                });
            }
        }
        setEditingChatId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent, chatId: string) => {
        if (e.key === 'Enter') handleSaveRename(chatId);
        if (e.key === 'Escape') setEditingChatId(null);
    };

    if (state.activeChat) {
        return <ChatView />;
    }

    return (
        <div className="space-dashboard">
            <div className="space-dashboard-main" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <div className="space-header" style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div className="space-icon-lg" style={{ width: 80, height: 80, margin: '0 auto 20px', background: 'var(--accent)', color: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px var(--accent-alpha)' }}>
                        <IconImage size={40} />
                    </div>
                    <h1>Генерация изображений</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                        Создавайте изображения с помощью модели Gemini 3 Pro Image Preview.
                    </p>
                </div>

                <div className="space-content" style={{ padding: '0 20px 120px' }}>
                    <div className="space-chats-section">
                        {imageChats.length > 0 && (
                            <div className="space-chats-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)', maxWidth: '600px', margin: '0 auto' }}>
                                {imageChats.map((chat) => (
                                    <div key={chat.id} className="space-chat-card" onClick={() => handleSelectChat(chat.id)} style={{ padding: '16px' }}>
                                        <div className="chat-card-content">
                                            <div className="chat-card-icon" style={{ background: 'var(--surface-hover)', alignSelf: 'center' }}>
                                                <IconMessage size={18} />
                                            </div>
                                            <div className="chat-card-info">
                                                {editingChatId === chat.id ? (
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(e, chat.id)}
                                                        onBlur={() => handleSaveRename(chat.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        autoFocus
                                                        className="rename-input"
                                                    />
                                                ) : (
                                                    <h4>{chat.title}</h4>
                                                )}
                                                <span className="chat-card-meta">
                                                    {chat.messages.length} сообщений • {new Date(chat.updatedAt || chat.timestamp || Date.now()).toLocaleDateString('ru-RU')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="chat-list-actions" style={{ marginLeft: 'auto' }}>
                                            <button className="btn-ghost btn-sm action-btn" onClick={(e) => handleStartRename(e, chat)}>
                                                <IconEdit size={14} />
                                            </button>
                                            <button className="btn-ghost btn-sm action-btn delete-btn" onClick={(e) => handleDeleteChat(e, chat.id)}>
                                                <IconTrash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-input-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <ChatInput
                        onSend={(text, attachments) => handleNewChat(text, attachments)}
                        placeholder="Опишите изображение..."
                        model="gemini-3-pro-image-preview"
                        onModelChange={() => { }}
                        isStreaming={false}
                        onStop={() => { }}
                        hideModelSelector={true}
                        contextMode={contextMode}
                        contextN={contextN}
                        onContextModeChange={setContextMode}
                        onContextNChange={setContextN}
                        hasSystemInstruction={false}
                        imageSize={state.settings.imageSize || '1024x1024'}
                        onImageSizeChange={(size) => dispatch({ type: 'UPDATE_SETTINGS', payload: { imageSize: size } })}
                        imageQuality={state.settings.imageQuality || 'high'}
                        onImageQualityChange={(quality) => dispatch({ type: 'UPDATE_SETTINGS', payload: { imageQuality: quality } })}
                    />
                </div>
            </div>
        </div>
    );
}
