import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import SpacesPage from './pages/SpacesPage';
import SettingsPage from './pages/SettingsPage';
import SpaceDashboard from './pages/SpaceDashboard';
import HistoryPage from './pages/HistoryPage';
import { useApp } from './context/AppContext';
import { IconMenu } from './components/Icons';

function Layout() {
    const { state, dispatch } = useApp();

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
