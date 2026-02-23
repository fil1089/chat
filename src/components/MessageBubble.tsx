import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { IconCopy, IconCheck, IconRegenerate, IconDownload, IconEdit, IconMarkdown, IconDoc, IconChevronDown } from './Icons';
import type { Message } from '../types';

interface StreamStatus {
    type: string;
    message: string;
}

interface MessageBubbleProps {
    message: Message;
    isLatest: boolean;
    isStreaming?: boolean;
    streamStatus?: StreamStatus | null;
    onRegenerate?: () => void;
    onEdit?: (text: string) => void;
}

export default function MessageBubble({ message, isLatest, isStreaming, streamStatus, onRegenerate, onEdit }: MessageBubbleProps) {
    const [copied, setCopied] = useState(false);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const isUser = message.role === 'user';
    const displayText = message.displayContent || message.content;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const handleDownload = (format: 'md' | 'txt') => {
        const content = message.content;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `message.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        setShowDownloadMenu(false);
    };

    const handleEdit = () => {
        onEdit?.(message.content);
    };

    return (
        <div className={`message ${isUser ? 'message-user' : 'message-assistant'}`}>
            <div className="message-avatar">
                {isUser ? '👤' : '✨'}
            </div>
            <div className="message-body">
                {isUser && message.attachments && message.attachments.length > 0 && (
                    <div className="message-attachments" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        {message.attachments.map((att, i) => (
                            <div key={i} style={{ fontSize: '12px', padding: '4px 8px', background: 'var(--surface-glass)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                📎 {att.name} ({(att.size / 1024).toFixed(1)} KB)
                            </div>
                        ))}
                    </div>
                )}

                {/* Stream status for research mode */}
                {isStreaming && streamStatus && (
                    <div className="research-progress">
                        <div className={`research-step ${streamStatus.type}`}>
                            <span className="step-icon">{streamStatus.type === 'status' ? '🔄' : streamStatus.type === 'search' ? '🔍' : '💭'}</span>
                            <span className="step-message">{streamStatus.message}</span>
                        </div>
                    </div>
                )}

                <div className="message-content">
                    {isUser ? (
                        <p>{displayText}</p>
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
                    )}
                </div>

                {/* Action bar */}
                <div className="msg-action-bar">
                    {!isUser && (
                        <>
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
                                            <IconDoc size={14} /> Текст (.txt)
                                        </button>
                                    </div>
                                )}
                            </div>
                            {isLatest && onRegenerate && (
                                <button className="msg-action-icon" onClick={onRegenerate} title="Перегенерировать">
                                    <IconRegenerate size={14} />
                                </button>
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
