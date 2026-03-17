import { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { IconChevronDown, IconChevronUp, IconCheck, IconSearch, IconFileText, IconImage, IconAttachment, IconAudio, IconVideo } from './Icons';
import { IconGPT, IconGoogle, IconAnthropic, IconGrok, IconZAi } from './CategoryIcons';
import type { AIModel } from '../types';
import { ALL_POLZA_MODELS } from '../services/polzaApi';

interface ModelSelectorProps {
    model: string;
    onModelChange: (model: string) => void;
    direction?: 'up' | 'down';
    align?: 'left' | 'right';
    isMobileHeader?: boolean;
    variant?: 'default' | 'transparent';
    inline?: boolean;
    constrained?: boolean;
}

export default function ModelSelector({ model, onModelChange, direction = 'up', align = 'right', isMobileHeader = false, variant = 'default', inline = false, constrained = false }: ModelSelectorProps) {
    const { state } = useApp();
    const currentModel = ALL_POLZA_MODELS.find((m) => m.id === model);

    const groupedModels = useMemo(() => {
        const chatModels = ALL_POLZA_MODELS;

        const CATEGORY_MAP: Record<string, string> = {
            'GPT': 'GPT',
            'Gemini': 'Gemini',
            'Claude': 'Claude',
            'Grok': 'Grok',
            'GLM': 'GLM'
        };

        const hierarchy: Record<string, AIModel[]> = {};

        chatModels.forEach((m) => {
            const mappedCat = CATEGORY_MAP[m.category] || m.category || 'Other';

            if (!hierarchy[mappedCat]) hierarchy[mappedCat] = [];
            hierarchy[mappedCat].push(m);
        });

        // Ensure proper category ordering
        const order = ['Claude', 'Gemini', 'GPT', 'Grok', 'GLM'];
        const orderedHierarchy: Record<string, AIModel[]> = {};

        order.forEach(k => {
            if (hierarchy[k]) orderedHierarchy[k] = hierarchy[k];
        });
        Object.keys(hierarchy).forEach(k => {
            if (!orderedHierarchy[k]) orderedHierarchy[k] = hierarchy[k];
        });

        return orderedHierarchy;
    }, []);


    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());
    const ref = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!inline && open && searchRef.current) {
            searchRef.current.focus();
        }
    }, [open, inline]);

    useEffect(() => {
        if (inline) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [inline]);

    useEffect(() => {
        if (open && searchRef.current) {
            setTimeout(() => searchRef.current?.focus(), 50);
            const familiesToExpand = new Set<string>();
            Object.entries(groupedModels).forEach(([category, models]) => {
                if (models.some(m => m.id === model)) {
                    familiesToExpand.add(category);
                }
            });
            setExpandedFamilies(familiesToExpand);
        } else {
            setSearch('');
        }
    }, [open, model, groupedModels]);

    const getFilteredFlat = () => {
        const chatModels = ALL_POLZA_MODELS;
        let res = chatModels;

        if (search) {
            const q = search.toLowerCase();
            res = res.filter((m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || (m.desc && m.desc.toLowerCase().includes(q)));
        }

        return res;
    };

    const filterModels = (models: AIModel[]): AIModel[] => {
        if (!search) return models;
        const q = search.toLowerCase();
        return models.filter((m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || (m.desc && m.desc.toLowerCase().includes(q)));
    };

    const toggleFamily = (family: string) => {
        const next = new Set(expandedFamilies);
        if (next.has(family)) next.delete(family);
        else next.add(family);
        setExpandedFamilies(next);
    };

    const stripProvider = (name: string) => name.includes(': ') ? name.split(': ')[1] : name;

    const getCategoryIcon = (category: string | undefined, size = 16) => {
        if (!category) return null;
        switch (category) {
            case 'GPT': return <IconGPT size={size} />;
            case 'Gemini': return <IconGoogle size={size} />;
            case 'Claude': return <IconAnthropic size={size} />;
            case 'Grok': return <IconGrok size={size} />;
            case 'GLM': return <IconZAi size={size} />;
            default: return null;
        }
    };

    return (
        <div className={`custom-model-selector ${inline ? 'inline-mode' : ''}`} ref={ref}>
            {!inline && (
                <div
                    className={`model-selector-trigger ${open ? 'open' : ''} ${variant === 'transparent' ? 'transparent' : ''}`}
                    onClick={() => setOpen(!open)}
                >
                    <div className="model-trigger-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {currentModel && getCategoryIcon(currentModel.category, 18)}
                            <span className="model-name">{currentModel ? stripProvider(currentModel.name) : model}</span>
                        </div>
                    </div>
                    {direction === 'up' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                </div>
            )}

            {(open || inline) && (
                <div className={`model-selector-dropdown ${direction === 'down' ? 'down' : ''} ${align === 'left' ? 'left-aligned' : ''} ${inline ? 'inline' : ''}`} style={constrained ? { width: '100%', maxWidth: '100%', minWidth: 0, left: 0, right: 'auto', boxSizing: 'border-box' as const, maxHeight: '70vh' } : undefined}>
                    <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                        <div className="model-selector-top-bar">
                            <div className="model-search-container" style={{ flex: 1 }}>
                                <IconSearch size={14} />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    placeholder="Поиск модели..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="model-dropdown-scroll">
                        {search ? (
                            <div className="model-items">
                                {getFilteredFlat().length === 0 ? (
                                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>Ничего не найдено</div>
                                ) : (
                                    getFilteredFlat().map((m: AIModel) => (
                                        <div
                                            key={m.id}
                                            className={`model-item ${model === m.id ? 'active' : ''}`}
                                            onClick={() => { onModelChange(m.id); setOpen(false); }}
                                        >
                                            <div className="model-item-main">
                                                <div className="model-item-info">
                                                    <div className="model-item-name-row">
                                                        <span className="model-item-name">{stripProvider(m.name)}</span>
                                                    </div>
                                                     {m.pricing && (
                                                        <span className="model-pricing-info">
                                                            {m.pricing.prompt} / {m.pricing.completion}
                                                        </span>
                                                    )}
                                                    {m.capabilities && (
                                                        <div className="model-capabilities" style={{ display: 'flex', gap: '8px', marginTop: '4px', opacity: 0.6 }}>
                                                            {m.capabilities.text && <IconFileText size={12} />}
                                                            {m.capabilities.image && <IconImage size={12} />}
                                                            {m.capabilities.file && <IconAttachment size={12} />}
                                                            {m.capabilities.audio && <IconAudio size={12} />}
                                                            {m.capabilities.video && <IconVideo size={12} />}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="model-item-actions">
                                                    {model === m.id && <IconCheck size={16} className="check-icon" />}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            Object.entries(groupedModels).map(([category, models]) => {
                                const isCategoryExpanded = expandedFamilies.has(category);

                                return (
                                    <div key={category} className={`model-family-group ${isCategoryExpanded ? 'expanded' : ''}`}>
                                        <div className="model-family-header" onClick={() => toggleFamily(category)}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {category === 'GPT' && <IconGPT size={16} />}
                                                {category === 'Gemini' && <IconGoogle size={16} />}
                                                {category === 'Claude' && <IconAnthropic size={16} />}
                                                {category === 'Grok' && <IconGrok size={16} />}
                                                {category === 'GLM' && <IconZAi size={16} />}
                                                <span>{category}</span>
                                            </div>
                                            {isCategoryExpanded ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
                                        </div>

                                        {isCategoryExpanded && (
                                            <div className="model-items nested">
                                                {models.map((m) => (
                                                    <div
                                                        key={m.id}
                                                        className={`model-item ${model === m.id ? 'active' : ''}`}
                                                        onClick={() => { onModelChange(m.id); setOpen(false); }}
                                                    >
                                                        <div className="model-item-main">
                                                            <div className="model-item-info">
                                                                <div className="model-item-name-row">
                                                                    <span className="model-item-name">{stripProvider(m.name)}</span>
                                                                </div>
                                                                 {m.pricing && (
                                                        <span className="model-pricing-info">
                                                            {m.pricing.prompt} / {m.pricing.completion}
                                                        </span>
                                                    )}
                                                                {m.capabilities && (
                                                                    <div className="model-capabilities" style={{ display: 'flex', gap: '8px', marginTop: '4px', opacity: 0.6 }}>
                                                                        {m.capabilities.text && <IconFileText size={12} />}
                                                                        {m.capabilities.image && <IconImage size={12} />}
                                                                        {m.capabilities.file && <IconAttachment size={12} />}
                                                                        {m.capabilities.audio && <IconAudio size={12} />}
                                                                        {m.capabilities.video && <IconVideo size={12} />}
                                                                    </div>
                                                                )}
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
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

