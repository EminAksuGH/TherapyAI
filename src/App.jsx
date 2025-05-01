import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ProtectedRoute from './components/ProtectedRoute';
import FirebaseActionHandler from './pages/FirebaseActionHandler';
import { AuthProvider } from './context/AuthContext';
import { MemoryProvider } from './context/MemoryContext';
import styles from './App.module.css';

const App = () => {
    return (
        <AuthProvider>
            <MemoryProvider>
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
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/edit-profile" element={<EditProfile />} />
                                <Route path="/support" element={<Support />} />
                            </Route>
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </MemoryProvider>
        </AuthProvider>
    );
};

export default App;
