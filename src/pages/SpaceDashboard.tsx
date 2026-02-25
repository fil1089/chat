import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ChatView from '../components/ChatView';
import ChatInput from '../components/ChatInput';
import { IconPlus, IconMessage, IconTrash, IconEdit, IconSettings, IconAttachment, IconHistory, SpaceIcon, IconChevronDown, IconChevronUp } from '../components/Icons';
import { v4 as uuidv4 } from 'uuid';
import type { Chat, Attachment } from '../types';

export default function SpaceDashboard() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [expandedPrompt, setExpandedPrompt] = useState(false);
    const [expandedDescription, setExpandedDescription] = useState(false);
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    const space = state.spaces.find((s) => s.id === id);
    if (!space) {
        return (
            <div className="page">
                <h1>Помощник не найден</h1>
                <button className="btn-primary" onClick={() => navigate('/spaces')}>Ко всем помощникам</button>
            </div>
        );
    }

    const spaceChats = state.chats.filter((c) => c.spaceId === space.id);

    const handleNewChat = (initialText?: string, attachments: Attachment[] = []) => {
        if (!initialText && attachments.length === 0) return;

        const chatId = uuidv4();
        const chat: Chat = {
            id: chatId,
            title: initialText?.slice(0, 50) || 'Новая беседа',
            messages: initialText ? [{
                id: uuidv4(),
                role: 'user',
                content: initialText,
                fullAttachments: attachments,
                timestamp: Date.now(),
            }] : [],
            model: selectedModel || space.model || state.settings.defaultModel || 'gpt-4o',
            spaceId: space.id,
            timestamp: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        dispatch({ type: 'NEW_CHAT', payload: chat });
        dispatch({ type: 'SET_ACTIVE_SPACE', payload: space.id });
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });
    };

    const handleSelectChat = (chatId: string) => {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });
        dispatch({ type: 'SET_ACTIVE_SPACE', payload: space.id });
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
                        <SpaceIcon icon={space.icon || 'folder'} size={40} />
                        <div>
                            <h1 style={{ margin: 0, fontSize: '24px' }}>{space.name}</h1>
                            {space.description && <p className="page-subtitle" style={{ margin: '4px 0 0' }}>{space.description}</p>}
                        </div>
                    </div>
                </div>

                <div className="space-dashboard-content">
                    <div className="space-chats">
                        <h2 className="section-title">История чатов</h2>
                        {spaceChats.length > 0 && (
                            <div className="chats-list">
                                {spaceChats.map((chat) => (
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
                                                {chat.messages.length > 0 && (
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
                        placeholder={`Спросить ${space.name}...`}
                        model={selectedModel || space.model || state.settings.defaultModel || 'gpt-4o'}
                        onModelChange={setSelectedModel}
                        isStreaming={false}
                        onStop={() => { }}
                        hideModelSelector={false}
                        contextMode="full"
                        contextN={20}
                        onContextModeChange={() => { }}
                        onContextNChange={() => { }}
                    />
                </div>
            </div>

            <div className="space-dashboard-sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-section-header" onClick={() => setExpandedPrompt(!expandedPrompt)}>
                        <h3>Системный промт</h3>
                        {expandedPrompt ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                    </div>
                    <p className={!expandedPrompt ? 'line-clamp-3' : ''} style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)', marginTop: '12px' }}>
                        {space.instructions || 'Инструкции не заданы'}
                    </p>
                    {!expandedPrompt && space.instructions && space.instructions.length > 100 && (
                        <button className="sidebar-show-more" onClick={() => setExpandedPrompt(true)}>Показать полностью</button>
                    )}
                </div>

                <div className="sidebar-divider" style={{ margin: '16px 0', opacity: 0.1 }} />

                <div className="sidebar-section">
                    <div className="sidebar-section-header" onClick={() => setExpandedDescription(!expandedDescription)}>
                        <h3>Описание</h3>
                        {expandedDescription ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                    </div>
                    <p className={!expandedDescription ? 'line-clamp-3' : ''} style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)', marginTop: '12px' }}>
                        {space.description || 'Описание не задано'}
                    </p>
                    {!expandedDescription && space.description && space.description.length > 50 && (
                        <button className="sidebar-show-more" onClick={() => setExpandedDescription(true)}>Показать полностью</button>
                    )}
                </div>

                <div className="sidebar-divider" style={{ margin: '16px 0', opacity: 0.1 }} />

                {space.files && space.files.length > 0 && (
                    <div className="sidebar-section">
                        <h3>Прикрепленные файлы ({space.files.length})</h3>
                        <div className="sidebar-file-list" style={{ marginTop: '12px' }}>
                            {space.files.map((file, i) => (
                                <div key={i} className="sidebar-file-item" style={{ marginBottom: '8px' }}>
                                    <IconAttachment size={14} />
                                    <span>{file.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="sidebar-section" style={{ marginTop: 'auto' }}>
                    <button className="btn-secondary" style={{ width: '100%' }} onClick={() => navigate(`/spaces?edit=${space.id}`)}>
                        <IconEdit size={16} /> Редактировать помощника
                    </button>
                </div>
            </div>
        </div>
    );
}
