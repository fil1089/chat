import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { streamResponse } from '../services/youApi';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import ThreadNav from './ThreadNav';
import { IconSparkles } from './Icons';
import { v4 as uuidv4 } from 'uuid';
import type { Message, Chat, Attachment, StatusEvent, Space } from '../types';

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
    const [model, setModel] = useState(state.settings.defaultModel || 'gpt-4o');

    const activeChat = state.chats.find((c) => c.id === state.activeChat);
    const activeSpace = state.spaces.find((s) => s.id === state.activeSpace) as Space | undefined;

    useEffect(() => {
        if (activeChat?.model) {
            setModel(activeChat.model);
        }
    }, [activeChat?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChat?.messages]);

    const handleSend = useCallback(async (text: string, attachments: Attachment[] = []) => {
        if (!text.trim() && attachments.length === 0) return;

        const userMessage: Message = {
            id: uuidv4(),
            role: 'user',
            content: attachments.length > 0 ? `${text}\n\n${attachments.map(a => `[Файл: ${a.name}]\n${a.content}`).join('\n\n')}` : text,
            displayContent: text,
            attachments: attachments.map(a => ({ name: a.name, size: a.size })),
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

        setIsStreaming(true);
        setStreamStatus(null);
        let fullResponse = '';

        const assistantMessage: Message = {
            id: uuidv4(),
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
        };

        const controller = streamResponse({
            apiKey: state.settings.apiKey,
            youApiKey: state.settings.youApiKey,
            model,
            messages: chat.messages,
            systemInstructions: activeSpace?.instructions || '',
            fileContents: activeSpace?.files || [],
            onDelta: (delta: string) => {
                fullResponse += delta;
                const updatedChat: Chat = {
                    ...chat,
                    messages: [...chat.messages, { ...assistantMessage, content: fullResponse }],
                    updatedAt: Date.now(),
                };
                dispatch({ type: 'UPDATE_CHAT', payload: updatedChat });
            },
            onStatus: (status: StatusEvent) => {
                setStreamStatus(status);
            },
            onDone: () => {
                setIsStreaming(false);
                setStreamStatus(null);
                const finalChat: Chat = {
                    ...chat,
                    messages: [...chat.messages, { ...assistantMessage, content: fullResponse }],
                    updatedAt: Date.now(),
                };
                dispatch({ type: 'UPDATE_CHAT', payload: finalChat });
            },
            onError: (error: string) => {
                setIsStreaming(false);
                setStreamStatus(null);
                const errorChat: Chat = {
                    ...chat,
                    messages: [
                        ...chat.messages,
                        { ...assistantMessage, content: `❌ Ошибка: ${error}` },
                    ],
                    updatedAt: Date.now(),
                };
                dispatch({ type: 'UPDATE_CHAT', payload: errorChat });
            },
        });

        controllerRef.current = controller;
    }, [activeChat, model, state, dispatch, activeSpace]);

    const handleStop = () => {
        controllerRef.current?.abort();
        setIsStreaming(false);
        setStreamStatus(null);
    };

    const handleRegenerate = useCallback(() => {
        if (!activeChat || activeChat.messages.length < 2) return;
        const messages = activeChat.messages.slice(0, -1);
        const lastUserMsg = messages.filter(m => m.role === 'user').pop();
        if (!lastUserMsg) return;

        const updatedChat: Chat = { ...activeChat, messages, updatedAt: Date.now() };
        dispatch({ type: 'UPDATE_CHAT', payload: updatedChat });
        handleSend(lastUserMsg.content);
    }, [activeChat, dispatch, handleSend]);

    const handleEdit = (text: string) => {
        window.dispatchEvent(new CustomEvent('edit-chat-message', { detail: { text } }));
    };

    const messages = activeChat?.messages || [];
    const isSearch = model === 'you-search' || model === 'you-research';

    return (
        <div className="chat-layout">
            <div className="chat-view">
                {activeSpace && (
                    <div className="space-banner">
                        <span className="space-banner-icon">📁</span>
                        {activeSpace.name}
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <div className="chat-empty-content">
                            <div className="chat-empty-icon">
                                <IconSparkles size={48} />
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
                    hideModelSelector={!!activeSpace || isSearch}
                />
            </div>
            {messages.length > 2 && (
                <ThreadNav messages={messages} currentIndex={messages.length - 1} onNavigate={() => { }} />
            )}
        </div>
    );
}
