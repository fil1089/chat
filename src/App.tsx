import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import SpacesPage from './pages/SpacesPage';
import SettingsPage from './pages/SettingsPage';
import SpaceDashboard from './pages/SpaceDashboard';
import HistoryPage from './pages/HistoryPage';
import AuthPage from './pages/AuthPage';
import { useApp } from './context/AppContext';
import { IconMenu, IconSettings, IconClose, IconKey } from './components/Icons';

function NoApiKeyModal({ onClose, onGoSettings }: { onClose: () => void; onGoSettings: () => void }) {
    return (
        <div className="no-api-modal-overlay" onClick={onClose}>
            <div className="no-api-modal" onClick={(e) => e.stopPropagation()}>
                <button className="no-api-modal-close" onClick={onClose}>
                    <IconClose size={18} />
                </button>
                <div className="no-api-modal-icon">
                    <IconKey size={48} />
                </div>
                <h2 className="no-api-modal-title">Нужен API ключ</h2>
                <p className="no-api-modal-desc">
                    Для работы с ИИ нужен ключ <strong>NeuroAPI</strong>. Получить бесплатно:
                </p>
                <a
                    className="no-api-modal-link"
                    href="https://neuroapi.host"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    neuroapi.host →
                </a>
                <ol className="no-api-modal-steps">
                    <li>Войдите или зарегистрируйтесь <em>(через Google, после авторизации)</em></li>
                    <li>Если 404 — нажмите «На главную»</li>
                    <li>Откройте <strong>Панель → API Ключи</strong></li>
                    <li>Пополните баланс — нажмите в правом верхнем углу на <strong>окошко с суммой</strong></li>
                    <li>Нажмите <strong>Создать новый ключ</strong>, введите любое название</li>
                    <li>Скопируйте ключ и вставьте в Настройках</li>
                </ol>
                <div className="no-api-modal-actions">
                    <button className="btn-secondary" onClick={onClose}>Позже</button>
                    <button className="btn-primary" onClick={onGoSettings}>
                        <IconSettings size={16} />
                        Открыть настройки
                    </button>
                </div>
            </div>
        </div>
    );
}

function Layout() {
    const { state, dispatch } = useApp();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [modalDismissed, setModalDismissed] = useState(false);

    const showNoApiModal = state.storageReady && !state.settings.apiKey && !modalDismissed;

    const handleGoSettings = () => {
        setModalDismissed(true);
        navigate('/settings');
    };

    if (!state.storageReady) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Загрузка данных...</div>
            </div>
        );
    }

    return (
        <div className={`app-layout ${state.sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            <Sidebar onLogout={logout} userEmail={user?.email} />
            <main className="main-content">
                <button
                    className="mobile-menu-btn"
                    onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                >
                    <IconMenu size={24} />
                </button>
                <Routes>
                    <Route path="/" element={<ChatView />} />
                    <Route path="/space/:id" element={<SpaceDashboard />} />
                    <Route path="/spaces" element={<SpacesPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            {showNoApiModal && (
                <NoApiKeyModal
                    onClose={() => setModalDismissed(true)}
                    onGoSettings={handleGoSettings}
                />
            )}
        </div>
    );
}

function AuthGuard() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Загрузка...</div>
            </div>
        );
    }

    if (!user) {
        return <AuthPage />;
    }

    return (
        <AppProvider>
            <Layout />
        </AppProvider>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="*" element={<AuthGuard />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
