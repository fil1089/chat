import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IconFolder, IconPlus, IconTrash, IconEdit, IconRobot, SpaceIcon, SPACE_ICON_MAP } from '../components/Icons';
import { v4 as uuidv4 } from 'uuid';
import type { Space, SpaceFile } from '../types';

export default function SpacesPage() {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const [editing, setEditing] = useState<Space | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        instructions: '',
        icon: 'folder',
        model: 'gpt-4o',
    });

    const iconKeys = Object.keys(SPACE_ICON_MAP);

    const resetForm = () => {
        setForm({ name: '', description: '', instructions: '', icon: 'folder', model: 'gpt-4o' });
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
            model: form.model,
            files: editing?.files || [],
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
            model: space.model || 'gpt-4o',
        });
        setEditing(space);
        setShowForm(true);
    };

    const handleDelete = (spaceId: string) => {
        if (confirm('Удалить пространство и все связанные чаты?')) {
            dispatch({ type: 'DELETE_SPACE', payload: spaceId });
        }
    };

    return (
        <div className="page spaces-page">
            <div className="page-header">
                <IconFolder size={28} />
                <h1>Пространства</h1>
                <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
                    <IconPlus size={18} />
                    Создать
                </button>
            </div>

            {showForm && (
                <div className="space-editor">
                    <h2>{editing ? 'Редактировать' : 'Новое пространство'}</h2>
                    <div className="form-row">
                        <label>Название</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Название пространства"
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
                    <div className="editor-actions">
                        <button className="btn-secondary" onClick={resetForm}>Отмена</button>
                        <button className="btn-primary" onClick={handleSave}>
                            {editing ? 'Сохранить' : 'Создать'}
                        </button>
                    </div>
                </div>
            )}

            <div className="spaces-grid">
                {state.spaces.map((space) => (
                    <div
                        key={space.id}
                        className="space-card"
                        onClick={() => navigate(`/space/${space.id}`)}
                    >
                        <div className="space-card-icon">
                            <SpaceIcon icon={space.icon || 'folder'} size={32} />
                        </div>
                        <div className="space-card-title">{space.name}</div>
                        {space.description && <div className="space-card-desc">{space.description}</div>}
                        <div className="space-card-meta">
                            {state.chats.filter(c => c.spaceId === space.id).length} чатов
                        </div>
                        <div className="space-card-actions">
                            <button className="btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleEdit(space); }}>
                                <IconEdit size={16} />
                            </button>
                            <button className="btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(space.id); }}>
                                <IconTrash size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {state.spaces.length === 0 && !showForm && (
                <div className="empty-state">
                    <IconRobot size={48} />
                    <h2>Нет пространств</h2>
                    <p>Создайте пространство для организации чатов с настроенными инструкциями</p>
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        <IconPlus size={18} /> Создать пространство
                    </button>
                </div>
            )}
        </div>
    );
}
