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
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import styles from './App.module.css';

const App = () => {
    return (
        <AuthProvider>
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
                        <Route path="/about" element={<About />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/logout" element={<Navigate to="/" replace />} />
                        
                        {/* Protected routes - user must be logged in */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/edit-profile" element={<EditProfile />} />
                        </Route>
                    </Routes>
                </main>
                <Footer />
            </div>
        </AuthProvider>
    );
};

export default App;
