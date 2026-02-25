import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getGroupedChatModels, MODELS } from '../services/youApi';
import { IconChevronDown, IconChevronUp, IconCheck, IconSearch } from './Icons';
import type { AIModel } from '../types';

interface ModelSelectorProps {
    model: string;
    onModelChange: (model: string) => void;
    direction?: 'up' | 'down';
}

export default function ModelSelector({ model, onModelChange, direction = 'up' }: ModelSelectorProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());
    const ref = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (open && searchRef.current) {
            setTimeout(() => searchRef.current?.focus(), 50);
            // Only expand the category/family containing the currently selected model
            const grouped = getGroupedChatModels();
            const categoriesToExpand = new Set<string>();
            const familiesToExpand = new Set<string>();
            Object.entries(grouped).forEach(([category, families]) => {
                Object.entries(families).forEach(([family, models]) => {
                    if (models.some(m => m.id === model)) {
                        categoriesToExpand.add(category);
                        familiesToExpand.add(family);
                    }
                });
            });
            setExpandedCategories(categoriesToExpand);
            setExpandedFamilies(familiesToExpand);
        } else {
            setSearch('');
        }
    }, [open]);

    const currentModel = MODELS.find((m) => m.id === model);
    const grouped = getGroupedChatModels();

    const filterModels = (models: AIModel[]): AIModel[] => {
        if (!search) return models;
        const q = search.toLowerCase();
        return models.filter((m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));
    };

    const toggleCategory = (category: string) => {
        const next = new Set(expandedCategories);
        if (next.has(category)) next.delete(category);
        else next.add(category);
        setExpandedCategories(next);
    };

    const toggleFamily = (family: string) => {
        const next = new Set(expandedFamilies);
        if (next.has(family)) next.delete(family);
        else next.add(family);
        setExpandedFamilies(next);
    };

    return (
        <div className="custom-model-selector" ref={ref}>
            <div
                className={`model-selector-trigger ${open ? 'open' : ''}`}
                onClick={() => setOpen(!open)}
            >
                <div className="model-trigger-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="model-name">{currentModel?.name || model}</span>
                        {currentModel?.isActual && <span className="model-badge" style={{ background: 'rgba(76, 175, 80, 0.15)', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' }}>Актуальная</span>}
                    </div>
                    {currentModel && <span className="model-badge">{currentModel.category}</span>}
                </div>
                {direction === 'up' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
            </div>

            {open && (
                <div className={`model-selector-dropdown ${direction === 'down' ? 'down' : ''}`}>
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                            <IconSearch size={14} />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Поиск модели..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '13px', width: '100%' }}
                            />
                        </div>
                    </div>
                    <div className="model-dropdown-scroll">
                        {Object.entries(grouped).map(([category, families]) => {
                            const allFiltered = Object.entries(families).flatMap(([, models]) => filterModels(models));
                            if (allFiltered.length === 0) return null;

                            const isExpanded = expandedCategories.has(category) || !!search;

                            return (
                                <div key={category} className={`model-category-group ${isExpanded ? 'expanded' : ''}`}>
                                    <div className="model-category-header" onClick={() => toggleCategory(category)}>
                                        <span>{category}</span>
                                        {isExpanded ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
                                    </div>
                                    {isExpanded && (
                                        <div className="model-families">
                                            {Object.entries(families).map(([family, models]) => {
                                                const filteredModels = filterModels(models);
                                                if (filteredModels.length === 0) return null;

                                                const isFamilyExpanded = expandedFamilies.has(family) || !!search;

                                                return (
                                                    <div key={family} className={`model-family-group ${isFamilyExpanded ? 'expanded' : ''}`}>
                                                        {filteredModels.length > 1 && (
                                                            <div className="model-family-header" onClick={() => toggleFamily(family)}>
                                                                <span>{family}</span>
                                                                {isFamilyExpanded ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
                                                            </div>
                                                        )}
                                                        {(filteredModels.length === 1 || isFamilyExpanded) && (
                                                            <div className={`model-items ${filteredModels.length > 1 ? 'nested' : ''}`}>
                                                                {filteredModels.map((m) => (
                                                                    <div
                                                                        key={m.id}
                                                                        className={`model-item ${model === m.id ? 'active' : ''}`}
                                                                        onClick={() => { onModelChange(m.id); setOpen(false); }}
                                                                    >
                                                                        <div className="model-item-main">
                                                                            <div className="model-item-info">
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                    <span className="model-item-name">{m.name}</span>
                                                                                    {m.isActual && <span className="model-badge" style={{ background: 'rgba(76, 175, 80, 0.15)', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)', fontSize: '10px', padding: '2px 6px' }}>Актуальная</span>}
                                                                                </div>
                                                                                <span className="model-item-type">{m.desc}</span>
                                                                            </div>
                                                                            <div className="model-item-actions">
                                                                                {model === m.id && <IconCheck size={16} className="check-icon" />}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
