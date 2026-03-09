import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useGlobalAuthModal } from '../App';
import { useNavigate } from 'react-router-dom';
import { streamResponsePolza, ALL_POLZA_MODELS } from '../services/polzaApi';
import { MODELS } from '../services/youApi';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import ThreadNav from './ThreadNav';
import { IconBrain, IconFolder, IconMessage, IconArrowUp, IconArrowDown, IconFileText, IconImage, IconAttachment, IconAudio, IconVideo, IconMenu, IconSidebarRight, IconClose } from './Icons';
import { v4 as uuidv4 } from 'uuid';
import type { Message, Chat, Attachment, StatusEvent, Space, ContextMode } from '../types';
import ModelSelector from './ModelSelector';

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
    const [rightPanelOpen, setRightPanelOpen] = useState(false);

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

        // Prepare context for API: 
        // 1. If regenerating, we send messages BEFORE the target message
        // 2. Apply context mode (last_n, system_only, etc.)
        let baseMessages = chat.messages;
        if (targetMessageId) {
            const idx = chat.messages.findIndex(m => m.id === targetMessageId);
            if (idx !== -1) {
                baseMessages = chat.messages.slice(0, idx);
            }
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
            let updatedMessages;
            if (targetMessageId) {
                updatedMessages = chat.messages.map(m => {
                    if (m.id !== targetMessageId) return m;
                    const versions = [...(m.versions || [])];
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
                    return {
                        ...m,
                        content,
                        versions,
                        usage: usage || undefined,
                        reasoningContent: reasoning || undefined,
                        annotations: anns.length > 0 ? anns : undefined
                    };
                });
            } else {
                updatedMessages = [...chat.messages, {
                    ...assistantMessage,
                    content,
                    model: currentModel,
                    usage: usage || undefined,
                    reasoningContent: reasoning || undefined,
                    annotations: anns.length > 0 ? anns : undefined
                }];
            }

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

            let errorMessages;
            if (targetMessageId) {
                errorMessages = chat.messages.map(m => {
                    if (m.id !== targetMessageId) return m;
                    return { ...m, content: errorText };
                });
            } else {
                errorMessages = [...chat.messages, { ...assistantMessage, content: errorText }];
            }

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

    const messages = activeChat?.messages || [];
    const isSearch = model === 'you-search' || model === 'you-research';

    return (
        <div className="chat-layout-with-nav">
            <div className="chat-main-area">
                <div className="mobile-chat-header">
                    <button className="mobile-menu-btn" onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}>
                        <IconMenu size={20} />
                    </button>
                    {!isSearch && !activeSpace && (
                        <div className="mobile-model-selector">
                            <ModelSelector
                                model={model}
                                onModelChange={setModel}
                                isMobileHeader={true}
                            />
                        </div>
                    )}
                    {activeSpace && <div className="mobile-space-title">{activeSpace.name}</div>}
                    <button className="mobile-right-panel-btn" onClick={() => setRightPanelOpen(true)}>
                        <IconSidebarRight size={20} />
                    </button>
                </div>

                {activeSpace && (
                    <div className="space-banner desktop-only">
                        <IconFolder size={16} className="space-banner-icon" />
                        {activeSpace.name}
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <div className="chat-empty-content">
                            <div className="chat-empty-icon">
                                <IconBrain size={48} />
                            </div>
                            <h2>{activeSpace ? activeSpace.name : 'Начните диалог'}</h2>
                            <p>{activeSpace?.description || 'Выберите модель и отправьте сообщение'}</p>
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
                    hideModelSelector={isSearch}
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
            <div className={`dialogue-nav-sidebar ${rightPanelOpen ? 'mobile-open' : ''}`}>
                <div className="right-panel-close-btn" onClick={() => setRightPanelOpen(false)}>
                    <IconClose size={18} />
                </div>
                <div className="sidebar-section" style={{ padding: '24px' }}>
                    {(() => {
                        const allModels = [...MODELS, ...ALL_POLZA_MODELS];
                        const currentModel = allModels.find(m => m.id === model);
                        return currentModel ? (
                            <div className="model-info-card">
                                <div className="model-info-label">Модель</div>
                                <div className="model-info-name">{currentModel.name}</div>
                                <div className="model-info-desc">{currentModel.desc}</div>
                                {(currentModel.pricing || currentModel.capabilities) && (
                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {currentModel.pricing && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                <span>Стоимость (1M):</span>
                                                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{currentModel.pricing.prompt} / {currentModel.pricing.completion}</span>
                                            </div>
                                        )}
                                        {currentModel.capabilities && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                <span>Возможности:</span>
                                                <div style={{ display: 'flex', gap: '6px', opacity: 0.8, color: 'var(--accent-light)' }}>
                                                    {currentModel.capabilities.text && <span title="Текст"><IconFileText size={14} /></span>}
                                                    {currentModel.capabilities.image && <span title="Изображения"><IconImage size={14} /></span>}
                                                    {currentModel.capabilities.file && <span title="Файлы"><IconAttachment size={14} /></span>}
                                                    {currentModel.capabilities.audio && <span title="Аудио"><IconAudio size={14} /></span>}
                                                    {currentModel.capabilities.video && <span title="Видео"><IconVideo size={14} /></span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : null;
                    })()}
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
