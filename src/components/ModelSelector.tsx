import { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getGroupedChatModels, MODELS } from '../services/youApi';
import { IconChevronDown, IconChevronUp, IconCheck, IconSearch, IconFileText, IconImage, IconAttachment, IconAudio, IconVideo } from './Icons';
import type { AIModel } from '../types';
import { getGroupedPolzaModels, ALL_POLZA_MODELS } from '../services/polzaApi';

interface ModelSelectorProps {
    model: string;
    onModelChange: (model: string) => void;
    direction?: 'up' | 'down';
    isMobileHeader?: boolean;
    variant?: 'default' | 'transparent';
    inline?: boolean;
}

export default function ModelSelector({ model, onModelChange, direction = 'up', isMobileHeader = false, variant = 'default', inline = false }: ModelSelectorProps) {
    const { state } = useApp();
    const isPolza = true;

    const currentModel = isPolza
        ? ALL_POLZA_MODELS.find((m) => m.id === model)
        : MODELS.find((m) => m.id === model);

    const groupedModels = useMemo(() => {
        const ALL_MODELS = isPolza ? ALL_POLZA_MODELS.filter(m => !m.id.toLowerCase().includes('nano') && !m.id.toLowerCase().includes('banana') && !m.name.toLowerCase().includes('nano') && !m.name.toLowerCase().includes('banana')) : MODELS;
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

        const hierarchy: Record<string, Record<string, AIModel[]>> = {};

        chatModels.forEach((m) => {
            const mappedCat = CATEGORY_MAP[m.category] || m.category || 'Other';
            const subCat = m.subCategory || 'other';

            if (!hierarchy[mappedCat]) hierarchy[mappedCat] = {};
            if (!hierarchy[mappedCat][subCat]) hierarchy[mappedCat][subCat] = [];
            hierarchy[mappedCat][subCat].push(m);
        });

        // Ensure proper category ordering
        const order = ['GPT', 'Gemini', 'Claude', 'Grok', 'DeepSeek', 'GLM', 'You.com', 'Other'];
        const orderedHierarchy: Record<string, Record<string, AIModel[]>> = {};

        order.forEach(k => {
            if (hierarchy[k]) orderedHierarchy[k] = hierarchy[k];
        });
        Object.keys(hierarchy).forEach(k => {
            if (!orderedHierarchy[k]) orderedHierarchy[k] = hierarchy[k];
        });

        return orderedHierarchy;
    }, [isPolza]);

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [filterOption, setFilterOption] = useState('all');
    const [sortOption, setSortOption] = useState('default');
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
            Object.entries(groupedModels).forEach(([category, subs]) => {
                Object.values(subs).forEach(models => {
                    if (models.some(m => m.id === model)) {
                        familiesToExpand.add(category);
                    }
                });
            });
            setExpandedFamilies(familiesToExpand);
        } else {
            setSearch('');
            setFilterOption('all');
            setSortOption('default');
        }
    }, [open, model, groupedModels]);

    const getFilteredAndSortedFlat = () => {
        const ALL_MODELS = isPolza ? ALL_POLZA_MODELS.filter(m => !m.id.toLowerCase().includes('nano') && !m.id.toLowerCase().includes('banana') && !m.name.toLowerCase().includes('nano') && !m.name.toLowerCase().includes('banana')) : MODELS;
        const chatModels = isPolza ? ALL_MODELS : ALL_MODELS.filter((m) => !['gpt-image-1', 'tts', 'whisper', 'text-embedding-3-small', 'text-embedding-3-large', 'gemini-2.5-flash-image', 'you-search', 'you-research'].includes(m.id));

        let res = chatModels;

        if (filterOption !== 'all') {
            if (filterOption === 'reasoning') res = res.filter(m => m.subCategory === 'thinking' || (m.desc && m.desc.toLowerCase().includes('thinking')));
            if (filterOption === 'advanced') res = res.filter(m => m.subCategory === 'advanced' || m.isActual);
            if (filterOption === 'fast') res = res.filter(m => m.subCategory === 'fast' || (m.desc && m.desc.toLowerCase().includes('fast')));
            if (filterOption === 'files') res = res.filter(m => m.capabilities?.file || m.capabilities?.image);
            if (filterOption === 'cheap') res = res.filter(m => {
                if (!m.pricing) return false;
                const p = parseFloat(m.pricing.prompt.replace(/[^0-9.]/g, ''));
                return p < 1;
            });
        }

        if (search) {
            const q = search.toLowerCase();
            res = res.filter((m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || (m.desc && m.desc.toLowerCase().includes(q)));
        }

        if (sortOption === 'price_asc' || sortOption === 'price_desc') {
            res.sort((a, b) => {
                const getPrice = (m: AIModel) => {
                    if (!m.pricing) return 999999;
                    const prompt = parseFloat(m.pricing.prompt.replace(/[^0-9.]/g, '')) || 0;
                    const comp = parseFloat(m.pricing.completion.replace(/[^0-9.]/g, '')) || 0;
                    return prompt + comp;
                };
                const pa = getPrice(a);
                const pb = getPrice(b);
                return sortOption === 'price_asc' ? pa - pb : pb - pa;
            });
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

    return (
        <div className={`custom-model-selector ${inline ? 'inline-mode' : ''}`} ref={ref}>
            {!inline && (
                <div
                    className={`model-selector-trigger ${open ? 'open' : ''} ${variant === 'transparent' ? 'transparent' : ''}`}
                    onClick={() => setOpen(!open)}
                >
                    <div className="model-trigger-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="model-name">{currentModel?.name || model}</span>
                            {currentModel?.isActual && <span className="model-badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '10px', padding: '2px 6px', fontWeight: 'normal', letterSpacing: '0.2px', textTransform: 'lowercase' }}>актуальная</span>}
                        </div>
                    </div>
                    {direction === 'up' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                </div>
            )}

            {(open || inline) && (
                <div className={`model-selector-dropdown ${direction === 'down' ? 'down' : ''} ${inline ? 'inline' : ''}`}>
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', marginBottom: '8px' }}>
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

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ flex: 1, display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }} className="hide-scrollbar">
                                {[
                                    { id: 'all', label: 'Все' },
                                    { id: 'reasoning', label: 'Рассуждающие' },
                                    { id: 'advanced', label: 'Продвинутые' },
                                    { id: 'fast', label: 'Быстрые' },
                                    { id: 'files', label: 'С файлами' },
                                    { id: 'cheap', label: 'Дешевые' }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={(e) => { e.stopPropagation(); setFilterOption(f.id); }}
                                        style={{
                                            whiteSpace: 'nowrap', padding: '4px 10px', fontSize: '11px',
                                            borderRadius: '12px', border: '1px solid var(--border)',
                                            background: filterOption === f.id ? 'var(--accent)' : 'var(--surface-glass)',
                                            color: filterOption === f.id ? '#fff' : 'var(--text-secondary)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    background: 'var(--surface-glass)', color: 'var(--text-primary)',
                                    border: '1px solid var(--border)', padding: '5px 8px',
                                    borderRadius: '6px', fontSize: '11px', outline: 'none', cursor: 'pointer',
                                    whiteSpace: 'nowrap', flexShrink: 0
                                }}
                            >
                                <option value="default">Сортировка: По умолчанию</option>
                                <option value="price_asc">По стоимости (деш.)</option>
                                <option value="price_desc">По стоимости (дор.)</option>
                            </select>
                        </div>
                    </div>
                    <div className="model-dropdown-scroll">
                        {(filterOption !== 'all' || sortOption !== 'default' || search) ? (
                            <div className="model-items">
                                {getFilteredAndSortedFlat().length === 0 ? (
                                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>Ничего не найдено</div>
                                ) : (
                                    getFilteredAndSortedFlat().map((m: AIModel) => (
                                        <div
                                            key={m.id}
                                            className={`model-item ${model === m.id ? 'active' : ''}`}
                                            onClick={() => { onModelChange(m.id); setOpen(false); }}
                                        >
                                            <div className="model-item-main">
                                                <div className="model-item-info">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                        <span className="model-item-name">{m.name}</span>
                                                        {m.isActual && <span className="model-badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '10px', padding: '1px 5px', fontWeight: 'normal', textTransform: 'lowercase' }}>актуальная</span>}
                                                        {m.pricing && (
                                                            <span className="model-pricing-info" style={{ fontSize: '10px', color: 'var(--text-secondary)', opacity: 0.8 }}>
                                                                {m.pricing.prompt} / {m.pricing.completion}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="model-item-type">{m.desc}</span>
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
                            Object.entries(groupedModels).map(([category, subs]) => {
                                // Filter models across all subcategories for search
                                const hasMatch = Object.values(subs).some(models => filterModels(models).length > 0);
                                if (!hasMatch) return null;

                                const isCategoryExpanded = expandedFamilies.has(category) || !!search;

                                return (
                                    <div key={category} className={`model-family-group ${isCategoryExpanded ? 'expanded' : ''}`}>
                                        <div className="model-family-header" onClick={() => toggleFamily(category)}>
                                            <span>{category}</span>
                                            {isCategoryExpanded ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
                                        </div>

                                        {isCategoryExpanded && (
                                            <div className="model-subcategories">
                                                {/* Order subcategories: thinking, advanced, fast, other */}
                                                {['thinking', 'advanced', 'fast', 'other'].map(subKey => {
                                                    const subModels = subs[subKey];
                                                    if (!subModels) return null;
                                                    const filtered = filterModels(subModels);
                                                    if (filtered.length === 0) return null;

                                                    const subLabelMap: Record<string, string> = {
                                                        'thinking': 'Рассуждающие',
                                                        'advanced': 'Продвинутые',
                                                        'fast': 'Быстрые',
                                                        'other': 'Прочие'
                                                    };

                                                    const subId = `${category}-${subKey}`;
                                                    const isSubExpanded = expandedFamilies.has(subId) || !!search || filtered.length === 1;

                                                    return (
                                                        <div key={subKey} className={`model-subcategory-group ${isSubExpanded ? 'expanded' : ''}`}>
                                                            {filtered.length > 0 && (
                                                                <div className="model-subcategory-header" onClick={() => toggleFamily(subId)}>
                                                                    <span>{subLabelMap[subKey] || subKey}</span>
                                                                    {isSubExpanded ? <IconChevronUp size={10} /> : <IconChevronDown size={10} />}
                                                                </div>
                                                            )}
                                                            {isSubExpanded && (
                                                                <div className="model-items nested">
                                                                    {filtered.map((m) => (
                                                                        <div
                                                                            key={m.id}
                                                                            className={`model-item ${model === m.id ? 'active' : ''}`}
                                                                            onClick={() => { onModelChange(m.id); setOpen(false); }}
                                                                        >
                                                                            <div className="model-item-main">
                                                                                <div className="model-item-info">
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                                                        <span className="model-item-name">{m.name}</span>
                                                                                        {m.isActual && <span className="model-badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '10px', padding: '1px 5px', fontWeight: 'normal', textTransform: 'lowercase' }}>актуальная</span>}
                                                                                        {m.pricing && (
                                                                                            <span className="model-pricing-info" style={{ fontSize: '10px', color: 'var(--text-secondary)', opacity: 0.8 }}>
                                                                                                {m.pricing.prompt} / {m.pricing.completion}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <span className="model-item-type">{m.desc}</span>
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
                                                })}
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

