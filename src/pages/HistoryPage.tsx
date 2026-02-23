import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IconHistory, IconSearch, IconTrash, IconMessage, IconCheck, IconClose } from '../components/Icons';
import type { Chat } from '../types';

type SortOption = 'newest' | 'oldest' | 'name';

export default function HistoryPage() {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortOption>('newest');
    const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
    const [selectMode, setSelectMode] = useState(false);

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

    return (
        <div className="page history-page">
            <div className="page-header">
                <IconHistory size={28} />
                <h1>История</h1>
                <div className="page-header-actions">
                    {selectMode ? (
                        <>
                            <button className="btn-danger btn-sm" onClick={handleDeleteSelected} disabled={selectedChats.size === 0}>
                                <IconTrash size={16} /> Удалить ({selectedChats.size})
                            </button>
                            <button className="btn-ghost btn-sm" onClick={() => { setSelectMode(false); setSelectedChats(new Set()); }}>
                                <IconClose size={16} /> Отмена
                            </button>
                        </>
                    ) : (
                        <button className="btn-ghost btn-sm" onClick={() => setSelectMode(true)}>
                            <IconCheck size={16} /> Выбрать
                        </button>
                    )}
                </div>
            </div>

            <div className="history-search-container">
                <div className="history-search-wrapper">
                    <input
                        type="text"
                        placeholder="Поиск в истории..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="history-filters">
                <div className="filter-sort-wrapper">
                    <select className="filter-dropdown" value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
                        <option value="newest">Новые</option>
                        <option value="oldest">Старые</option>
                        <option value="name">По имени</option>
                    </select>
                </div>
            </div>

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

            {sortedChats.length === 0 && (
                <div className="empty-state">
                    <IconHistory size={48} />
                    <h2>{search ? 'Ничего не найдено' : 'История пуста'}</h2>
                    <p>{search ? 'Попробуйте изменить запрос' : 'Начните чат, чтобы он появился в истории'}</p>
                </div>
            )}
        </div>
    );
}
