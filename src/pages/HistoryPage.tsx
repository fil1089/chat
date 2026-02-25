import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IconHistory, IconSearch, IconTrash, IconMessage, IconCheck, IconClose, IconPlus, IconChevronDown } from '../components/Icons';
import type { Chat } from '../types';

type SortOption = 'newest' | 'oldest' | 'name';

export default function HistoryPage() {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortOption>('newest');
    const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
    const [selectMode, setSelectMode] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const sortedChats = useMemo(() => {
        let chats = [...state.chats];

        if (search) {
            const q = search.toLowerCase();
            chats = chats.filter(c =>
                c.title.toLowerCase().includes(q) ||
                c.messages.some(m => m.content.toLowerCase().includes(q))
            );
        }

        switch (sort) {
            case 'newest':
                chats.sort((a, b) => (b.updatedAt || b.timestamp || 0) - (a.updatedAt || a.timestamp || 0));
                break;
            case 'oldest':
                chats.sort((a, b) => (a.updatedAt || a.timestamp || 0) - (b.updatedAt || b.timestamp || 0));
                break;
            case 'name':
                chats.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        return chats;
    }, [state.chats, search, sort]);

    const toggleSelect = (chatId: string) => {
        const next = new Set(selectedChats);
        if (next.has(chatId)) {
            next.delete(chatId);
        } else {
            next.add(chatId);
        }
        setSelectedChats(next);
    };

    const handleDeleteSelected = () => {
        if (selectedChats.size === 0) return;
        if (!confirm(`Удалить ${selectedChats.size} чатов?`)) return;
        selectedChats.forEach(id => dispatch({ type: 'DELETE_CHAT', payload: id }));
        setSelectedChats(new Set());
        setSelectMode(false);
    };

    const handleSelectChat = (chat: Chat) => {
        if (selectMode) {
            toggleSelect(chat.id);
            return;
        }
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: chat.id });
        if (chat.spaceId) {
            dispatch({ type: 'SET_ACTIVE_SPACE', payload: chat.spaceId });
        } else {
            dispatch({ type: 'SET_ACTIVE_SPACE', payload: null });
        }
        navigate('/');
    };

    const formatDate = (timestamp: number | undefined) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const hasChats = state.chats.length > 0;

    return (
        <div className="page helpers-page history-page">
            {/* Top bar — same style as assistants page */}
            <div className="helpers-topbar">
                <h1 className="helpers-title">История</h1>
                {hasChats && (
                    <button
                        className="helpers-create-btn"
                        onClick={() => { dispatch({ type: 'SET_ACTIVE_CHAT', payload: null }); dispatch({ type: 'SET_ACTIVE_SPACE', payload: null }); navigate('/'); }}
                    >
                        <IconPlus size={16} />
                        <span>Новый чат</span>
                    </button>
                )}
            </div>

            {/* Search + filters + select */}
            {hasChats && (
                <div className="history-toolbar">
                    <div className="history-search-wrapper">
                        <input
                            type="text"
                            placeholder="Поиск в истории..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="history-toolbar-row">
                        <div className="history-toolbar-left">
                            {selectMode ? (
                                <div className="history-select-actions">
                                    <button className="btn-danger btn-sm" onClick={handleDeleteSelected} disabled={selectedChats.size === 0}>
                                        <IconTrash size={14} />
                                        <span>Удалить ({selectedChats.size})</span>
                                    </button>
                                    <button className="btn-ghost btn-sm" onClick={() => { setSelectMode(false); setSelectedChats(new Set()); }}>
                                        <IconClose size={14} />
                                        <span>Отмена</span>
                                    </button>
                                </div>
                            ) : (
                                <button className="history-select-btn" onClick={() => setSelectMode(true)}>
                                    <IconCheck size={14} />
                                    <span>Выбрать</span>
                                </button>
                            )}
                        </div>

                        <div className="history-toolbar-right">
                            <div className="custom-dropdown">
                                <button
                                    className="custom-dropdown-trigger"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                                >
                                    <span>{sort === 'newest' ? 'Новые' : sort === 'oldest' ? 'Старые' : 'По имени'}</span>
                                    <IconChevronDown size={14} />
                                </button>
                                {dropdownOpen && (
                                    <div className="custom-dropdown-options">
                                        <div
                                            className={`custom-dropdown-option ${sort === 'newest' ? 'active' : ''}`}
                                            onClick={() => { setSort('newest'); setDropdownOpen(false); }}
                                        >
                                            Новые
                                        </div>
                                        <div
                                            className={`custom-dropdown-option ${sort === 'oldest' ? 'active' : ''}`}
                                            onClick={() => { setSort('oldest'); setDropdownOpen(false); }}
                                        >
                                            Старые
                                        </div>
                                        <div
                                            className={`custom-dropdown-option ${sort === 'name' ? 'active' : ''}`}
                                            onClick={() => { setSort('name'); setDropdownOpen(false); }}
                                        >
                                            По имени
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat list */}
            {hasChats && (
                <div className="history-list">
                    {sortedChats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`history-item ${selectedChats.has(chat.id) ? 'selected' : ''}`}
                            onClick={() => handleSelectChat(chat)}
                        >
                            {selectMode && (
                                <div className={`history-item-checkbox ${selectedChats.has(chat.id) ? 'checked' : ''}`}>
                                    {selectedChats.has(chat.id) && <IconCheck size={12} />}
                                </div>
                            )}
                            <div className="history-item-main">
                                <div className="history-item-title">{chat.title}</div>
                                <div className="history-item-snippet">
                                    {(() => {
                                        const lastAssistant = [...chat.messages].reverse().find(m => m.role === 'assistant');
                                        if (lastAssistant) return lastAssistant.content.replace(/[#*`_~>\[\]]/g, '').slice(0, 200);
                                        const lastUser = [...chat.messages].reverse().find(m => m.role === 'user');
                                        return lastUser ? lastUser.content.slice(0, 200) : '';
                                    })()}
                                </div>
                                <div className="history-item-meta">
                                    <span>{chat.messages.length} сообщений</span>
                                    <span>{chat.model}</span>
                                    <span className="history-item-date">{formatDate(chat.updatedAt || chat.timestamp)}</span>
                                </div>
                            </div>
                            {!selectMode && (
                                <button className="history-item-delete" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_CHAT', payload: chat.id }); }}>
                                    <IconTrash size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {(!hasChats || sortedChats.length === 0) && (
                <div className="helpers-empty">
                    <div className="helpers-empty-icon">
                        <IconHistory size={48} />
                    </div>
                    <h2>{search ? 'Ничего не найдено' : 'История пуста'}</h2>
                    <p>{search ? 'Попробуйте изменить запрос' : 'Начните чат, чтобы он появился в истории'}</p>
                    <button className="helpers-create-btn" style={{ marginTop: '24px' }} onClick={() => { dispatch({ type: 'SET_ACTIVE_CHAT', payload: null }); dispatch({ type: 'SET_ACTIVE_SPACE', payload: null }); navigate('/'); }}>
                        <IconPlus size={16} />
                        <span>Новый чат</span>
                    </button>
                </div>
            )}
        </div>
    );
}
