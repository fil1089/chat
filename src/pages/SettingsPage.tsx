import { useState } from 'react';
import { API_URLS } from '../services/apiConfig';
import { useApp } from '../context/AppContext';
import { getChatModelsByCategory } from '../services/youApi';
import { IconSettings, IconDownload, IconPlus, IconTrash, IconMessage, IconFolder, IconEye, IconEyeOff, IconCheck, IconError } from '../components/Icons';
import ModelSelector from '../components/ModelSelector';
import { exportAllData, importAllData, clearAllData } from '../services/storage';
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
        dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } as Record<string, string> });
    };

    const handleTestKey = async () => {
        if (!state.settings.apiKey) return;
        setTesting(true);
        setTestResult(null);

        try {
            const isPolza = state.settings.apiProvider === 'polza';
            const apiUrl = isPolza ? API_URLS.polza : API_URLS.neuro;
            const apiKeyToTest = isPolza ? state.settings.polzaApiKey : state.settings.apiKey;

            if (!apiKeyToTest) {
                setTestResult({ ok: false, msg: 'Введите ключ' });
                setTesting(false);
                return;
            }

            const response = await fetch(`${apiUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKeyToTest}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: isPolza ? 'openai/gpt-4o-mini' : 'gpt-4.1-nano',
                    messages: [{ role: 'user', content: 'Hi' }],
                    max_tokens: 5,
                }),
            });

            if (response.ok) {
                setTestResult({ ok: true, msg: 'Ключ работает!' });
            } else {
                const text = await response.text();
                setTestResult({ ok: false, msg: `Ошибка ${response.status}: ${text.slice(0, 100)}` });
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

    const groups = getChatModelsByCategory();

    return (
        <div className="page settings-page">
            <div className="page-header">
                <IconSettings size={28} className="page-header-icon" />
                <h1>Настройки</h1>
            </div>

            <div className="settings-section">
                <h2>API Конфигурация</h2>

                <div className="setting-row">
                    <label>Провайдер API</label>
                    <div className="settings-model-wrapper">
                        <select
                            className="setting-select"
                            value={state.settings.apiProvider || 'neuro'}
                            onChange={(e) => handleSave('apiProvider', e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontSize: '14px', width: '100%', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="neuro">Neuro API</option>
                            <option value="polza">Polza API</option>
                        </select>
                    </div>
                </div>

                <div className="setting-row">
                    <label>API Ключ ({state.settings.apiProvider === 'polza' ? 'Polza API' : 'Neuro API'})</label>
                    <div className="api-key-input">
                        {state.settings.apiProvider === 'polza' ? (
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={state.settings.polzaApiKey || ''}
                                onChange={(e) => handleSave('polzaApiKey', e.target.value)}
                                placeholder="Ваш API ключ Polza.ai"
                            />
                        ) : (
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={state.settings.apiKey || ''}
                                onChange={(e) => handleSave('apiKey', e.target.value)}
                                placeholder="Ваш API ключ Neuro API"
                            />
                        )}
                        <button className="btn-ghost" onClick={() => setShowKey(!showKey)} title={showKey ? 'Скрыть' : 'Показать'}>
                            {showKey ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={handleTestKey}
                            disabled={testing || (state.settings.apiProvider === 'polza' ? !state.settings.polzaApiKey : !state.settings.apiKey)}
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
                        {state.settings.apiProvider === 'polza' ? (
                            <>Получите ключ на <a href="https://polza.ai/dashboard/api-keys" target="_blank" rel="noopener noreferrer">polza.ai</a></>
                        ) : (
                            <>Получите ключ на <a href="https://neuroapi.host/dashboard/tokens" target="_blank" rel="noopener noreferrer">neuroapi.host</a></>
                        )}
                    </p>
                </div>


            </div>

            <div className="settings-section">
                <h2>Параметры по умолчанию</h2>
                <div className="setting-row">
                    <label>Модель по умолчанию</label>
                    <div className="settings-model-wrapper">
                        <ModelSelector
                            model={state.settings.defaultModel || 'gpt-4o'}
                            onModelChange={(val) => handleSave('defaultModel', val)}
                            direction="down"
                        />
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <h2>Данные</h2>
                <div className="setting-row">
                    <div className="data-stats">
                        <span><IconMessage size={16} /> {state.chats.length} чатов</span>
                        <span><IconFolder size={16} /> {state.spaces.length} пространств</span>
                    </div>
                </div>
                <div className="data-actions">
                    <button className="btn-secondary" onClick={handleExport}>
                        Экспорт данных
                    </button>
                    <label className="btn-secondary file-label">
                        Импорт данных
                        <input type="file" accept=".json" onChange={handleImport} hidden />
                    </label>
                    <button className="btn-danger" onClick={handleClear}>
                        Очистить все данные
                    </button>
                </div>
            </div>
        </div>
    );
}
