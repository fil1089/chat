import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent, type DragEvent } from 'react';
import ModelSelector from './ModelSelector';
import { IconSend, IconStop, IconAttachment, IconFileText, IconClose, IconSearch } from './Icons';
import type { Attachment } from '../types';

interface SearchModel {
    id: string;
    name: string;
    desc: string;
}

const SEARCH_MODELS: SearchModel[] = [
    { id: 'you-search', name: 'Умный Поиск', desc: 'Быстрые ответы из сети' },
    { id: 'you-research', name: 'Исследование', desc: 'Глубокий анализ данных' }
];

interface ChatInputProps {
    onSend: (text: string, attachments: Attachment[]) => void;
    model: string;
    onModelChange: (model: string) => void;
    isStreaming: boolean;
    onStop: () => void;
    direction?: 'up' | 'down';
    hideModelSelector?: boolean;
}

export default function ChatInput({ onSend, model, onModelChange, isStreaming, onStop, direction = 'up', hideModelSelector = false }: ChatInputProps) {
    const [text, setText] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    }, [text]);

    useEffect(() => {
        const handleEdit = (e: CustomEvent<{ text: string }>) => {
            setText(e.detail.text);
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.setSelectionRange(e.detail.text.length, e.detail.text.length);
                }
            }, 0);
        };
        window.addEventListener('edit-chat-message', handleEdit as EventListener);
        return () => window.removeEventListener('edit-chat-message', handleEdit as EventListener);
    }, []);

    const readFile = (file: File): Promise<Attachment> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({
                name: file.name,
                content: (e.target?.result as string) || '',
                size: file.size
            });
            reader.readAsText(file);
        });
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newAttachments = await Promise.all(files.map(readFile));
        setAttachments(prev => [...prev, ...newAttachments]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        const trimmed = text.trim();
        if ((!trimmed && attachments.length === 0) || isStreaming) return;
        onSend(trimmed, attachments);
        setText('');
        setAttachments([]);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length > 0) {
            const newAttachments = await Promise.all(files.map(readFile));
            setAttachments(prev => [...prev, ...newAttachments]);
        }
    };

    return (
        <div
            className={`chat-input-container ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="chat-input-wrapper">
                {attachments.length > 0 && (
                    <div className="chat-input-attachments">
                        {attachments.map((file, i) => (
                            <div key={i} className="attachment-chip">
                                <IconFileText size={14} />
                                <span className="attachment-name">{file.name}</span>
                                <button className="remove-attachment" onClick={() => removeAttachment(i)}>
                                    <IconClose size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="chat-input-top">
                    {hideModelSelector && (model === 'you-search' || model === 'you-research') ? (
                        <div className="search-model-toggle">
                            {SEARCH_MODELS.map(m => (
                                <button
                                    key={m.id}
                                    className={`search-model-option ${model === m.id ? 'active' : ''}`}
                                    onClick={() => onModelChange(m.id)}
                                >
                                    <div className="search-model-name">{m.name}</div>
                                    <div className="search-model-desc">{m.desc}</div>
                                </button>
                            ))}
                        </div>
                    ) : hideModelSelector ? (
                        <div className="ai-search-label"><IconSearch size={16} /> ИИ Поиск</div>
                    ) : (
                        <ModelSelector model={model} onModelChange={onModelChange} direction={direction} />
                    )}

                    <div className="chat-input-actions">
                        <button
                            className="btn-ghost btn-sm attachment-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Прикрепить файлы"
                        >
                            <IconAttachment size={18} />
                        </button>

                        {isStreaming ? (
                            <button className="send-btn stop-btn" onClick={onStop} title="Остановить">
                                <IconStop size={18} />
                            </button>
                        ) : (
                            <button
                                className="send-btn"
                                onClick={handleSubmit}
                                disabled={!text.trim() && attachments.length === 0}
                                title="Отправить (Enter)"
                            >
                                <IconSend size={18} />
                            </button>
                        )}
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        multiple
                        onChange={handleFileChange}
                    />
                </div>
                <div className="chat-input-bottom">
                    <textarea
                        ref={textareaRef}
                        className="chat-textarea"
                        placeholder={isDragging ? "Перетащите файлы сюда..." : "Введите сообщение..."}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        disabled={isStreaming}
                    />
                </div>
            </div>
        </div>
    );
}
