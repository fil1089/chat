import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent, type DragEvent } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import ModelSelector from './ModelSelector';
import { IconSend, IconStop, IconAttachment, IconFileText, IconClose, IconSettings, IconChevronDown, IconImage, IconAudio, IconVideo } from './Icons';
import type { Attachment, ContextMode } from '../types';
import { useApp } from '../context/AppContext';
import { ALL_POLZA_MODELS } from '../services/polzaApi';
import { MODELS } from '../services/youApi';

// Configure PDF.js worker via CDN (avoids Vite bundling issues)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs';



const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];

async function extractPdfText(file: File): Promise<string> {
    console.log('[PDF] Starting text extraction for:', file.name, 'size:', file.size);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    console.log('[PDF] Document loaded, pages:', pdf.numPages);
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
        if (pageText.trim()) pages.push(pageText);
    }
    console.log('[PDF] Extracted text length:', pages.join('\n\n').length);
    return pages.join('\n\n');
}

async function renderPdfAsImages(file: File): Promise<Attachment[]> {
    console.log('[PDF] Rendering pages as images for:', file.name);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const attachments: Attachment[] = [];
    const scale = 2; // Higher resolution for better AI recognition

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        console.log('[PDF] Page', i, 'rendered, dataUrl length:', dataUrl.length);
        attachments.push({
            name: `${file.name} (стр. ${i})`,
            content: dataUrl,
            size: dataUrl.length,
            type: 'image',
            mimeType: 'image/jpeg',
        });
    }
    return attachments;
}

async function readFile(file: File, isPolza: boolean): Promise<Attachment[]> {
    const isImage = IMAGE_TYPES.includes(file.type) || /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(file.name);
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

    if (isImage) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve([{
                name: file.name,
                content: (e.target?.result as string) || '',
                size: file.size,
                type: 'image',
                mimeType: file.type || undefined,
            }]);
            reader.readAsDataURL(file);
        });
    }

    if (isPdf) {
        if (isPolza) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve([{
                    name: file.name,
                    content: (e.target?.result as string) || '',
                    size: file.size,
                    type: 'file',
                    mimeType: 'application/pdf',
                }]);
                reader.readAsDataURL(file);
            });
        }

        try {
            // Try text extraction first
            const text = await extractPdfText(file);
            if (text.trim().length > 50) {
                // Has real text content
                return [{
                    name: file.name,
                    content: text,
                    size: file.size,
                    type: 'text',
                    mimeType: 'application/pdf',
                }];
            }
            // Scanned PDF — render as images
            console.log('[PDF] No text found, rendering as images...');
            return await renderPdfAsImages(file);
        } catch (err) {
            console.error('PDF extraction error:', err);
            // Fallback: try to render as images
            try {
                return await renderPdfAsImages(file);
            } catch (renderErr) {
                console.error('PDF render error:', renderErr);
                return [{
                    name: file.name,
                    content: '[Ошибка при чтении PDF файла]',
                    size: file.size,
                    type: 'text',
                    mimeType: 'application/pdf',
                }];
            }
        }
    }

    // Default: read as text
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve([{
            name: file.name,
            content: (e.target?.result as string) || '',
            size: file.size,
            type: 'text',
            mimeType: file.type || undefined,
        }]);
        reader.readAsText(file);
    });
}

interface ChatInputProps {
    onSend: (text: string, attachments: Attachment[]) => void;
    model: string;
    onModelChange: (model: string) => void;
    isStreaming: boolean;
    onStop: () => void;
    direction?: 'up' | 'down';
    hideModelSelector?: boolean;
    placeholder?: string;
    contextMode: ContextMode;
    contextN: number;
    onContextModeChange: (mode: ContextMode) => void;
    onContextNChange: (n: number) => void;
    hasSystemInstruction?: boolean;
    imageSize: string;
    onImageSizeChange: (size: string) => void;
    imageQuality: string;
    onImageQualityChange: (quality: string) => void;
    enableReasoning?: boolean;
    onReasoningChange?: (val: boolean) => void;
    enableWebSearch?: boolean;
    onWebSearchChange?: (val: boolean) => void;
}

export default function ChatInput({ onSend, model, onModelChange, isStreaming, onStop, direction = 'up', hideModelSelector = false, placeholder, contextMode, contextN, onContextModeChange, onContextNChange, hasSystemInstruction, imageSize, onImageSizeChange, imageQuality, onImageQualityChange, enableReasoning, onReasoningChange, enableWebSearch, onWebSearchChange }: ChatInputProps) {
    const { state } = useApp();
    const [text, setText] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);

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

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const isPolza = state.settings.apiProvider === 'polza';
        const results = await Promise.all(files.map(f => readFile(f, isPolza)));
        const newAttachments = results.flat();
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
            const isPolza = state.settings.apiProvider === 'polza';
            const results = await Promise.all(files.map(f => readFile(f, isPolza)));
            const newAttachments = results.flat();
            setAttachments(prev => [...prev, ...newAttachments]);
        }
    };

    const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = Array.from(e.clipboardData.items || []);
        const files: File[] = [];

        items.forEach(item => {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) files.push(file);
            }
        });

        if (files.length > 0) {
            e.preventDefault(); // Prevent default if we found files, let text paste naturally otherwise
            const isPolza = state.settings.apiProvider === 'polza';
            const results = await Promise.all(files.map(f => readFile(f, isPolza)));
            const newAttachments = results.flat();
            setAttachments(prev => [...prev, ...newAttachments]);
        }
    };

    // Add click outside handler for settings and dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setShowSettings(false);
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        {!hideModelSelector && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <ModelSelector model={model} onModelChange={onModelChange} direction={direction} />
                            </div>
                        )}
                    </div>

                    <div className="chat-input-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                        <button
                            className="btn-ghost btn-sm attachment-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Прикрепить файлы"
                        >
                            <IconAttachment size={18} />
                        </button>

                        {!(model.includes('image') || model.includes('image-preview')) && (
                            <div className="chat-settings-wrapper" ref={settingsRef}>
                                <button
                                    className="chat-settings-btn"
                                    onClick={() => setShowSettings(!showSettings)}
                                    title="Настройки контекста"
                                >
                                    <IconSettings size={18} />
                                </button>
                                {showSettings && (
                                    <div className="chat-settings-popup">
                                        <h4><IconSettings size={14} /> Настройки</h4>
                                        <div className="settings-field">
                                            <label>Контекст</label>
                                            <div className="custom-select-wrapper">
                                                <button
                                                    className="custom-select-trigger"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowDropdown(!showDropdown);
                                                    }}
                                                >
                                                    <span>
                                                        {contextMode === 'full' ? 'Полный' : contextMode === 'last_n' ? 'Последние сообщения' : contextMode === 'first_n' ? 'Первые сообщения' : 'Только системная инструкция'}
                                                    </span>
                                                    <IconChevronDown size={14} />
                                                </button>
                                                {showDropdown && (
                                                    <div className="custom-select-dropdown open">
                                                        <div
                                                            className={`custom-select-option${contextMode === 'full' ? ' active' : ''}`}
                                                            onClick={(e) => { e.stopPropagation(); onContextModeChange('full'); setShowDropdown(false); }}
                                                        >Полный</div>
                                                        <div
                                                            className={`custom-select-option${contextMode === 'last_n' ? ' active' : ''}`}
                                                            onClick={(e) => { e.stopPropagation(); onContextModeChange('last_n'); setShowDropdown(false); }}
                                                        >Последние сообщения</div>
                                                        <div
                                                            className={`custom-select-option${contextMode === 'first_n' ? ' active' : ''}`}
                                                            onClick={(e) => { e.stopPropagation(); onContextModeChange('first_n'); setShowDropdown(false); }}
                                                        >Первые сообщения</div>
                                                        {hasSystemInstruction && (
                                                            <div
                                                                className={`custom-select-option${contextMode === 'system_only' ? ' active' : ''}`}
                                                                onClick={(e) => { e.stopPropagation(); onContextModeChange('system_only'); setShowDropdown(false); }}
                                                            >Только системная инструкция</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {(contextMode === 'last_n' || contextMode === 'first_n') && (
                                            <div className="settings-field">
                                                <label>Количество пар</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={50}
                                                    value={contextN}
                                                    onChange={(e) => onContextNChange(Number(e.target.value))}
                                                />
                                            </div>
                                        )}
                                        {contextMode === 'system_only' && (
                                            <div className="settings-field">
                                                <span style={{ fontSize: '12px', color: 'var(--accent-light)' }}>
                                                    Только системная инструкция и файлы помощника
                                                </span>
                                            </div>
                                        )}
                                        {state.settings.apiProvider === 'polza' && onReasoningChange && (
                                            <div className="settings-field" style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer', margin: 0 }}>
                                                    <span style={{ fontSize: '13px', textTransform: 'none', fontWeight: 600 }}>Токены рассуждений</span>
                                                    <div className="toggle-switch" style={{ transform: 'scale(0.8)', transformOrigin: 'right center', margin: 0 }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={!!enableReasoning}
                                                            onChange={(e) => onReasoningChange(e.target.checked)}
                                                        />
                                                        <span className="toggle-slider"></span>
                                                    </div>
                                                </label>
                                            </div>
                                        )}
                                        {state.settings.apiProvider === 'polza' && onWebSearchChange && (
                                            <div className="settings-field" style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer', margin: 0 }}>
                                                    <span style={{ fontSize: '13px', textTransform: 'none', fontWeight: 600 }}>Поиск в интернете</span>
                                                    <div className="toggle-switch" style={{ transform: 'scale(0.8)', transformOrigin: 'right center', margin: 0 }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={!!enableWebSearch}
                                                            onChange={(e) => onWebSearchChange(e.target.checked)}
                                                        />
                                                        <span className="toggle-slider"></span>
                                                    </div>
                                                </label>
                                            </div>
                                        )}

                                    </div>
                                )}
                            </div>
                        )}

                        {(model.includes('image') || model.includes('image-preview')) && (
                            <div className="image-settings-inline" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '8px' }}>
                                <select
                                    value={imageSize}
                                    onChange={(e) => onImageSizeChange(e.target.value)}
                                    className="custom-select-trigger"
                                    style={{ background: 'var(--surface-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', appearance: 'auto', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', width: 'auto' }}
                                    title="Пропорции изображения"
                                >
                                    <option value="1024x1024">1:1</option>
                                    <option value="848x1264">2:3</option>
                                    <option value="1264x848">3:2</option>
                                    <option value="896x1200">3:4</option>
                                    <option value="1200x896">4:3</option>
                                    <option value="928x1152">4:5</option>
                                    <option value="1152x928">5:4</option>
                                    <option value="1376x768">16:9</option>
                                    <option value="768x1376">9:16</option>
                                    <option value="1584x672">21:9</option>
                                </select>
                                <select
                                    value={imageQuality}
                                    onChange={(e) => onImageQualityChange(e.target.value)}
                                    className="custom-select-trigger"
                                    style={{ background: 'var(--surface-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', appearance: 'auto', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', width: 'auto' }}
                                    title="Качество генерации"
                                >
                                    <option value="low">1K</option>
                                    <option value="medium">2K</option>
                                    <option value="high">4K</option>
                                </select>
                            </div>
                        )}
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
                        placeholder={isDragging ? "Перетащите файлы сюда..." : (placeholder || "Введите сообщение...")}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        rows={1}
                        disabled={isStreaming}
                    />
                </div>
            </div>
        </div >
    );
}
