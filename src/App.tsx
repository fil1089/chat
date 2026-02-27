import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import SpacesPage from './pages/SpacesPage';
import SettingsPage from './pages/SettingsPage';
import SpaceDashboard from './pages/SpaceDashboard';
import ImagesPage from './pages/ImagesPage';
import HistoryPage from './pages/HistoryPage';
import AuthPage from './pages/AuthPage';
import { useApp } from './context/AppContext';
import { IconMenu, IconSettings, IconClose, IconKey, IconLogo } from './components/Icons';

function NoApiKeyModal({ onClose, onGoSettings }: { onClose: () => void; onGoSettings: () => void }) {
    const [provider, setProvider] = useState<'neuro' | 'polza'>('polza'); // Default to Polza since it's the app default

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
                <p className="no-api-modal-desc" style={{ marginBottom: '16px' }}>
                    Для работы с ИИ выберите провайдера и введите ключ в настройках.
                </p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
                    <button
                        className={`auth-tab ${provider === 'polza' ? 'active' : ''}`}
                        onClick={() => setProvider('polza')}
                        style={{ flex: 1 }}
                    >Polza API</button>
                    <button
                        className={`auth-tab ${provider === 'neuro' ? 'active' : ''}`}
                        onClick={() => setProvider('neuro')}
                        style={{ flex: 1 }}
                    >Neuro API</button>
                </div>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <a
                        className="no-api-modal-link"
                        href={provider === 'neuro' ? "https://neuroapi.host/dashboard/tokens" : "https://polza.ai/dashboard/api-keys"}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '15px' }}
                    >
                        {provider === 'neuro' ? "Получить ключ на neuroapi.host →" : "Получить ключ на polza.ai →"}
                    </a>
                </div>
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
            <div className="app-loading">
                <IconLogo size={36} className="app-loading-icon" />
                <span className="app-loading-text">Спроси ИИ</span>
            </div>
        );
    }

    const { showAuthModal } = useGlobalAuthModal();

    return (
        <div className={`app-layout ${state.sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            <Sidebar onLogout={logout} onLogin={() => showAuthModal('Вход в аккаунт')} userEmail={user?.email} />
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
                    <Route path="/images" element={<ImagesPage />} />
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

import AuthModal from './components/AuthModal';

export const GlobalAuthModalContext = React.createContext<{
    showAuthModal: (title?: string) => void;
} | null>(null);

export function useGlobalAuthModal() {
    const ctx = React.useContext(GlobalAuthModalContext);
    if (!ctx) throw new Error('useGlobalAuthModal must be used within App component');
    return ctx;
}

function MainApp() {
    const { user, isLoading } = useAuth();
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const [authModalTitle, setAuthModalTitle] = useState('Необходима авторизация');

    const showAuthModal = (title?: string) => {
        if (title) setAuthModalTitle(title);
        setAuthModalVisible(true);
    };

    if (isLoading) {
        return (
            <div className="app-loading">
                <IconLogo size={36} className="app-loading-icon" />
                <span className="app-loading-text">Спроси ИИ</span>
            </div>
        );
    }

    return (
        <GlobalAuthModalContext.Provider value={{ showAuthModal }}>
            <AppProvider>
                <Layout />
                {(!user && authModalVisible) && (
                    <AuthModal
                        onClose={() => setAuthModalVisible(false)}
                        title={authModalTitle}
                    />
                )}
            </AppProvider>
        </GlobalAuthModalContext.Provider>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <MainApp />
            </AuthProvider>
        </BrowserRouter>
    );
}
