import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { IconMenu, IconLogo } from './components/Icons';

function Layout() {
    const { state, dispatch } = useApp();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    if (!state.storageReady) {
        return (
            <div className="app-loading">
                <IconLogo size={36} className="app-loading-icon" />
                <span className="app-loading-text">Спроси ИИ</span>
            </div>
        );
    }

    const { showAuthModal } = useGlobalAuthModal();
    const location = useLocation();

    // Determine the title for the mobile header based on the current route
    let mobileHeaderTitle = '';
    if (location.pathname === '/settings') mobileHeaderTitle = 'Настройки';
    else if (location.pathname === '/history') mobileHeaderTitle = 'История';
    else if (location.pathname === '/spaces') mobileHeaderTitle = 'Пространства';
    else if (location.pathname === '/images') mobileHeaderTitle = 'Изображения';
    else if (location.pathname.startsWith('/space/')) mobileHeaderTitle = 'Пространство';

    const showMobileHeader = location.pathname !== '/';

    return (
        <div className={`app-layout ${state.sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            <div
                className="sidebar-overlay"
                onClick={() => state.sidebarOpen && dispatch({ type: 'TOGGLE_SIDEBAR' })}
            />
            <Sidebar onLogout={logout} onLogin={() => showAuthModal('Вход в аккаунт')} userEmail={user?.email} />
            <main className="main-content">
                {showMobileHeader && (
                    <div className="mobile-chat-header">
                        <button className="mobile-menu-btn-header" onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}>
                            <IconMenu size={20} />
                        </button>
                        <div className="mobile-space-title" style={{ fontWeight: 500, flex: 1, textAlign: 'center' }}>
                            {mobileHeaderTitle}
                        </div>
                        <div style={{ width: '36px' }}></div> {/* Spacer for centering */}
                    </div>
                )}
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
        <Router>
            <AuthProvider>
                <MainApp />
            </AuthProvider>
        </Router>
    );
}
