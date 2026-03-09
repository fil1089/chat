import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IconPlus, IconTrash, IconEdit, IconRobot, IconHistory, IconMessage, IconAttachment, SpaceIcon, SPACE_ICON_MAP } from '../components/Icons';
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
    }>({
        name: '',
        description: '',
        instructions: '',
        icon: 'folder',
        color: '',
        model: 'gpt-4o',
        files: [],
    });

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

    const resetForm = () => {
        setForm({ name: '', description: '', instructions: '', icon: 'folder', color: '', model: 'gpt-4o', files: [] });
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

    return (
        <div className="page helpers-page">
            {/* Top bar */}
            <div className="helpers-topbar">
                <h1 className="helpers-title">ИИ Помощники</h1>
                {state.spaces.length > 0 && (
                    <button className="helpers-create-btn" onClick={() => { resetForm(); setShowForm(true); }}>
                        <IconPlus size={16} />
                        <span>Новый помощник</span>
                    </button>
                )}
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
                            <input
                                type="text"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Краткое описание"
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
                            <div onClick={(e) => e.stopPropagation()}>
                                <ModelSelector
                                    model={form.model}
                                    onModelChange={(m) => setForm({ ...form, model: m })}
                                    direction="down"
                                />
                            </div>
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
                                {['', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'].map(c => (
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
            {state.spaces.length > 0 ? (
                <div className="helpers-section">
                    <h3 className="helpers-section-title">Мои помощники</h3>
                    <div className="helpers-grid">
                        {state.spaces.map((space, index) => (
                            <div
                                key={space.id}
                                className="helper-card"
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
                                onClick={() => {
                                    dispatch({ type: 'SET_ACTIVE_CHAT', payload: null });
                                    dispatch({ type: 'SET_ACTIVE_SPACE', payload: space.id });
                                    navigate(`/space/${space.id}`);
                                }}
                                style={space.color ? { borderLeftColor: space.color, borderLeftWidth: '3px' } : undefined}
                            >
                                <div className="helper-card-icon">
                                    <SpaceIcon icon={space.icon || 'folder'} size={28} />
                                </div>
                                <div className="helper-card-info">
                                    <div className="helper-card-name">{space.name}</div>
                                    {space.description && <div className="helper-card-desc">{space.description}</div>}
                                    <div className="helper-card-meta">
                                        <div className="meta-item"><IconHistory size={12} /> {formatDate(space.createdAt || Date.now())}</div>
                                        <div className="meta-item"><IconMessage size={12} /> {state.chats.filter(c => c.spaceId === space.id).length}</div>
                                    </div>
                                </div>
                                <div className="helper-card-actions">
                                    <button className="btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleEdit(space); }} title="Редактировать">
                                        <IconEdit size={14} />
                                    </button>
                                    <button className="btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(space.id); }} title="Удалить">
                                        <IconTrash size={14} />
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
            )}

            {/* Footer removed, button moved to topbar/empty state */}
        </div>
    );
}
