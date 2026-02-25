import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import SpacesPage from './pages/SpacesPage';
import SettingsPage from './pages/SettingsPage';
import SpaceDashboard from './pages/SpaceDashboard';
import HistoryPage from './pages/HistoryPage';
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
                <h2 className="no-api-modal-title">API ключ не указан</h2>
                <p className="no-api-modal-desc">
                    Для работы с ИИ моделями необходимо указать API ключ.<br />
                    Получите ключ на официальном сайте <strong>NeuroAPI</strong>:
                </p>
                <a
                    className="no-api-modal-link"
                    href="https://neuroapi.host"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    neuroapi.host →
                </a>
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
    const navigate = useNavigate();
    const [modalDismissed, setModalDismissed] = useState(false);

    const showNoApiModal = state.storageReady && !state.settings.apiKey && !modalDismissed;

    const handleGoSettings = () => {
        setModalDismissed(true);
        navigate('/settings');
    };

    return (
        <div className={`app-layout ${state.sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            <Sidebar />
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

export default function App() {
    return (
        <BrowserRouter>
            <AppProvider>
                <Layout />
            </AppProvider>
        </BrowserRouter>
    );
}
