import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Support from './pages/Support';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import VerifyEmail from './pages/VerifyEmail';
import EditProfile from './pages/EditProfile';
import MemoryList from './pages/MemoryList';
import ProtectedRoute from './components/ProtectedRoute';
import FirebaseActionHandler from './pages/FirebaseActionHandler';
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
        location.pathname.startsWith('/support') || 
        location.pathname.startsWith('/memory-list')
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
                                <Route path="/about" element={<About />} />
                                <Route path="/logout" element={<Navigate to="/" replace />} />
                                <Route path="/action-handler" element={<FirebaseActionHandler />} />
                                
                                {/* Protected routes - user must be logged in AND email verified */}
                                <Route element={<ProtectedRoute />}>
                                    <Route path="/edit-profile" element={<EditProfile />} />
                                    <Route path="/support" element={<Support />} />
                                    <Route path="/memory-list" element={<MemoryList />} />
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
