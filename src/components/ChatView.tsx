import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { streamResponse, MODELS } from '../services/youApi';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import ThreadNav from './ThreadNav';
import { IconBrain, IconFolder, IconMessage } from './Icons';
import { v4 as uuidv4 } from 'uuid';
import type { Message, Chat, Attachment, StatusEvent, Space, ContextMode } from '../types';

interface StreamStatus {
    type: string;
    message: string;
}

export default function ChatView() {
    const { state, dispatch } = useApp();
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamStatus, setStreamStatus] = useState<StreamStatus | null>(null);
    const controllerRef = useRef<AbortController | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChat?.messages]);

    const runStreaming = useCallback(async (chat: Chat, targetMessageId?: string, overrideModel?: string) => {
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
                : baseMessages;

        let capturedUsage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null = null;

        const controller = streamResponse({
            apiKey: state.settings.apiKey,
            youApiKey: state.settings.youApiKey,
            model: currentModel,
            messages: messagesToSend,
            systemInstructions: activeSpace?.instructions || '',
            fileContents: activeSpace?.files || [],
            onDelta: (delta: string) => {
                fullResponse += delta;

                let updatedMessages;
                if (targetMessageId) {
                    updatedMessages = chat.messages.map(m => {
                        if (m.id !== targetMessageId) return m;
                        // Handle versions
                        const versions = [...(m.versions || [])];
                        const activeIdx = m.activeVersion ?? 0;
                        if (versions[activeIdx]) {
                            versions[activeIdx] = {
                                ...versions[activeIdx],
                                content: fullResponse,
                                model: currentModel,
                                usage: capturedUsage || undefined,
                                timestamp: Date.now()
                            };
                        }
                        return { ...m, content: fullResponse, versions, usage: capturedUsage || undefined };
                    });
                } else {
                    updatedMessages = [...chat.messages, { ...assistantMessage, content: fullResponse, model: currentModel, usage: capturedUsage || undefined }];
                }

                const updatedChat: Chat = {
                    ...chat,
                    messages: updatedMessages,
                    updatedAt: Date.now(),
                };
                dispatch({ type: 'UPDATE_CHAT', payload: updatedChat });
            },
            onStatus: (status: StatusEvent) => {
                setStreamStatus(status);
            },
            onUsage: (usage) => {
                capturedUsage = usage;
            },
            onDone: () => {
                setIsStreaming(false);
                setStreamStatus(null);

                let finalMessages;
                if (targetMessageId) {
                    finalMessages = chat.messages.map(m => {
                        if (m.id !== targetMessageId) return m;
                        const versions = [...(m.versions || [])];
                        const activeIdx = m.activeVersion ?? 0;
                        if (versions[activeIdx]) {
                            versions[activeIdx] = {
                                ...versions[activeIdx],
                                content: fullResponse,
                                model: currentModel,
                                usage: capturedUsage || undefined,
                                timestamp: Date.now()
                            };
                        }
                        return { ...m, content: fullResponse, versions, usage: capturedUsage || undefined };
                    });
                } else {
                    finalMessages = [...chat.messages, { ...assistantMessage, content: fullResponse, model: currentModel, usage: capturedUsage || undefined }];
                }

                const finalChat: Chat = {
                    ...chat,
                    messages: finalMessages,
                    updatedAt: Date.now(),
                };
                dispatch({ type: 'UPDATE_CHAT', payload: finalChat });
            },
            onError: (error: string) => {
                setIsStreaming(false);
                setStreamStatus(null);
                const errorText = `Ошибка: ${error}`;

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
            },
        });

        controllerRef.current = controller;
    }, [state.settings.apiKey, state.settings.youApiKey, model, contextMode, contextN, activeSpace, dispatch]);

    // Auto-trigger response for new chats from dashboard
    useEffect(() => {
        if (activeChat && activeChat.messages.length === 1 && activeChat.messages[0].role === 'user' && !isStreaming) {
            runStreaming(activeChat);
        }
    }, [activeChat?.id]);

    const handleSend = useCallback(async (text: string, attachments: Attachment[] = []) => {
        if (!text.trim() && attachments.length === 0) return;

        const textAttachments = attachments.filter(a => a.type === 'text');
        const imageAttachments = attachments.filter(a => a.type === 'image');

        const userMessage: Message = {
            id: uuidv4(),
            role: 'user',
            content: textAttachments.length > 0
                ? `${text}\n\n${textAttachments.map(a => `[Файл: ${a.name}]\n${a.content}`).join('\n\n')}`
                : text,
            displayContent: text,
            attachments: attachments.map(a => ({ name: a.name, size: a.size })),
            fullAttachments: imageAttachments.length > 0 ? attachments : undefined,
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
    }, [activeChat, model, state.activeSpace, dispatch, runStreaming]);

    const handleStop = () => {
        controllerRef.current?.abort();
        setIsStreaming(false);
        setStreamStatus(null);
    };

    const handleRegenerate = useCallback((regenerateModel?: string) => {
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

        // Run streaming for the new version
        runStreaming(updatedChat, lastMsg.id, regenerateModel || model);
    }, [activeChat, model, dispatch, runStreaming]);

    const handleEdit = (text: string) => {
        window.dispatchEvent(new CustomEvent('edit-chat-message', { detail: { text } }));
    };

    const messages = activeChat?.messages || [];
    const isSearch = model === 'you-search' || model === 'you-research';

    return (
        <div className="chat-layout-with-nav">
            <div className="chat-main-area">
                {activeSpace && (
                    <div className="space-banner">
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
                    <div className="messages-container">
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
                />
            </div>

            <div className="dialogue-nav-sidebar">
                <div className="sidebar-section" style={{ padding: '24px' }}>
                    {(() => {
                        const currentModel = MODELS.find(m => m.id === model);
                        return currentModel ? (
                            <div className="model-info-card">
                                <div className="model-info-label">Модель</div>
                                <div className="model-info-name">{currentModel.name}</div>
                                <div className="model-info-desc">{currentModel.desc}</div>
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
