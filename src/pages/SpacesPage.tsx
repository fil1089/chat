import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IconPlus, IconTrash, IconEdit, IconRobot, IconHistory, IconMessage, IconAttachment, SpaceIcon, IconInfo, IconClose, IconFolder, IconSearch, IconBriefcase, IconGlobe, IconCrystalBall, SPACE_ICON_MAP } from '../components/Icons';
import ModelSelector from '../components/ModelSelector';
import { v4 as uuidv4 } from 'uuid';
import type { Space, Attachment } from '../types';

export default function SpacesPage() {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const [editing, setEditing] = useState<Space | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<{
        name: string;
        description: string;
        instructions: string;
        icon: string;
        color: string;
        model: string;
        files: Attachment[];
        isPublic: boolean;
        authorName: string;
    }>({
        name: '',
        description: '',
        instructions: '',
        icon: 'folder',
        color: '',
        model: 'gpt-4o',
        files: [],
        isPublic: false,
        authorName: '',
    });

    const [activeTab, setActiveTab] = useState<'mine' | 'public'>('mine');
    const [publicSpaces, setPublicSpaces] = useState<Space[]>([]);
    const [isLoadingPublic, setIsLoadingPublic] = useState(false);

    useEffect(() => {
        if (activeTab === 'public') {
            const loadPublic = async () => {
                setIsLoadingPublic(true);
                try {
                    // Dynamic import to avoid circular dependencies if any, or just import it at top
                    const { getPublicSpaces } = await import('../services/storage');
                    const spaces = await getPublicSpaces();
                    setPublicSpaces(spaces);
                } catch (e) {
                    console.error("Failed to load public spaces", e);
                } finally {
                    setIsLoadingPublic(false);
                }
            };
            loadPublic();
        }
    }, [activeTab]);

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const editId = query.get('edit');
        if (editId) {
            const spaceToEdit = state.spaces.find(s => s.id === editId);
            if (spaceToEdit) {
                handleEdit(spaceToEdit);
                // Clear the query parameter to prevent loop
                navigate('/spaces', { replace: true });
            }
        }
    }, [location.search, state.spaces, navigate]);

    const iconKeys = Object.keys(SPACE_ICON_MAP);

    const [selectedSpaceForInfo, setSelectedSpaceForInfo] = useState<Space | null>(null);

    const resetForm = () => {
        setForm({ name: '', description: '', instructions: '', icon: 'folder', color: '', model: 'gpt-4o', files: [], isPublic: false, authorName: '' });
        setEditing(null);
        setShowForm(false);
    };

    const handleSave = () => {
        if (!form.name.trim()) return;

        const space: Space = {
            id: editing?.id || uuidv4(),
            name: form.name,
            description: form.description,
            instructions: form.instructions,
            icon: form.icon,
            color: form.color || undefined,
            model: form.model,
            files: form.files,
            isPublic: form.isPublic,
            authorName: form.isPublic ? (form.authorName.trim() || 'Аноним') : undefined,
            createdAt: editing?.createdAt || Date.now(),
            updatedAt: Date.now(),
        };

        dispatch({ type: 'SAVE_SPACE', payload: space });
        resetForm();
    };

    const handleEdit = (space: Space) => {
        setForm({
            name: space.name,
            description: space.description || '',
            instructions: space.instructions || '',
            icon: space.icon || 'folder',
            color: space.color || '',
            model: space.model || 'gpt-4o',
            files: space.files || [],
            isPublic: !!space.isPublic,
            authorName: space.authorName || '',
        });
        setEditing(space);
        setShowForm(true);
    };

    const handleDelete = (spaceId: string) => {
        if (confirm('Удалить помощника и все связанные чаты?')) {
            dispatch({ type: 'DELETE_SPACE', payload: spaceId });
        }
    };

    const formatDate = (ts: number) => {
        return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    const [activeActionsId, setActiveActionsId] = useState<string | null>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleTouchStart = (id: string) => {
        longPressTimer.current = setTimeout(() => {
            setActiveActionsId(id);
            if (navigator.vibrate) navigator.vibrate(50);
        }, 600);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    // Close actions menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveActionsId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="page helpers-page">
            {/* Top bar */}
            <div className="helpers-topbar">
                <div className="helpers-topbar-tabs">
                    <button className={`helpers-tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
                        Мои помощники
                    </button>
                    <button className={`helpers-tab ${activeTab === 'public' ? 'active' : ''}`} onClick={() => setActiveTab('public')}>
                        Публичные
                    </button>
                </div>
                <button className="helpers-create-btn" onClick={() => { resetForm(); setShowForm(true); }}>
                    <IconPlus size={16} />
                    <span>Создать</span>
                </button>
            </div>

            {/* Editor modal */}
            {showForm && (
                <div className="helpers-modal-overlay" onClick={resetForm}>
                    <div className="helpers-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{editing ? 'Редактировать' : 'Новый помощник'}</h2>
                        <div className="form-row">
                            <label>Название</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Название помощника"
                            />
                        </div>
                        <div className="form-row">
                            <label>Описание</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Краткое описание (поддерживаются переносы строк)"
                                rows={6}
                                style={{ resize: 'vertical', minHeight: '120px' }}
                            />
                        </div>
                        <div className="form-row">
                            <label>Системные инструкции</label>
                            <textarea
                                value={form.instructions}
                                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                                placeholder="Инструкции для ИИ..."
                                rows={4}
                            />
                        </div>
                        <div className="form-row">
                            <label>Файлы для контекста</label>
                            <div className="form-files">
                                {form.files.map((file, i) => (
                                    <div key={i} className="form-file-item">
                                        <IconAttachment size={14} />
                                        <span>{file.name}</span>
                                        <button onClick={() => setForm({ ...form, files: form.files.filter((_, idx) => idx !== i) })}>
                                            <IconTrash size={12} />
                                        </button>
                                    </div>
                                ))}
                                <button className="btn-add-file" onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.multiple = true;
                                    input.onchange = async (e) => {
                                        const files = Array.from((e.target as HTMLInputElement).files || []);
                                        const newAttachments: Attachment[] = await Promise.all(files.map(async f => ({
                                            id: uuidv4(),
                                            name: f.name,
                                            size: f.size,
                                            type: f.type.startsWith('image/') ? 'image' : 'text',
                                            content: await (f.type.startsWith('image/') ?
                                                new Promise<string>(r => {
                                                    const reader = new FileReader();
                                                    reader.onload = (ev) => r(ev.target?.result as string);
                                                    reader.readAsDataURL(f);
                                                }) : f.text())
                                        })));
                                        setForm(prev => ({ ...prev, files: [...prev.files, ...newAttachments] }));
                                    };
                                    input.click();
                                }}>
                                    <IconPlus size={14} /> Добавить файлы
                                </button>
                            </div>
                        </div>
                        <div className="form-row">
                            <label>Модель для ответов</label>
                            <ModelSelector
                                model={form.model}
                                onModelChange={(m) => setForm({ ...form, model: m })}
                                direction="down"
                                constrained={true}
                            />
                        </div>
                        <div className="form-row">
                            <label>Иконка</label>
                            <div className="icon-picker">
                                {iconKeys.map((key) => (
                                    <button
                                        key={key}
                                        className={`icon-btn ${form.icon === key ? 'active' : ''}`}
                                        onClick={() => setForm({ ...form, icon: key })}
                                    >
                                        <SpaceIcon icon={key} size={20} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="form-row">
                            <label>Цвет плитки</label>
                            <div className="color-picker-row">
                                {['', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#14b8a6', '#a855f7', '#e11d48', '#0ea5e9', '#84cc16', '#d946ef', '#f59e0b', '#10b981', '#818cf8', '#fb7185'].map(c => (
                                    <button
                                        key={c}
                                        className={`color-swatch ${form.color === c ? 'active' : ''}`}
                                        style={{ background: c || 'var(--bg-elevated)', border: c ? 'none' : '2px dashed var(--border)' }}
                                        onClick={() => setForm({ ...form, color: c })}
                                        title={c || 'Без цвета'}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="form-row">
                            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={form.isPublic}
                                    onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                                />
                                <span>Сделать публичным (опубликовать для всех)</span>
                            </label>
                        </div>
                        {form.isPublic && (
                            <div className="form-row" style={{ marginTop: '0' }}>
                                <label>Имя автора (опционально)</label>
                                <input
                                    type="text"
                                    value={form.authorName}
                                    onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                                    placeholder="Например: Иван Иванов"
                                />
                                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                    Ваш помощник (без истории чатов) будет доступен другим пользователям.
                                </div>
                            </div>
                        )}
                        <div className="editor-actions">
                            <button className="btn-secondary" onClick={resetForm}>Отмена</button>
                            <button className="btn-primary" onClick={handleSave}>
                                {editing ? 'Сохранить' : 'Создать'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid of helpers */}
            {activeTab === 'mine' ? (
                state.spaces.length > 0 ? (
                    <div className="helpers-section">
                        <h3 className="helpers-section-title">Мои помощники</h3>
                        <div className="helpers-grid">
                            {state.spaces.map((space, index) => (
                                <div
                                    key={space.id}
                                    className={`helper-card ${activeActionsId === space.id ? 'actions-open' : ''}`}
                                    draggable
                                    onDragStart={() => { dragItem.current = index; }}
                                    onDragEnter={() => { dragOverItem.current = index; }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDragEnd={() => {
                                        if (dragItem.current === null || dragOverItem.current === null) return;
                                        const items = [...state.spaces];
                                        const [removed] = items.splice(dragItem.current, 1);
                                        items.splice(dragOverItem.current, 0, removed);
                                        dispatch({ type: 'REORDER_SPACES', payload: items });
                                        dragItem.current = null;
                                        dragOverItem.current = null;
                                    }}
                                    onTouchStart={() => handleTouchStart(space.id)}
                                    onTouchEnd={handleTouchEnd}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        setActiveActionsId(space.id);
                                    }}
                                    onClick={(e) => {
                                        if (activeActionsId === space.id) {
                                            e.stopPropagation();
                                            return;
                                        }
                                        if (window.innerWidth <= 768) {
                                            dispatch({ type: 'SET_SIDEBAR', payload: false });
                                        }
                                        dispatch({ type: 'SET_ACTIVE_CHAT', payload: null });
                                        dispatch({ type: 'SET_ACTIVE_SPACE', payload: space.id });
                                        navigate(`/space/${space.id}`);
                                    }}
                                    style={{
                                        borderTopColor: space.color || 'transparent',
                                        borderTopWidth: space.color ? '3px' : '1px',
                                        '--theme-color': space.color || 'var(--accent-primary)'
                                    } as React.CSSProperties}
                                >
                                    <div className="helper-card-icon">
                                        <SpaceIcon icon={space.icon || 'folder'} size={28} />
                                    </div>
                                    <div className="helper-card-name">{space.name}</div>
                                    <div className="helper-card-meta">
                                        <div className="meta-item">
                                            <IconHistory size={12} />
                                            <span>{formatDate(space.createdAt || Date.now())}</span>
                                        </div>
                                        <div className="meta-item">
                                            <IconMessage size={12} />
                                            <span>{state.chats.filter(c => c.spaceId === space.id).length}</span>
                                        </div>
                                    </div>

                                    <button 
                                            className="helper-info-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedSpaceForInfo(space);
                                            }}
                                            title="Информация"
                                        >
                                            <IconInfo size={18} />
                                        </button>
                                    
                                    <div className={`helper-actions-menu ${activeActionsId === space.id ? 'visible' : ''}`} onClick={(e) => e.stopPropagation()}>
                                    <button className="action-menu-item" onClick={(e) => { e.stopPropagation(); handleEdit(space); setActiveActionsId(null); }}>
                                        <IconEdit size={16} />
                                        <span>Изменить</span>
                                    </button>
                                    <button className="action-menu-item delete" onClick={(e) => { e.stopPropagation(); handleDelete(space.id); setActiveActionsId(null); }}>
                                        <IconTrash size={16} />
                                        <span>Удалить</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="helpers-empty">
                    <div className="helpers-empty-icon">
                        <IconRobot size={48} />
                    </div>
                    <h2>Нет помощников</h2>
                    <p>Создайте ИИ помощника с настроенными инструкциями для специализированных задач</p>
                    <button className="helpers-create-btn" style={{ marginTop: '24px' }} onClick={() => { resetForm(); setShowForm(true); }}>
                        <IconPlus size={16} />
                        <span>Новый помощник</span>
                    </button>
                </div>
            )) : (
                <div className="helpers-section">
                    <h3 className="helpers-section-title">Публичные помощники</h3>
                    {isLoadingPublic ? (
                        <div className="helpers-empty">
                            <p>Загрузка...</p>
                        </div>
                    ) : publicSpaces.length > 0 ? (
                        <div className="helpers-grid">
                            {publicSpaces.map((space) => {
                                const hasAlready = state.spaces.some(s => s.id === space.id);
                                return (
                                    <div
                                        key={space.id}
                                        className="helper-card"
                                        style={{
                                            borderTopWidth: space.color ? '3px' : '1px',
                                            '--theme-color': space.color || 'var(--accent-primary)',
                                            cursor: hasAlready ? 'default' : 'pointer',
                                            opacity: hasAlready ? 0.6 : 1
                                        } as React.CSSProperties}
                                    >
                                        <div className="helper-card-icon">
                                            <SpaceIcon icon={space.icon || 'folder'} size={28} />
                                        </div>
                                        <div className="helper-card-name">{space.name}</div>
                                        {space.description && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{space.description}</div>}
                                        <div className="helper-card-meta" style={{ marginTop: 'auto', paddingTop: '12px' }}>
                                            <div className="meta-item">
                                                <span>Автор: {space.authorName || 'Аноним'}</span>
                                            </div>
                                        </div>
                                        
                                        {!hasAlready ? (
                                            <button 
                                                className="btn-primary" 
                                                style={{ marginTop: '12px', width: '100%', padding: '6px' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    dispatch({ type: 'SAVE_SPACE', payload: { ...space, id: uuidv4(), isPublic: false } });
                                                    setActiveTab('mine');
                                                }}
                                            >
                                                Добавить себе
                                            </button>
                                        ) : (
                                            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                                                Уже добавлен
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="helpers-empty">
                            <div className="helpers-empty-icon">
                                <IconRobot size={48} />
                            </div>
                            <h2>Пусто</h2>
                            <p>Пока никто не опубликовал помощников. Вы можете стать первым!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Footer removed, button moved to topbar/empty state */}
            {/* Local Info Panel */}
            {selectedSpaceForInfo && (
                <>
                    <div className="info-panel-overlay" onClick={() => setSelectedSpaceForInfo(null)} />
                    <div className="info-panel-container">
                        <div className="info-panel-header">
                            <h3>{selectedSpaceForInfo.name}</h3>
                            <button className="info-panel-close" onClick={() => setSelectedSpaceForInfo(null)}>
                                <IconClose size={20} />
                            </button>
                        </div>
                        <div className="info-panel-content">
                            <div className="info-panel-section">
                                <label>Описание</label>
                                <div className="info-panel-text">
                                    {selectedSpaceForInfo.description || "Описание отсутствует"}
                                </div>
                            </div>
                            <button 
                                className="info-panel-action-btn"
                                onClick={() => {
                                    dispatch({ type: 'SET_ACTIVE_SPACE', payload: selectedSpaceForInfo.id });
                                    setSelectedSpaceForInfo(null);
                                    navigate(`/space/${selectedSpaceForInfo.id}`);
                                }}
                            >
                                Начать чат
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
