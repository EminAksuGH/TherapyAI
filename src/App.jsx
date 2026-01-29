import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MemoryProvider } from './context/MemoryContext';
import styles from './App.module.css';
import { useTranslation } from 'react-i18next';
import i18n, { getLocaleFromPath } from './i18n';

// Lazy load routes for better code splitting
const Home = lazy(() => import('./routes/Home'));
const Privacy = lazy(() => import('./routes/Privacy'));
const Chat = lazy(() => import('./routes/Chat'));
const Login = lazy(() => import('./routes/Login'));
const Signup = lazy(() => import('./routes/Signup'));
const ForgotPassword = lazy(() => import('./routes/ForgotPassword'));
const ChangePassword = lazy(() => import('./routes/ChangePassword'));
const VerifyEmail = lazy(() => import('./routes/VerifyEmail'));
const EditProfile = lazy(() => import('./routes/EditProfile'));
const MemoryList = lazy(() => import('./routes/MemoryList'));
const ClearData = lazy(() => import('./routes/ClearData'));
const FirebaseActionHandler = lazy(() => import('./routes/FirebaseActionHandler'));

// Loading component for lazy routes
const RouteLoader = () => {
  const { t } = useTranslation();
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '200px' 
    }}>
      {t('common.loading')}
    </div>
  );
};

// Component to handle navigation after auth state changes
const NavigationController = ({ children }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user logs out or account is deleted while on a protected route,
    // redirect to home and clear navigation history
    if (!currentUser && (
        location.pathname.startsWith('/edit-profile') || 
        location.pathname.startsWith('/chat') || 
        location.pathname.startsWith('/memory-list') ||
        location.pathname.startsWith('/clear-data')
    )) {
      navigate('/', { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  return children;
};

// Component to sync i18n language with URL locale
const LocaleSyncer = () => {
    const location = useLocation();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const locale = getLocaleFromPath(window.location.pathname);
        if (i18n.language !== locale) {
            i18n.changeLanguage(locale);
        }
    }, [location.pathname]);

    return null;
};

const App = () => {
    return (
        <AuthProvider>
            <MemoryProvider>
                <NavigationController>
                    <LocaleSyncer />
                    <div className={styles.appContainer}>
                        <Header />
                        <main className={styles.mainContent}>
                            <Suspense fallback={<RouteLoader />}>
                                <Routes>
                                    {/* Public routes */}
                                    <Route path="/" element={<Home />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/signup" element={<Signup />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />
                                    <Route path="/change-password" element={<ChangePassword />} />
                                    <Route path="/verify-email" element={<VerifyEmail />} />
                                    <Route path="/privacy" element={<Privacy />} />
                                    <Route path="/logout" element={<Navigate to="/" replace />} />
                                    <Route path="/action-handler" element={<FirebaseActionHandler />} />
                                    
                                    {/* Protected routes - user must be logged in AND email verified */}
                                    <Route element={<ProtectedRoute />}>
                                        <Route path="/edit-profile" element={<EditProfile />} />
                                        <Route path="/chat" element={<Chat />} />
                                        <Route path="/memory-list" element={<MemoryList />} />
                                        <Route path="/clear-data" element={<ClearData />} />
                                    </Route>
                                </Routes>
                            </Suspense>
                        </main>
                        <Footer />
                    </div>
                </NavigationController>
            </MemoryProvider>
        </AuthProvider>
    );
};

export default App;
