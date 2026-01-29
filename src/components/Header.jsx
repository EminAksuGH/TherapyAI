import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext';
import { FaSun, FaMoon, FaUser, FaEdit, FaSignOutAlt, FaHome, FaHeadset, FaBrain, FaHeart, FaTrash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { getLocaleFromPath, buildLocaleUrl } from '../i18n';

// Function to check if a path is protected
const isProtectedPath = (path) => {
  return ['/chat', '/edit-profile', '/memory-list', '/clear-data'].includes(path);
};

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [currentLocale, setCurrentLocale] = useState('en');
    const [switchHref, setSwitchHref] = useState('');
    const { t } = useTranslation();
    const navRef = useRef(null);
    const hamburgerRef = useRef(null);
    const dropdownRef = useRef(null);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { currentUser, logout, reloadUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Reset dropdown when currentUser changes
    useEffect(() => {
        setDropdownOpen(false);
    }, [currentUser]);

    // Handler for navigation to protected routes
    const handleProtectedNavigation = async (e, path) => {
      if (currentUser && isProtectedPath(path)) {
        e.preventDefault();
        
        try {
          // Reload auth state before navigation
          await reloadUser();
          
          // After reload, check if email is verified
          if (!currentUser.emailVerified) {
            navigate('/login?requireVerification=true');
          } else {
            navigate(path);
          }
        } catch (error) {
          console.error("Error refreshing auth state:", error);
          navigate(path); // Navigate anyway
        }
      }
    };

    const handleClickOutside = (event) => {
        if (
            navRef.current && 
            !navRef.current.contains(event.target) &&
            hamburgerRef.current &&
            !hamburgerRef.current.contains(event.target) &&
            menuOpen
        ) {
            setMenuOpen(false);
        }
        
        // Close dropdown when clicking outside
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target) &&
            dropdownOpen
        ) {
            setDropdownOpen(false);
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        setDropdownOpen(false);
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    const handleEditProfile = () => {
        setDropdownOpen(false);
        navigate('/edit-profile');
    };

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setDropdownOpen(!dropdownOpen);
    };

    useEffect(() => {
        if (typeof document === 'undefined') return;
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            if (typeof document !== 'undefined') {
                document.removeEventListener('mousedown', handleClickOutside);
            }
        };
    }, [menuOpen, dropdownOpen]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768 && menuOpen) {
                setMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [menuOpen]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const locale = getLocaleFromPath(window.location.pathname);
        const targetLocale = locale === 'tr' ? 'en' : 'tr';
        setCurrentLocale(locale);
        setSwitchHref(buildLocaleUrl(
            window.location.pathname,
            window.location.search,
            window.location.hash,
            targetLocale
        ));
    }, [location.pathname, location.search, location.hash]);

    return (
        <header className={styles.header}>
            <div className={styles.logo} onClick={() => navigate('/')} style={{cursor: 'pointer'}}>TherapyAI</div>

            <nav 
                ref={navRef}
                className={`${styles.nav} ${menuOpen ? styles.open : ''}`}
            >
                <Link to="/" 
                    onClick={() => setMenuOpen(false)} 
                    style={{"--item-index": 0}}
                >
                    <FaHome className={styles.menuIcon} /> {t('nav.home')}
                </Link>
                <Link 
                    to="/chat" 
                    onClick={(e) => {
                        setMenuOpen(false);
                        handleProtectedNavigation(e, '/chat');
                    }}
                    style={{"--item-index": 1}}
                >
                    <FaHeart className={styles.menuIcon} /> {t('nav.support')}
                </Link>
                
                {/* Giriş Yap/Profil link in hamburger menu */}
                {currentUser ? (
                    <>
                        <Link to="/memory-list" 
                            onClick={(e) => {
                                setMenuOpen(false);
                                handleProtectedNavigation(e, '/memory-list');
                            }} 
                            style={{"--item-index": 2}}
                            className={styles.mobileOnly}
                        >
                            <FaBrain className={styles.menuIcon} /> {t('nav.memoryList')}
                        </Link>
                        <Link to="/edit-profile" 
                            onClick={(e) => {
                                setMenuOpen(false);
                                handleProtectedNavigation(e, '/edit-profile');
                            }} 
                            style={{"--item-index": 3}}
                            className={styles.mobileOnly}
                        >
                            <FaEdit className={styles.menuIcon} /> {t('nav.editProfile')}
                        </Link>
                        <Link to="/clear-data" 
                            onClick={(e) => {
                                setMenuOpen(false);
                                handleProtectedNavigation(e, '/clear-data');
                            }} 
                            style={{"--item-index": 4}}
                            className={styles.mobileOnly}
                        >
                            <FaTrash className={styles.menuIcon} /> {t('nav.clearData')}
                        </Link>
                        <Link to="/" 
                            onClick={(e) => {
                                e.preventDefault();
                                setMenuOpen(false);
                                handleLogout(e);
                            }} 
                            style={{"--item-index": 5}}
                            className={`${styles.mobileOnly} ${styles.logoutLink}`}
                        >
                            <FaSignOutAlt className={styles.menuIcon} /> {t('nav.logout')}
                        </Link>
                    </>
                ) : (
                    <Link to="/login" 
                        onClick={() => setMenuOpen(false)} 
                        style={{"--item-index": 2}}
                        className={styles.mobileOnly}
                    >
                        <FaUser className={styles.menuIcon} /> {t('nav.login')}
                    </Link>
                )}
            </nav>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.languageToggle}
                    onClick={() => {
                        if (switchHref) {
                            const nextLocale = currentLocale === 'tr' ? 'en' : 'tr';
                            document.cookie = `locale=${nextLocale}; path=/; max-age=31536000`;
                            // Use replace to avoid creating history entry
                            window.location.replace(switchHref);
                        }
                    }}
                    title={currentLocale === 'tr' ? t('language.switchToEnglish') : t('language.switchToTurkish')}
                    aria-label={currentLocale === 'tr' ? t('language.switchToEnglish') : t('language.switchToTurkish')}
                >
                    {currentLocale === 'tr' ? 'EN' : 'TR'}
                </button>
                <button onClick={toggleTheme} className={styles.themeToggle}>
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                </button>
                
                {currentUser ? (
                    <div className={styles.profileContainer} ref={dropdownRef}>
                        <div 
                            className={`${styles.profileLink} ${dropdownOpen ? styles.active : ''}`} 
                            onClick={toggleDropdown}
                        >
                            <FaUser />
                        </div>
                        {dropdownOpen && (
                            <div className={styles.profileDropdown}>
                                <div 
                                    className={styles.dropdownItem}
                                    onClick={(e) => {
                                        setDropdownOpen(false);
                                        handleProtectedNavigation(e, '/memory-list');
                                    }}
                                >
                                    <FaBrain /> {t('nav.memoryList')}
                                </div>
                                <div 
                                    className={styles.dropdownItem}
                                    onClick={(e) => {
                                        handleEditProfile();
                                        handleProtectedNavigation(e, '/edit-profile');
                                    }}
                                >
                                    <FaEdit /> {t('nav.editProfile')}
                                </div>
                                <div 
                                    className={styles.dropdownItemDanger}
                                    onClick={(e) => {
                                        setDropdownOpen(false);
                                        handleProtectedNavigation(e, '/clear-data');
                                    }}
                                >
                                    <FaTrash /> {t('nav.clearData')}
                                </div>
                                <div className={styles.dropdownDivider}></div>
                                <div 
                                    className={styles.dropdownItem}
                                    onClick={handleLogout}
                                >
                                    <FaSignOutAlt /> {t('nav.logout')}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.authLinks}>
                        <Link to="/login" className={styles.loginLink}>
                            {t('nav.loginLower')}
                        </Link>
                    </div>
                )}

                <div
                    ref={hamburgerRef}
                    className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </header>
    );
};

export default Header;
