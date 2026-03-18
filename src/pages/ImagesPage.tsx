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
    const isPolza = true;
    const defaultImageModel = isPolza ? 'openai/dall-e-3' : 'gemini-3-pro-image-preview';

    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [imageModel, setImageModel] = useState(defaultImageModel);
    const [contextMode, setContextMode] = useState<ContextMode>('full');
    const [contextN, setContextN] = useState(20);

    const imageChats = state.chats.filter((c) => {
        // Find chats that use image models tracking any model in Image category
        const isPolzaImage = c.model === 'openai/dall-e-3' || c.model.includes('flux') || c.model.includes('midjourney') || c.model.includes('stable-diffusion');
        return isPolzaImage;
    });

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
            model: imageModel,
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
        <div className="space-dashboard-layout">
            <div className="space-dashboard-main">
                <div className="page-header" style={{ padding: '24px 24px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="space-icon-lg" style={{ width: 40, height: 40, background: 'var(--accent)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <IconImage size={24} />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '24px' }}>Генерация изображений</h1>
                            <p className="page-subtitle" style={{ margin: '4px 0 0' }}>
                                Создавайте изображения с помощью лучших моделей: Gemini, DALL-E 3, Flux и Midjourney.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-dashboard-content">
                    <div className="space-chats">
                        <h2 className="section-title">История генераций</h2>
                        {imageChats.length > 0 && (
                            <div className="chats-list">
                                {imageChats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className="chat-list-item"
                                        onClick={() => editingChatId !== chat.id && handleSelectChat(chat.id)}
                                    >
                                        <div className="chat-list-main">
                                            <IconMessage size={18} />
                                            <div className="chat-list-info">
                                                {editingChatId === chat.id ? (
                                                    <input
                                                        id="image-chat-rename-input"
                                                        name="imageChatRename"
                                                        autoFocus
                                                        className="chat-rename-input"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        onBlur={() => handleSaveRename(chat.id)}
                                                        onKeyDown={(e) => handleKeyDown(e, chat.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <span className="chat-list-title">{chat.title}</span>
                                                )}
                                                {chat.messages.length > 0 && chat.messages[0].content && (
                                                    <div className="chat-list-preview">
                                                        {chat.messages[0].content}
                                                    </div>
                                                )}
                                                <span className="chat-list-meta">
                                                    {chat.messages.length} сообщений • {new Date(chat.updatedAt || chat.timestamp || Date.now()).toLocaleDateString('ru-RU')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="chat-list-actions">
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

                <div className="space-input-container">
                    <ChatInput
                        onSend={(text, attachments) => handleNewChat(text, attachments)}
                        placeholder="Опишите изображение..."
                        model={imageModel}
                        onModelChange={setImageModel}
                        isStreaming={false}
                        onStop={() => { }}
                        hideModelSelector={false}
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

            <div className="space-dashboard-sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-section-header">
                        <h3>Описание</h3>
                    </div>
                    <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)', marginTop: '12px' }}>
                        Этот раздел предназначен исключительно для расширенной генерации изображений.
                        Здесь вы можете выбрать специализированную модель,
                        которая позволяет настраивать разрешение и качество картинки прямо над строкой ввода.
                    </p>
                </div>

                <div className="sidebar-divider" style={{ margin: '16px 0', opacity: 0.1 }} />

                <div className="sidebar-section">
                    <h3>Особенности</h3>
                    <ul style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)', marginTop: '12px', paddingLeft: '20px' }}>
                        <li style={{ marginBottom: '8px' }}>Быстрый выбор пропорций (например, 16:9, 1:1, 9:16)</li>
                        <li style={{ marginBottom: '8px' }}>Настройка качества от 1K до 4K</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
