import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useGlobalAuthModal } from '../App';
import { useNavigate } from 'react-router-dom';
import { streamResponsePolza, summarizeChat } from '../services/polzaApi';
import { POLZA_MODELS } from '../services/polzaModels';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import ThreadNav from './ThreadNav';
import { IconBrain, IconFolder, IconMessage, IconArrowUp, IconArrowDown, IconFileText, IconImage, IconAttachment, IconAudio, IconVideo, IconMenu, IconSidebarRight, IconClose, IconCompress } from './Icons';
import { v4 as uuidv4 } from 'uuid';
import type { Message, Chat, Attachment, StatusEvent, Space, ContextMode } from '../types';
import ModelSelector from './ModelSelector';
import { AnimatedDiamond } from './AnimatedDiamond';
import { Typewriter } from './Typewriter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StreamStatus {
    type: string;
    message: string;
}

export default function ChatView() {
    const { state, dispatch } = useApp();
    const { user } = useAuth();
    const { showAuthModal } = useGlobalAuthModal();
    const navigate = useNavigate();
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamStatus, setStreamStatus] = useState<StreamStatus | null>(null);
    const controllerRef = useRef<AbortController | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesStartRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const initialModel = (() => {
        const activeChat = state.chats.find(c => c.id === state.activeChat);
        const activeSpace = state.spaces.find(s => s.id === state.activeSpace);
        if (activeChat?.model) return activeChat.model;
        if (activeSpace?.model) return activeSpace.model;
        return state.settings.defaultModel || 'gpt-4o';
    })();
    const [model, setModel] = useState(initialModel);
    const [contextMode, setContextMode] = useState<ContextMode>('full');
    const [contextN, setContextN] = useState(5);
    const [rightPanelOpen, setRightPanelOpen] = useState(window.innerWidth > 768);
    const [isEmptyLogoHovered, setIsEmptyLogoHovered] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);

    const activeChat = state.chats.find((c) => c.id === state.activeChat);
    const activeSpace = state.spaces.find((s) => s.id === state.activeSpace) as Space | undefined;

    useEffect(() => {
        if (activeChat?.model) {
            setModel(activeChat.model);
        } else if (!activeChat && activeSpace?.model) {
            // Новый чат в спейсе — применяем модель спейса
            setModel(activeSpace.model);
        } else if (!activeChat && !activeSpace) {
            // Обычный новый чат — применяем глобальную модель
            setModel(state.settings.defaultModel || 'gpt-4o');
        }
    }, [activeChat?.id, activeSpace?.id]);

    useEffect(() => {
        if (messagesEndRef.current && !showScrollBottom) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeChat?.messages]);

    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        setShowScrollTop(scrollTop > 500);
        setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 150);
    }, []);

    useEffect(() => {
        handleScroll();
    }, [activeChat?.messages, handleScroll]);

    const scrollToTop = () => {
        messagesStartRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const runStreaming = useCallback(async (chat: Chat, targetMessageId?: string, overrideModel?: string, bypassCache?: boolean) => {
        const currentApiKey = state.settings.polzaApiKey;
        if (!currentApiKey) {
            navigate('/settings');
            return;
        }
        if (isStreaming) return;
        setIsStreaming(true);
        setStreamStatus(null);
        let fullResponse = '';
        const currentModel = overrideModel || model;

        const existingMsg = targetMessageId ? chat.messages.find(m => m.id === targetMessageId) : null;

        const assistantMessage: Message = existingMsg ? { ...existingMsg } : {
            id: uuidv4(),
            role: 'assistant',
            content: '',
            model: currentModel,
            timestamp: Date.now(),
        };

        let currentTargetMessageId = targetMessageId;

        // Pre-insert empty message into UI for visual feedback (unless regenerating)
        if (!currentTargetMessageId) {
            chat = {
                ...chat,
                messages: [...chat.messages, assistantMessage],
                updatedAt: Date.now()
            };
            dispatch({ type: 'UPDATE_CHAT', payload: chat });
            currentTargetMessageId = assistantMessage.id;
        }

        // Prepare context for API: 
        // 1. If regenerating, we send messages BEFORE the target message
        // 2. Apply context mode (last_n, system_only, etc.)
        let baseMessages = chat.messages;
        const targetIdx = chat.messages.findIndex(m => m.id === currentTargetMessageId);
        if (targetIdx !== -1) {
            baseMessages = chat.messages.slice(0, targetIdx);
        }

        const messagesToSend = contextMode === 'system_only'
            ? baseMessages.filter(m => m.role === 'user').slice(-1)
            : contextMode === 'last_n'
                ? baseMessages.slice(-(contextN * 2))
                : contextMode === 'first_n'
                    ? baseMessages.slice(0, contextN * 2)
                    : baseMessages;

        let capturedUsage: { prompt_tokens: number; completion_tokens: number; total_tokens: number; cost_rub?: number } | null = null;
        let capturedReasoning = '';
        let capturedAnnotations: any[] = [];

        let lastUpdateTime = Date.now();
        const THROTTLE_MS = 150;

        const updateUI = (content: string, reasoning: string, anns: any[], usage: any) => {
            const updatedMessages = chat.messages.map(m => {
                if (m.id !== currentTargetMessageId) return m;

                const baseUpdate = {
                    ...m,
                    content,
                    model: currentModel,
                    usage: usage || undefined,
                    reasoningContent: reasoning || undefined,
                    annotations: anns.length > 0 ? anns : undefined
                };

                if (m.versions) {
                    const versions = [...m.versions];
                    const activeIdx = m.activeVersion ?? 0;
                    if (versions[activeIdx]) {
                        versions[activeIdx] = {
                            ...versions[activeIdx],
                            content,
                            model: currentModel,
                            usage: usage || undefined,
                            timestamp: Date.now(),
                            reasoningContent: reasoning || undefined,
                            annotations: anns.length > 0 ? anns : undefined
                        };
                    }
                    return { ...baseUpdate, versions };
                }

                return baseUpdate;
            });

            const updatedChat: Chat = {
                ...chat,
                messages: updatedMessages,
                updatedAt: Date.now(),
            };
            dispatch({ type: 'UPDATE_CHAT', payload: updatedChat });
        };

        const streamCallback = streamResponsePolza({
            apiKey: state.settings.polzaApiKey,
            model: currentModel,
            messages: messagesToSend.map(m => {
                const parts: any[] = [];
                if (m.content) parts.push({ type: 'text', text: m.content });
                if (m.fullAttachments) {
                    m.fullAttachments.forEach(att => {
                        if (att.content) {
                            if (att.type === 'image') parts.push({ type: 'image_url', image_url: { url: att.content } });
                            else if (att.type === 'file') parts.push({ type: 'file', file: { filename: att.name, file_data: att.content } });
                        }
                    });
                }
                return { role: m.role, content: (m.fullAttachments?.length ? parts : m.content) };
            }),
            enableReasoning: state.settings.enableReasoning,
            enableWebSearch: state.settings.enableWebSearch,
            systemInstructions: activeSpace?.instructions || '',
            fileContents: activeSpace?.files || [],
            signal: controllerRef.current?.signal,
            // enableAutoTranslate removed — feature disabled
            onUpdate: (fullText: string) => {
                fullResponse = fullText;
                const now = Date.now();
                if (now - lastUpdateTime > THROTTLE_MS) {
                    updateUI(fullResponse, capturedReasoning, capturedAnnotations, capturedUsage);
                    lastUpdateTime = now;
                }
            },
            onUsage: (usage) => { capturedUsage = usage; },
            onAnnotations: (anns: any[]) => { capturedAnnotations = [...capturedAnnotations, ...anns]; },
            onStatus: (status) => {
                if (status.type === 'reasoning') {
                    capturedReasoning += status.message;
                    const now = Date.now();
                    if (now - lastUpdateTime > THROTTLE_MS) {
                        updateUI(fullResponse, capturedReasoning, capturedAnnotations, capturedUsage);
                        lastUpdateTime = now;
                    }
                } else {
                    setStreamStatus(status as any);
                }
            }
        });

        // Polza doesn't return an AbortController in the same way right now, but we'll mock the completion chain
        (streamCallback as Promise<void>).then(() => {
            setIsStreaming(false);
            setStreamStatus(null);
            updateUI(fullResponse, capturedReasoning, capturedAnnotations, capturedUsage);
        }).catch((error: any) => {
            setIsStreaming(false);
            setStreamStatus(null);
            const errorText = `Ошибка: ${error.message || error}`;

            const errorMessages = chat.messages.map(m => {
                if (m.id !== currentTargetMessageId) return m;
                return { ...m, content: errorText };
            });

            const errorChat: Chat = {
                ...chat,
                messages: errorMessages,
                updatedAt: Date.now(),
            };
            dispatch({ type: 'UPDATE_CHAT', payload: errorChat });
        });

    }, [state.settings.polzaApiKey, model, contextMode, contextN, activeSpace, dispatch, navigate]);

    // Auto-trigger response for new chats from dashboard
    useEffect(() => {
        if (activeChat && activeChat.messages.length === 1 && activeChat.messages[0].role === 'user' && !isStreaming) {
            runStreaming(activeChat);
        }
    }, [activeChat?.id, runStreaming, isStreaming]);

    const handleSend = useCallback(async (text: string, attachments: Attachment[] = []) => {
        if (!user) {
            showAuthModal('Для отправки сообщений необходимо войти');
            return;
        }

        if (!text.trim() && attachments.length === 0) return;

        const textAttachments = attachments.filter(a => a.type === 'text');
        const nonTextAttachments = attachments.filter(a => a.type === 'image' || a.type === 'file');

        const userMessage: Message = {
            id: uuidv4(),
            role: 'user',
            content: textAttachments.length > 0
                ? `${text}\n\n${textAttachments.map(a => `[Прикреплен текстовый файл: ${a.name}]`).join('\n')}`
                : text,
            displayContent: text,
            attachments: attachments.map(a => ({ name: a.name, size: a.size })),
            fullAttachments: attachments.length > 0 ? attachments : undefined,
            timestamp: Date.now(),
        };

        let chat: Chat;
        if (activeChat) {
            chat = {
                ...activeChat,
                messages: [...activeChat.messages, userMessage],
                model,
                updatedAt: Date.now(),
            };
        } else {
            chat = {
                id: uuidv4(),
                title: text.slice(0, 50) || 'Новый чат',
                messages: [userMessage],
                model,
                spaceId: state.activeSpace || undefined,
                timestamp: Date.now(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            dispatch({ type: 'NEW_CHAT', payload: chat });
        }
        dispatch({ type: 'UPDATE_CHAT', payload: chat });
        runStreaming(chat);
    }, [activeChat, model, state.activeSpace, dispatch, runStreaming, user, showAuthModal]);

    const handleStop = () => {
        controllerRef.current?.abort();
        setIsStreaming(false);
        setStreamStatus(null);
    };

    const handleRegenerate = useCallback((regenerateModel?: string) => {
        if (!user) {
            showAuthModal('Для генерации ответов необходимо войти');
            return;
        }

        if (!activeChat || activeChat.messages.length < 2) return;

        const lastMsg = activeChat.messages[activeChat.messages.length - 1];
        if (lastMsg.role !== 'assistant') return;

        // Prepare versions if not present
        const currentVersions = lastMsg.versions || [{
            content: lastMsg.content,
            model: activeChat.model,
            timestamp: lastMsg.timestamp || Date.now()
        }];

        const newVersionIndex = currentVersions.length;
        const newVersions = [...currentVersions, { content: '', model: regenerateModel || model, timestamp: Date.now() }];

        const updatedMessages = activeChat.messages.map((m, i) => {
            if (i === activeChat.messages.length - 1) {
                return { ...m, versions: newVersions, activeVersion: newVersionIndex, content: '' };
            }
            return m;
        });

        const updatedChat: Chat = { ...activeChat, messages: updatedMessages, updatedAt: Date.now() };
        dispatch({ type: 'UPDATE_CHAT', payload: updatedChat });

        // Run streaming for the new version, bypassing cache
        runStreaming(updatedChat, lastMsg.id, regenerateModel || model, true);
    }, [activeChat, model, dispatch, runStreaming, user, showAuthModal]);

    const handleEdit = (text: string) => {
        window.dispatchEvent(new CustomEvent('edit-chat-message', { detail: { text } }));
    };

    const handleSummarizeAndContinue = useCallback(async () => {
        if (!activeChat || activeChat.messages.length < 2 || isSummarizing) return;
        if (!state.settings.polzaApiKey) {
            navigate('/settings');
            return;
        }

        setIsSummarizing(true);
        try {
            const messagesToSummarize = activeChat.messages.map(m => ({
                role: m.role,
                content: m.content,
            }));

            const summary = await summarizeChat({
                apiKey: state.settings.polzaApiKey,
                model: model,
                messages: messagesToSummarize,
            });

            const systemMessage: Message = {
                id: uuidv4(),
                role: 'system',
                content: `Это продолжение предыдущего диалога. Ниже — краткое саммари того, что обсуждалось ранее. Используй эту информацию как контекст для продолжения разговора. Отвечай так, будто ты помнишь весь предыдущий диалог.\n\n---\n${summary}\n---`,
                timestamp: Date.now(),
            };

            const assistantGreeting: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: `✅ Чат сжат! Я прочитал саммари предыдущего диалога и готов продолжить.\n\n**Краткое содержание:**\n${summary}`,
                model: model,
                timestamp: Date.now(),
            };

            const newChat: Chat = {
                id: uuidv4(),
                title: `Продолжение: ${activeChat.title}`,
                messages: [systemMessage, assistantGreeting],
                model,
                spaceId: activeChat.spaceId || state.activeSpace || undefined,
                timestamp: Date.now(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            dispatch({ type: 'NEW_CHAT', payload: newChat });
        } catch (error: any) {
            console.error('Ошибка при создании саммари:', error);
            alert(`Не удалось создать саммари: ${error.message}`);
        } finally {
            setIsSummarizing(false);
        }
    }, [activeChat, model, state.settings.polzaApiKey, state.activeSpace, dispatch, navigate, isSummarizing]);

    const messages = activeChat?.messages || [];

    return (
        <div className="chat-layout-with-nav">
            <div className="chat-main-area">
                <div className="mobile-chat-header">
                    <button className="mobile-menu-btn" onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}>
                        <IconMenu size={20} />
                    </button>
                    <div className="mobile-model-selector">
                            <ModelSelector
                                model={model}
                                onModelChange={setModel}
                                isMobileHeader={true}
                            />
                        </div>
                    {activeSpace && (
                        <div 
                            className="mobile-space-title desktop-only" 
                            onClick={() => {
                                dispatch({ type: 'SET_ACTIVE_CHAT', payload: null });
                                navigate(`/space/${activeSpace.id}`);
                            }} 
                            style={{ cursor: 'pointer' }}
                        >
                            {activeSpace.name}
                        </div>
                    )}
                    <button className="mobile-right-panel-btn" onClick={() => setRightPanelOpen(!rightPanelOpen)}>
                        <IconSidebarRight size={20} />
                    </button>
                </div>

                {!rightPanelOpen && (
                    <div className="desktop-only" style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
                        <button 
                            className="right-sidebar-toggle-fixed" 
                            onClick={() => setRightPanelOpen(true)}
                            title="Показать панель"
                        >
                            <IconSidebarRight size={18} />
                        </button>
                    </div>
                )}

                {activeSpace && (
                    <div className="space-banner desktop-only" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div onClick={() => {
                            dispatch({ type: 'SET_ACTIVE_CHAT', payload: null });
                            navigate(`/space/${activeSpace.id}`);
                        }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flex: 1, gap: '8px' }}>
                            <IconFolder size={16} className="space-banner-icon" />
                            {activeSpace.name}
                        </div>
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <div className="chat-empty-content">
                            <div 
                                className="chat-empty-icon" 
                                onMouseEnter={() => setIsEmptyLogoHovered(true)}
                                onMouseLeave={() => setIsEmptyLogoHovered(false)}
                                style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <AnimatedDiamond size={200} isPulsating={isEmptyLogoHovered} isIntro={true} />
                            </div>
                            <h2 style={{ textAlign: 'center' }}>
                                <Typewriter text={activeSpace ? activeSpace.name : 'Начните диалог'} delay={2000} speed={70} />
                            </h2>
                            {activeSpace?.description ? (
                                <div className="space-description-markdown" style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'left', maxWidth: '600px', margin: '16px auto', fontSize: '14px', lineHeight: '1.6', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {activeSpace.description}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
                                    <Typewriter text="Выберите модель и отправьте сообщение" delay={3500} speed={40} />
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="messages-container" ref={scrollContainerRef} onScroll={handleScroll}>
                        <div ref={messagesStartRef} />
                        {messages.map((msg, i) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                chatId={activeChat!.id}
                                isLatest={i === messages.length - 1 && msg.role === 'assistant'}
                                isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
                                onRegenerate={i === messages.length - 1 && msg.role === 'assistant' ? handleRegenerate : undefined}
                                onEdit={msg.role === 'user' ? handleEdit : undefined}
                                streamStatus={isStreaming && i === messages.length - 1 && msg.role === 'assistant' ? streamStatus : null}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                <div className="chat-scroll-buttons">
                    <button
                        className={`chat-scroll-btn ${showScrollTop ? 'visible' : ''}`}
                        onClick={scrollToTop}
                        title="Наверх"
                    >
                        <IconArrowUp size={20} />
                    </button>
                    <button
                        className={`chat-scroll-btn ${showScrollBottom ? 'visible' : ''}`}
                        onClick={scrollToBottom}
                        title="Вниз"
                    >
                        <IconArrowDown size={20} />
                    </button>
                </div>

                <ChatInput
                    onSend={handleSend}
                    model={model}
                    onModelChange={setModel}
                    isStreaming={isStreaming}
                    onStop={handleStop}
                    hideModelSelector={false}
                    contextMode={contextMode}
                    contextN={contextN}
                    onContextModeChange={setContextMode}
                    onContextNChange={setContextN}
                    hasSystemInstruction={!!activeSpace?.instructions}
                    imageSize={state.settings.imageSize || '1024x1024'}
                    onImageSizeChange={(size) => dispatch({ type: 'UPDATE_SETTINGS', payload: { imageSize: size } })}
                    imageQuality={state.settings.imageQuality || 'high'}
                    onImageQualityChange={(quality) => dispatch({ type: 'UPDATE_SETTINGS', payload: { imageQuality: quality } })}
                    enableReasoning={state.settings.enableReasoning}
                    onReasoningChange={(val) => dispatch({ type: 'UPDATE_SETTINGS', payload: { enableReasoning: val as any } })}
                    enableWebSearch={state.settings.enableWebSearch}
                    onWebSearchChange={(val) => dispatch({ type: 'UPDATE_SETTINGS', payload: { enableWebSearch: val as any } })}
                />
            </div>

            {rightPanelOpen && <div className="right-panel-overlay" onClick={() => setRightPanelOpen(false)} />}
            <div className={`dialogue-nav-sidebar ${rightPanelOpen ? 'mobile-open' : 'desktop-hidden'}`}>
                <div className="desktop-only" style={{ padding: '12px 12px 0 24px', display: 'flex', justifyContent: 'flex-start' }}>
                    <button 
                        className="btn-ghost btn-sm" 
                        onClick={() => setRightPanelOpen(false)}
                        style={{ padding: '8px', opacity: 0.6 }}
                        title="Скрыть панель"
                    >
                        <IconSidebarRight size={18} />
                    </button>
                </div>
                <div className="right-panel-close-btn" onClick={() => setRightPanelOpen(false)}>
                    <IconClose size={18} />
                </div>
                <div className="sidebar-section" style={{ padding: '24px' }}>
                    {(() => {
                        const allModels = POLZA_MODELS;
                        const m = allModels.find(m => m.id === model);
                        if (!m) return null;

                        return (
                            <div className="model-info-card">
                                <div className="model-info-label">Модель</div>
                                <div className="model-info-name">{m.name}</div>
                                <div className="model-info-desc">{m.desc}</div>
                                
                                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                                    <div className="model-details-grid" style={{ gridTemplateColumns: '1fr', gap: '8px' }}>
                                        {m.pricing?.prompt && (
                                            <div className="model-detail-item">
                                                <span className="detail-label">Ввод:</span>
                                                <span className="detail-value">{m.pricing.prompt}</span>
                                            </div>
                                        )}
                                        {m.pricing?.completion && (
                                            <div className="model-detail-item">
                                                <span className="detail-label">Вывод:</span>
                                                <span className="detail-value">{m.pricing.completion}</span>
                                            </div>
                                        )}
                                        {m.pricing?.cacheRead && (
                                            <div className="model-detail-item">
                                                <span className="detail-label">Кэш чтение:</span>
                                                <span className="detail-value">{m.pricing.cacheRead}</span>
                                            </div>
                                        )}
                                        {m.pricing?.cacheWrite && (
                                            <div className="model-detail-item">
                                                <span className="detail-label">Кэш запись:</span>
                                                <span className="detail-value">{m.pricing.cacheWrite}</span>
                                            </div>
                                        )}
                                        {m.pricing?.search && (
                                            <div className="model-detail-item">
                                                <span className="detail-label">Веб-поиск:</span>
                                                <span className="detail-value">{m.pricing.search}</span>
                                            </div>
                                        )}
                                        {m.pricing?.image && (
                                            <div className="model-detail-item">
                                                <span className="detail-label">Изображение:</span>
                                                <span className="detail-value">{m.pricing.image}</span>
                                            </div>
                                        )}
                                        {m.pricing?.reasoning && (
                                            <div className="model-detail-item">
                                                <span className="detail-label">Рассуждения:</span>
                                                <span className="detail-value">{m.pricing.reasoning}</span>
                                            </div>
                                        )}
                                        {m.specs?.context && (
                                            <div className="model-detail-item">
                                                <span className="detail-label">Контекст:</span>
                                                <span className="detail-value">{m.specs.context}</span>
                                            </div>
                                        )}
                                        {m.specs?.tokens && (
                                            <div className="model-detail-item">
                                                <span className="detail-label">Макс. токены:</span>
                                                <span className="detail-value">{m.specs.tokens}</span>
                                            </div>
                                        )}
                                    </div>

                                    {m.capabilities && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '12px' }}>
                                            <span>Возможности:</span>
                                            <div style={{ display: 'flex', gap: '6px', opacity: 0.8, color: 'var(--accent-light)' }}>
                                                {m.capabilities.text && <span title="Текст"><IconFileText size={14} /></span>}
                                                {m.capabilities.image && <span title="Изображения"><IconImage size={14} /></span>}
                                                {m.capabilities.file && <span title="Файлы"><IconAttachment size={14} /></span>}
                                                {m.capabilities.audio && <span title="Аудио"><IconAudio size={14} /></span>}
                                                {m.capabilities.video && <span title="Видео"><IconVideo size={14} /></span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                    {activeChat && messages.length >= 4 && (
                        <button
                            className={`summarize-btn ${isSummarizing ? 'loading' : ''}`}
                            onClick={handleSummarizeAndContinue}
                            disabled={isSummarizing || isStreaming}
                            title="Сжать чат — создать саммари и продолжить в новом чате"
                        >
                            <IconCompress size={16} />
                            <span>{isSummarizing ? 'Создаю саммари...' : 'Сжать чат'}</span>
                        </button>
                    )}

                    <h3>Содержание беседы</h3>
                    {messages.length > 0 ? (
                        <div className="dialogue-history-list">
                            {messages.filter(m => m.role === 'user').map((msg, idx) => (
                                <div key={msg.id} className="dialogue-history-item" onClick={() => {
                                    const element = document.getElementById(msg.id);
                                    element?.scrollIntoView({ behavior: 'smooth' });
                                }}>
                                    <IconMessage size={14} />
                                    <span>{msg.displayContent || msg.content.slice(0, 40)}...</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Тут появится история ваших сообщений</p>
                    )}
                </div>
            </div>
        </div>
    );
}
