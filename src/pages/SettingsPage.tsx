import { useState, useEffect } from 'react';
import { API_URLS } from '../services/apiConfig';
import { useApp } from '../context/AppContext';
import { getChatModelsByCategory } from '../services/youApi';
import { IconSettings, IconDownload, IconPlus, IconTrash, IconMessage, IconFolder, IconEye, IconEyeOff, IconCheck, IconError, IconFileText, IconImage, IconAttachment, IconAudio, IconVideo } from '../components/Icons';
import ModelSelector from '../components/ModelSelector';
import { exportAllData, importAllData, clearAllData } from '../services/storage';
import { MODELS } from '../services/youApi';
import { ALL_POLZA_MODELS } from '../services/polzaApi';
import type { ChangeEvent } from 'react';

interface TestResult {
    ok: boolean;
    msg: string;
}

export default function SettingsPage() {
    const { state, dispatch } = useApp();
    const [showKey, setShowKey] = useState(false);
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [testing, setTesting] = useState(false);

    const handleSave = (key: string, value: string) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } as any });
    };

    const handleTestKey = async () => {
        const apiKeyToTest = state.settings.polzaApiKey;
        if (!apiKeyToTest) return;
        setTesting(true);
        setTestResult(null);

        try {
            const apiUrl = API_URLS.polza;
            const response = await fetch(`${apiUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKeyToTest}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'openai/gpt-4o-mini',
                    messages: [{ role: 'user', content: 'Hi' }],
                    max_tokens: 5,
                }),
            });

            if (response.ok) {
                setTestResult({ ok: true, msg: 'Ключ работает!' });
            } else {
                const text = await response.text();
                let errMsg = `Ошибка ${response.status}: ${text.slice(0, 100)}`;

                try {
                    const errorJson = JSON.parse(text);
                    const detail = errorJson.error?.message || errorJson.message || errorJson.detail;
                    if (detail === 'INSUFFICIENT_BALANCE') {
                        errMsg = 'Недостаточно средств на балансе. Пожалуйста, пополните счет на polza.ai.';
                    } else if (detail === 'UNAUTHORIZED' || response.status === 401) {
                        errMsg = 'Неверный API ключ.';
                    } else if (detail) {
                        errMsg = `Ошибка Polza API: ${detail}`;
                    }
                } catch { }

                setTestResult({ ok: false, msg: errMsg });
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setTestResult({ ok: false, msg: msg });
        }
        setTesting(false);
    };

    const handleExport = async () => {
        const data = await exportAllData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aggregator-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                await importAllData(ev.target?.result as string);
                const storage = await import('../services/storage');
                const [chats, spaces, settings] = await Promise.all([
                    storage.getChats(),
                    storage.getSpaces(),
                    storage.getSettings(),
                ]);
                dispatch({ type: 'LOAD_DATA', payload: { chats, spaces, settings } });
                alert('Данные успешно импортированы!');
            } catch {
                alert('Ошибка импорта данных');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleClear = async () => {
        if (confirm('Вы уверены? Все чаты, пространства и настройки будут удалены.')) {
            await clearAllData();
            const storage = await import('../services/storage');
            const [chats, spaces, settings] = await Promise.all([
                storage.getChats(),
                storage.getSpaces(),
                storage.getSettings(),
            ]);
            dispatch({ type: 'LOAD_DATA', payload: { chats, spaces, settings } });
        }
    };

    return (
        <div className="chat-layout-with-nav">
            <div className="chat-main-area">
                <div className="settings-main">
                    <div className="page-header">
                        <IconSettings size={28} className="page-header-icon" />
                        <h1>Настройки</h1>
                    </div>

                    <div className="settings-section">
                        <h2>API Конфигурация</h2>
                        <div className="setting-row">
                            <label>API Ключ (Polza API)</label>
                            <div className="api-key-input">
                                <input
                                    type={showKey ? 'text' : 'password'}
                                    value={state.settings.polzaApiKey || ''}
                                    onChange={(e) => handleSave('polzaApiKey', e.target.value)}
                                    placeholder="Ваш API ключ Polza.ai"
                                    autoComplete="off"
                                />
                                <button className="btn-ghost" onClick={() => setShowKey(!showKey)}>
                                    {showKey ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={handleTestKey}
                                    disabled={testing || !state.settings.polzaApiKey}
                                >
                                    {testing ? '...' : 'Проверить'}
                                </button>
                            </div>
                            {testResult && (
                                <div className={`test-result ${testResult.ok ? 'success' : 'error'}`}>
                                    <span>{testResult.msg}</span>
                                </div>
                            )}
                            <p className="setting-hint">
                                Получите ключ на <a href="https://polza.ai/dashboard/api-keys" target="_blank" rel="noopener noreferrer">polza.ai</a>
                            </p>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h2>Локальные данные</h2>
                        <div className="setting-row">
                            <div className="data-stats" style={{ display: 'flex', gap: '16px', marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                <span><IconMessage size={16} /> {state.chats.length} чатов</span>
                                <span><IconFolder size={16} /> {state.spaces.length} пространств</span>
                            </div>
                            <div className="data-actions">
                                <button className="btn-secondary" onClick={handleExport}>Экспорт всех данных (.json)</button>
                                <label className="file-label btn-secondary">
                                    Импорт данных (.json)
                                    <input type="file" accept=".json" onChange={handleImport} hidden />
                                </label>
                                <button className="btn-danger" onClick={handleClear}>Очистить всё</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dialogue-nav-sidebar">
                <div className="sidebar-section" style={{ padding: '24px' }}>
                    <h2 style={{ marginBottom: '16px' }}>Модель по умолчанию</h2>

                    {(() => {
                        const defaultModelId = state.settings.defaultModel || 'gpt-4o';
                        const allModels = [...MODELS, ...ALL_POLZA_MODELS];
                        const currentModel = allModels.find(m => m.id === defaultModelId);

                        return currentModel ? (
                            <div className="model-info-card">
                                <div className="model-info-label">Текущая модель</div>
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

                    <div className="settings-model-wrapper" style={{ marginTop: '16px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                            Сменить модель
                        </div>
                        <ModelSelector
                            model={state.settings.defaultModel || 'openai/gpt-4o'}
                            onModelChange={(val) => handleSave('defaultModel', val)}
                            direction="down"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
