import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { IconCopy, IconCheck, IconRegenerate, IconDownload, IconEdit, IconMarkdown, IconPdf, IconDoc, IconFileText, IconChevronDown, IconUser, IconBrain, IconAttachment, IconHistory, IconSearch, IconChevronLeft, IconChevronRight, IconError } from './Icons';
import { useApp } from '../context/AppContext';
import { MODELS, calcCost } from '../services/youApi';
import MessageModelSelector from './MessageModelSelector';
import type { Message } from '../types';

interface StreamStatus {
    type: string;
    message: string;
}

interface MessageBubbleProps {
    message: Message;
    chatId: string; // Added to handle version switch
    isLatest: boolean;
    isStreaming?: boolean;
    streamStatus?: StreamStatus | null;
    onRegenerate?: (model?: string) => void;
    onEdit?: (text: string) => void;
}

export default function MessageBubble({ message, chatId, isLatest, isStreaming, streamStatus, onRegenerate, onEdit }: MessageBubbleProps) {
    const { state, dispatch } = useApp();
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(message.content);
    const [showFull, setShowFull] = useState(false);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const CHAR_LIMIT = 600;

    const isUser = message.role === 'user';
    const activeIdx = message.activeVersion ?? 0;
    const currentVersion = message.versions?.[activeIdx];
    const displayText = currentVersion?.content ?? (message.displayContent || message.content);
    const displayModel = currentVersion?.model || message.model;
    const displayUsage = currentVersion?.usage || message.usage;

    const isLong = isUser && displayText.length > CHAR_LIMIT;
    const contentToDisplay = isLong && !showFull ? displayText.slice(0, CHAR_LIMIT) : displayText;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const handleDownload = async (format: 'md' | 'txt' | 'pdf' | 'docx') => {
        const content = displayText; // Export the current version's text
        const filename = `message.${format}`;

        if (format === 'pdf') {
            if (contentRef.current) {
                const element = contentRef.current.cloneNode(true) as HTMLElement;

                // Professional Document styling for the export
                element.style.width = '800px';
                element.style.padding = '60px';
                element.style.backgroundColor = '#ffffff';
                element.style.color = '#000000';
                element.style.fontFamily = 'serif';
                element.style.fontSize = '18px';
                element.style.lineHeight = '1.6';
                element.style.boxSizing = 'border-box';

                // Style all internal elements for white background
                element.querySelectorAll('*').forEach(child => {
                    const el = child as HTMLElement;
                    if (el.tagName === 'P') {
                        el.style.color = '#000000';
                        el.style.marginBottom = '15px';
                    }
                    if (el.tagName === 'PRE') {
                        el.style.backgroundColor = '#f6f8fa';
                        el.style.color = '#24292e';
                        el.style.border = '1px solid #e1e4e8';
                        el.style.padding = '20px';
                        el.style.borderRadius = '8px';
                        el.style.fontSize = '16px';
                        el.style.whiteSpace = 'pre-wrap';
                        el.style.wordBreak = 'break-all';
                    }
                    if (el.classList.contains('inline-code')) {
                        el.style.backgroundColor = '#f3f3f3';
                        el.style.color = '#d73a49';
                        el.style.padding = '2px 5px';
                        el.style.borderRadius = '4px';
                    }
                });

                const opt = {
                    margin: 0,
                    filename: filename,
                    image: { type: 'jpeg' as const, quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, letterRendering: true, width: 800 },
                    jsPDF: { unit: 'px', format: 'a4', orientation: 'portrait' as const }
                };

                html2pdf().from(element).set(opt).save();
            } else {
                const doc = new jsPDF();
                doc.text(content, 10, 10);
                doc.save(filename);
            }
        } else if (format === 'docx') {
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: content.split('\n').map(line =>
                        new Paragraph({
                            children: [new TextRun(line)],
                        })
                    ),
                }],
            });

            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }

        setShowDownloadMenu(false);
    };

    const handleEdit = () => {
        onEdit?.(message.content);
    };

    const handleVersionChange = (dir: number) => {
        if (!message.versions) return;
        const next = activeIdx + dir;
        if (next >= 0 && next < message.versions.length) {
            dispatch({ type: 'SET_MESSAGE_VERSION', payload: { chatId, messageId: message.id, versionIndex: next } });
        }
    };

    return (
        <div id={message.id} className={`message ${isUser ? 'message-user' : 'message-assistant'}`}>
            <div className="message-avatar">
                {isUser ? <IconUser size={20} /> : <IconBrain size={20} />}
            </div>
            <div className="message-body">
                {isUser && message.attachments && message.attachments.length > 0 && (
                    <div className="message-attachments" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        {message.attachments.map((att: { name: string; size: number }, i: number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '4px 8px', background: 'var(--surface-glass)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                <IconAttachment size={14} /> {att.name} ({(att.size / 1024).toFixed(1)} KB)
                            </div>
                        ))}
                    </div>
                )}

                {/* Stream status for research mode */}
                {isStreaming && streamStatus && (
                    <div className="research-progress">
                        <div className={`research-step ${streamStatus.type}`}>
                            <span className="step-icon">
                                {streamStatus.type === 'status' ? <IconHistory size={14} /> :
                                    streamStatus.type === 'search' ? <IconSearch size={14} /> :
                                        <IconBrain size={14} />}
                            </span>
                            <span className="step-message">{streamStatus.message}</span>
                        </div>
                    </div>
                )}

                <div className="message-content" ref={contentRef}>
                    {isUser ? (
                        <div className="user-message-container">
                            <p>{contentToDisplay}{isLong && !showFull && '...'}</p>
                            {isLong && (
                                <button
                                    className="show-more-link"
                                    onClick={() => setShowFull(!showFull)}
                                >
                                    {showFull ? 'Свернуть' : 'Показать полностью'}
                                </button>
                            )}
                        </div>
                    ) : (
                        displayText.startsWith('Ошибка:') ? (
                            <div className="message-error">
                                <span className="message-error-icon"><IconError size={16} /></span>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                    components={{
                                        code(props: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
                                            const { className, children, ...rest } = props;
                                            const match = /language-(\w+)/.exec(className || '');
                                            const isInline = !match;

                                            if (isInline) {
                                                return <code className="inline-code" {...rest}>{children}</code>;
                                            }

                                            return (
                                                <div className="code-block-wrapper">
                                                    <div className="code-block-header">
                                                        <span className="code-lang">{match?.[1]}</span>
                                                        <button className="code-copy-btn" onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}>
                                                            <IconCopy size={14} /> Скопировать
                                                        </button>
                                                    </div>
                                                    <pre><code className={className} {...rest}>{children}</code></pre>
                                                </div>
                                            );
                                        }
                                    }}
                                >
                                    {displayText}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                                components={{
                                    code(props: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
                                        const { className, children, ...rest } = props;
                                        const match = /language-(\w+)/.exec(className || '');
                                        const isInline = !match;

                                        if (isInline) {
                                            return <code className="inline-code" {...rest}>{children}</code>;
                                        }

                                        return (
                                            <div className="code-block-wrapper">
                                                <div className="code-block-header">
                                                    <span className="code-lang">{match?.[1]}</span>
                                                    <button className="code-copy-btn" onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}>
                                                        <IconCopy size={14} /> Скопировать
                                                    </button>
                                                </div>
                                                <pre><code className={className} {...rest}>{children}</code></pre>
                                            </div>
                                        );
                                    }
                                }}
                            >
                                {displayText}
                            </ReactMarkdown>
                        )
                    )}
                </div>

                {/* Model label & usage */}
                {!isUser && (displayModel || displayUsage) && (
                    <div className="message-model-label">
                        {displayModel && (MODELS.find(m => m.id === displayModel)?.name || displayModel)}
                        {displayUsage && (() => {
                            const u = displayUsage;
                            const cost = calcCost(displayModel || '', u.prompt_tokens, u.completion_tokens);
                            return (
                                <span className="message-usage">
                                    {' · '}{u.prompt_tokens} → {u.completion_tokens} токенов
                                    {cost !== null && <span className="message-cost"> · {cost} ₽</span>}
                                </span>
                            );
                        })()}
                    </div>
                )}

                {/* Action bar */}
                <div className="msg-action-bar">
                    {!isUser && (
                        <>
                            <div className="version-carousel">
                                {message.versions && message.versions.length > 1 && (
                                    <div className="version-nav">
                                        <button
                                            className="version-btn"
                                            onClick={() => handleVersionChange(-1)}
                                            disabled={activeIdx === 0}
                                        >
                                            <IconChevronLeft size={14} />
                                        </button>
                                        <span className="version-info">{activeIdx + 1} / {message.versions.length}</span>
                                        <button
                                            className="version-btn"
                                            onClick={() => handleVersionChange(1)}
                                            disabled={activeIdx === message.versions.length - 1}
                                        >
                                            <IconChevronRight size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button className="msg-action-icon" onClick={handleCopy} title={copied ? 'Скопировано!' : 'Копировать'}>
                                {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                            </button>
                            <div className="msg-action-dropdown">
                                <button className="msg-action-icon" onClick={() => setShowDownloadMenu(!showDownloadMenu)} title="Скачать">
                                    <IconDownload size={14} />
                                </button>
                                <button className="msg-action-icon msg-action-chevron" onClick={() => setShowDownloadMenu(!showDownloadMenu)}>
                                    <IconChevronDown size={14} />
                                </button>
                                {showDownloadMenu && (
                                    <div className="dropdown-menu">
                                        <button onClick={() => handleDownload('md')}>
                                            <IconMarkdown size={14} /> Markdown (.md)
                                        </button>
                                        <button onClick={() => handleDownload('txt')}>
                                            <IconFileText size={14} /> Текст (.txt)
                                        </button>
                                        <button onClick={() => handleDownload('pdf')}>
                                            <IconPdf size={14} /> PDF (.pdf)
                                        </button>
                                        <button onClick={() => handleDownload('docx')}>
                                            <IconDoc size={14} /> Word (.docx)
                                        </button>
                                    </div>
                                )}
                            </div>
                            {isLatest && !isStreaming && onRegenerate && (
                                <div className="regenerate-container">
                                    <button className="msg-action-icon" onClick={() => onRegenerate()} title="Перегенерировать">
                                        <IconRegenerate size={14} />
                                    </button>
                                    <MessageModelSelector onSelect={onRegenerate} />
                                </div>
                            )}
                        </>
                    )}
                    {isUser && (
                        <>
                            <button className="msg-action-icon" onClick={handleCopy} title="Копировать">
                                {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                            </button>
                            <button className="msg-action-icon" onClick={handleEdit} title="Редактировать">
                                <IconEdit size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
