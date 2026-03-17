import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import SpacesPage from './pages/SpacesPage';
import HistoryPage from './pages/HistoryPage';
import AuthPage from './pages/AuthPage';
import SettingsPage from './pages/SettingsPage';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { storage } from './services/storage';
import AuthModal from './components/AuthModal';
import { useGlobalAuthModal } from './context/AuthContext';
import AnimatedDiamond from './components/AnimatedDiamond';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  if (isAuthPage) return <>{children}</>;

  return (
    <div className={`app-container ${state.settings.sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  const { state, dispatch } = useApp();
  const { user, loading } = useAuth();
  const { isAuthModalOpen, closeAuthModal } = useGlobalAuthModal();
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        const spaces = await storage.getSpaces();
        const settings = await storage.getSettings();
        const chats = await storage.getChats();
        
        dispatch({ type: 'SET_SPACES', payload: spaces });
        dispatch({ type: 'SET_SETTINGS', payload: settings });
        dispatch({ type: 'SET_CHATS', payload: chats });
      } catch (error) {
        console.error('Failed to init app:', error);
      } finally {
        setTimeout(() => setAppLoading(false), 800);
      }
    };

    initApp();
  }, [dispatch]);

  if (appLoading || loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-content">
          <AnimatedDiamond size={160} type="glow" />
          <div className="app-loading-text">Polza</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <ChatView /> : <Navigate to="/auth" />} />
          <Route path="/space/:id" element={user ? <ChatView /> : <Navigate to="/auth" />} />
          <Route path="/spaces" element={user ? <SpacesPage /> : <Navigate to="/auth" />} />
          <Route path="/history" element={user ? <HistoryPage /> : <Navigate to="/auth" />} />
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/auth" />} />
        </Routes>
      </AppLayout>
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />}
    </Router>
  );
}

export default App;
