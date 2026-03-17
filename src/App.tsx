import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import SpacesPage from './pages/SpacesPage';
import HistoryPage from './pages/HistoryPage';
import AuthPage from './pages/AuthPage';
import SettingsPage from './pages/SettingsPage';
import { useApp, AppProvider } from './context/AppContext';
import { useAuth, AuthProvider } from './context/AuthContext';
import * as storage from './services/storage';
import AuthModal from './components/AuthModal';
import { AnimatedDiamond } from './components/AnimatedDiamond';
import { BackgroundEffects } from './components/BackgroundEffects';

// --- Global Auth Modal Context ---
interface GlobalAuthModalContextType {
    isAuthModalOpen: boolean;
    showAuthModal: (title?: string) => void;
    closeAuthModal: () => void;
    modalTitle: string;
}

const GlobalAuthModalContext = createContext<GlobalAuthModalContextType | null>(null);

export function useGlobalAuthModal() {
    const context = useContext(GlobalAuthModalContext);
    if (!context) throw new Error('useGlobalAuthModal must be used within GlobalAuthModalProvider');
    return context;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  if (isAuthPage) return (
    <>
      <BackgroundEffects />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {children}
      </div>
    </>
  );

  return (
    <>
      <BackgroundEffects />
      <div className={`app-container ${!state.sidebarOpen ? 'sidebar-collapsed' : ''}`} style={{ position: 'relative', zIndex: 1 }}>
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [appLoading, setAppLoading] = useState(true);
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  const showAuthModal = (title?: string) => {
    setModalTitle(title || "Необходима авторизация");
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        // AppContext handles loading data from storage automatically via its own useEffect
        // We just wait for a small delay to show the splash screen
      } catch (error) {
        console.error('Failed to init app:', error);
      } finally {
        setTimeout(() => setAppLoading(false), 800);
      }
    };

    initApp();
  }, []);

  if (appLoading || isLoading) {
    return (
      <div className="app-loading" style={{ position: 'relative', zIndex: 10 }}>
        <div className="app-loading-content">
          <AnimatedDiamond size={160} animationType="glow" />
          <div className="app-loading-text">Спроси ИИ</div>
        </div>
      </div>
    );
  }

  const authModalValue = {
    isAuthModalOpen,
    showAuthModal,
    closeAuthModal,
    modalTitle
  };

  return (
    <GlobalAuthModalContext.Provider value={authModalValue}>
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
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} title={modalTitle} />}
    </GlobalAuthModalContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
