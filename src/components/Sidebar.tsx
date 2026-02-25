import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IconPlus, IconSidebar, IconMessage, IconFolder, IconHistory, IconSettings, IconSearch, IconTrash, IconLogo, SpaceIcon, IconRobot, IconChevronDown } from './Icons';
import { v4 as uuidv4 } from 'uuid';
import type { Chat } from '../types';

export default function Sidebar() {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [spacesCollapsed, setSpacesCollapsed] = useState(false);

    const handleNewChat = () => {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: null });
        dispatch({ type: 'SET_ACTIVE_SPACE', payload: null });
        navigate('/');
    };



    const handleSelectChat = (chatId: string) => {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });
        const chat = state.chats.find(c => c.id === chatId);
        if (chat?.spaceId) {
            dispatch({ type: 'SET_ACTIVE_SPACE', payload: chat.spaceId });
        } else {
            dispatch({ type: 'SET_ACTIVE_SPACE', payload: null });
        }
        navigate('/');
    };

    const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        dispatch({ type: 'DELETE_CHAT', payload: chatId });
    };

    const filteredChats = state.chats.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const recentChats = filteredChats.slice(0, 20);

    return (
        <>
            {!state.sidebarOpen && (
                <button
                    className="sidebar-toggle-fixed"
                    onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                >
                    <IconSidebar size={18} />
                </button>
            )}
            <aside className={`sidebar ${state.sidebarOpen ? '' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo" onClick={handleNewChat} style={{ cursor: 'pointer' }}>
                        <IconLogo size={22} className="logo-svg" />
                        <span className="logo-text">AI Aggregator</span>
                    </div>
                    <button
                        className="sidebar-toggle"
                        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                    >
                        <IconSidebar size={18} />
                    </button>
                </div>

                <button className="new-chat-btn" onClick={handleNewChat}>
                    <IconPlus size={16} />
                    Новый чат
                </button>

                <div className="sidebar-nav">
                    <div className="nav-group">
                        <div className="nav-item-header">
                            <Link
                                to="/spaces"
                                className={`nav-item ${location.pathname === '/spaces' ? 'active' : ''}`}
                                onClick={() => dispatch({ type: 'SET_ACTIVE_CHAT', payload: null })}
                            >
                                <IconRobot size={20} />
                                <span>ИИ Помощники</span>
                            </Link>
                            <button
                                className={`collapse-toggle ${spacesCollapsed ? 'collapsed' : ''}`}
                                onClick={() => setSpacesCollapsed(!spacesCollapsed)}
                            >
                                <IconChevronDown size={14} />
                            </button>
                        </div>

                        {!spacesCollapsed && state.spaces.length > 0 && (
                            <div className="sidebar-sub-nav">
                                {state.spaces.map(space => (
                                    <Link
                                        key={space.id}
                                        to={`/space/${space.id}`}
                                        className={`sub-nav-item ${state.activeSpace === space.id ? 'active' : ''}`}
                                        onClick={() => {
                                            dispatch({ type: 'SET_ACTIVE_CHAT', payload: null });
                                            dispatch({ type: 'SET_ACTIVE_SPACE', payload: space.id });
                                        }}
                                    >
                                        <div className="sub-nav-icon">
                                            <SpaceIcon icon={space.icon || 'folder'} size={14} />
                                        </div>
                                        <span>{space.name}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        className={`nav-item ${location.pathname === '/history' ? 'active' : ''}`}
                        onClick={() => navigate('/history')}
                    >
                        <IconHistory size={16} className="nav-icon" />
                        <span>История</span>
                    </button>
                </div>

                <div className="sidebar-search">
                    <input
                        type="text"
                        placeholder="Поиск чатов..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="chat-list">
                    <div className="chat-list-header">Чаты</div>
                    {recentChats.length === 0 ? (
                        <div className="chat-list-empty">Нет чатов</div>
                    ) : (
                        recentChats.map((chat) => {
                            const space = chat.spaceId ? state.spaces.find(s => s.id === chat.spaceId) : null;
                            const isSearch = chat.model === 'you-search' || chat.model === 'you-research';
                            return (
                                <div
                                    key={chat.id}
                                    className={`chat-item ${state.activeChat === chat.id ? 'active' : ''}`}
                                    onClick={() => handleSelectChat(chat.id)}
                                >
                                    <div className="chat-icon-wrapper">
                                        {space ? (
                                            <SpaceIcon icon={space.icon || 'folder'} size={16} className="chat-space-icon" />
                                        ) : isSearch ? (
                                            <IconSearch size={16} className="chat-icon" />
                                        ) : (
                                            <IconMessage size={16} className="chat-icon" />
                                        )}
                                    </div>
                                    <div className="chat-item-content">
                                        <span className="chat-item-title">{chat.title}</span>
                                        {space && (
                                            <span className="chat-item-space-label">
                                                {space.name}
                                            </span>
                                        )}
                                        {isSearch && !space && (
                                            <span className="chat-item-search-label">
                                                ИИ Поиск
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        className="chat-item-delete"
                                        onClick={(e) => handleDeleteChat(e, chat.id)}
                                    >
                                        <IconTrash size={13} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="sidebar-divider" />

                <div className="sidebar-nav bottom-nav">
                    <button
                        className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
                        onClick={() => navigate('/settings')}
                    >
                        <IconSettings size={16} className="nav-icon" />
                        <span>Настройки</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
