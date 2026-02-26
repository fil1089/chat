import { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getGroupedChatModels, MODELS } from '../services/youApi';
import { IconChevronDown, IconChevronUp, IconCheck, IconSearch } from './Icons';
import type { AIModel } from '../types';
import { getGroupedPolzaModels, ALL_POLZA_MODELS } from '../services/polzaApi';

interface ModelSelectorProps {
    model: string;
    onModelChange: (model: string) => void;
    direction?: 'up' | 'down';
}

export default function ModelSelector({ model, onModelChange, direction = 'up' }: ModelSelectorProps) {
    const { state } = useApp();
    const isPolza = state.settings.apiProvider === 'polza';

    const currentModel = isPolza
        ? ALL_POLZA_MODELS.find((m) => m.id === model)
        : MODELS.find((m) => m.id === model);

    const flatFamilies = useMemo(() => {
        const ALL_MODELS = isPolza ? ALL_POLZA_MODELS : MODELS;
        const chatModels = isPolza ? ALL_MODELS : ALL_MODELS.filter((m) => !['gpt-image-1', 'tts', 'whisper', 'text-embedding-3-small', 'text-embedding-3-large', 'gemini-2.5-flash-image', 'you-search', 'you-research'].includes(m.id));

        const CATEGORY_MAP: Record<string, string> = {
            'OpenAI': 'GPT',
            'Google': 'Gemini',
            'Anthropic': 'Claude',
            'X.AI': 'Grok',
            'DeepSeek': 'DeepSeek',
            'GLM': 'GLM',
            'You.com': 'You.com'
        };

        const familiesMap: Record<string, AIModel[]> = {};
        chatModels.forEach((m) => {
            const mappedCat = CATEGORY_MAP[m.category] || m.category || 'Other';
            if (!familiesMap[mappedCat]) familiesMap[mappedCat] = [];
            familiesMap[mappedCat].push(m);
        });

        // Ensure proper ordering
        const ordered: Record<string, AIModel[]> = {};
        const order = ['GPT', 'Gemini', 'Claude', 'Grok', 'DeepSeek', 'GLM', 'You.com', 'Other'];
        order.forEach(k => {
            if (familiesMap[k]) ordered[k] = familiesMap[k];
        });
        Object.keys(familiesMap).forEach(k => {
            if (!ordered[k]) ordered[k] = familiesMap[k];
        });

        return ordered;
    }, [isPolza]);

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
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
            const familiesToExpand = new Set<string>();
            Object.entries(flatFamilies).forEach(([family, models]) => {
                if (models.some(m => m.id === model)) {
                    familiesToExpand.add(family);
                }
            });
            setExpandedFamilies(familiesToExpand);
        } else {
            setSearch('');
        }
    }, [open, model, flatFamilies]);

    const filterModels = (models: AIModel[]): AIModel[] => {
        if (!search) return models;
        const q = search.toLowerCase();
        return models.filter((m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));
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
                        {currentModel?.isActual && <span className="model-badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '10px', padding: '2px 6px', fontWeight: 'normal', letterSpacing: '0.2px' }}>актуальная</span>}
                    </div>
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
                        {Object.entries(flatFamilies).map(([family, models]) => {
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
                                                                {m.isActual && <span className="model-badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '10px', padding: '1px 5px', fontWeight: 'normal' }}>актуальная</span>}
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
                </div>
            )}
        </div>
    );
}

