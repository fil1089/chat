import { useState, useRef, useEffect } from 'react';

import { getPolzaModelsByCategory } from '../services/polzaApi';
import { useApp } from '../context/AppContext';
import { IconChevronDown, IconChevronUp } from './Icons';
import type { AIModel } from '../types';

interface MessageModelSelectorProps {
    onSelect: (modelId: string) => void;
}

export default function MessageModelSelector({ onSelect }: MessageModelSelectorProps) {
    const { state } = useApp();
    const [open, setOpen] = useState(false);
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const ref = useRef<HTMLDivElement>(null);

    const grouped = getPolzaModelsByCategory();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCategory = (cat: string) => {
        setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    return (
        <div className="message-model-selector" ref={ref}>
            <button className="msg-action-icon msg-action-chevron" onClick={() => setOpen(!open)}>
                <IconChevronDown size={12} />
            </button>
            {open && (
                <div className="model-dropdown-mini">
                    <div className="model-dropdown-scroll">
                        {Object.entries(grouped).map(([category, models]) => (
                            <div key={category} className="model-group-mini">
                                <div
                                    className="model-group-title-mini"
                                    onClick={() => toggleCategory(category)}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                >
                                    <span>{category}</span>
                                    {collapsed[category] ? <IconChevronDown size={10} /> : <IconChevronUp size={10} />}
                                </div>
                                {!collapsed[category] && (models as AIModel[]).map((m: AIModel) => (
                                    <button
                                        key={m.id}
                                        className="model-option-mini"
                                        onClick={() => {
                                            onSelect(m.id);
                                            setOpen(false);
                                        }}
                                    >
                                        <span className="model-option-name">{m.name}</span>
                                        <span className="model-option-desc">{m.desc}</span>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
