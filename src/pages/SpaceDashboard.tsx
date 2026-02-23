import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ChatView from '../components/ChatView';
import ChatInput from '../components/ChatInput';
import { IconPlus, IconMessage, IconTrash, IconEdit, IconSettings, SpaceIcon } from '../components/Icons';
import { v4 as uuidv4 } from 'uuid';
import type { Chat, Attachment } from '../types';

export default function SpaceDashboard() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const [showChat, setShowChat] = useState(false);

    const space = state.spaces.find((s) => s.id === id);
    if (!space) {
        return (
            <div className="page">
                <h1>Пространство не найдено</h1>
                <button className="btn-primary" onClick={() => navigate('/spaces')}>К пространствам</button>
            </div>
        );
    }

    const spaceChats = state.chats.filter((c) => c.spaceId === space.id);

    const handleNewChat = () => {
        const chat: Chat = {
            id: uuidv4(),
            title: 'Новый чат',
            messages: [],
            model: space.model || state.settings.defaultModel || 'gpt-4o',
            spaceId: space.id,
            timestamp: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        dispatch({ type: 'NEW_CHAT', payload: chat });
        dispatch({ type: 'SET_ACTIVE_SPACE', payload: space.id });
        setShowChat(true);
    };

    const handleSelectChat = (chatId: string) => {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });
        dispatch({ type: 'SET_ACTIVE_SPACE', payload: space.id });
        setShowChat(true);
    };

    const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        dispatch({ type: 'DELETE_CHAT', payload: chatId });
    };

    if (showChat || state.activeChat) {
        return <ChatView />;
    }

    return (
        <div className="page space-dashboard">
            <div className="page-header">
                <SpaceIcon icon={space.icon || 'folder'} size={32} />
                <div>
                    <h1>{space.name}</h1>
                    {space.description && <p className="page-subtitle">{space.description}</p>}
                </div>
                <button className="btn-ghost" onClick={() => navigate('/spaces')}>
                    <IconSettings size={18} />
                </button>
            </div>

            {space.instructions && (
                <div className="space-instructions">
                    <h3>Системные инструкции</h3>
                    <p>{space.instructions}</p>
                </div>
            )}

            <div className="space-actions">
                <button className="btn-primary" onClick={handleNewChat}>
                    <IconPlus size={18} /> Новый чат
                </button>
            </div>

            <div className="space-chats">
                <h2>Чаты ({spaceChats.length})</h2>
                {spaceChats.length === 0 ? (
                    <div className="empty-state">
                        <IconMessage size={32} />
                        <p>Нет чатов в этом пространстве</p>
                    </div>
                ) : (
                    <div className="chats-list">
                        {spaceChats.map((chat) => (
                            <div
                                key={chat.id}
                                className="chat-list-item"
                                onClick={() => handleSelectChat(chat.id)}
                            >
                                <IconMessage size={18} />
                                <div className="chat-list-info">
                                    <span className="chat-list-title">{chat.title}</span>
                                    <span className="chat-list-meta">
                                        {chat.messages.length} сообщений • {new Date(chat.updatedAt || chat.timestamp || Date.now()).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>
                                <button className="btn-ghost btn-sm" onClick={(e) => handleDeleteChat(e, chat.id)}>
                                    <IconTrash size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
