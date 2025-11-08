import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './routes/Home';
import Privacy from './routes/Privacy';
import Chat from './routes/Chat';
import Login from './routes/Login';
import Signup from './routes/Signup';
import ForgotPassword from './routes/ForgotPassword';
import ChangePassword from './routes/ChangePassword';
import VerifyEmail from './routes/VerifyEmail';
import EditProfile from './routes/EditProfile';
import MemoryList from './routes/MemoryList';
import ClearData from './routes/ClearData';
import ProtectedRoute from './components/ProtectedRoute';
import FirebaseActionHandler from './routes/FirebaseActionHandler';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MemoryProvider } from './context/MemoryContext';
import styles from './App.module.css';

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

const App = () => {
    return (
        <AuthProvider>
            <MemoryProvider>
                <NavigationController>
                    <div className={styles.appContainer}>
                        <Header />
                        <main className={styles.mainContent}>
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
                        </main>
                        <Footer />
                    </div>
                </NavigationController>
            </MemoryProvider>
        </AuthProvider>
    );
};

export default App;
