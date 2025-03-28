import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { FaSun, FaMoon } from 'react-icons/fa';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navRef = useRef(null);
    const hamburgerRef = useRef(null);
    const { theme, toggleTheme } = useContext(ThemeContext);

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
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

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

    return (
        <header className={styles.header}>
            <div className={styles.logo}>TherapyAI</div>

            <nav 
                ref={navRef}
                className={`${styles.nav} ${menuOpen ? styles.open : ''}`}
            >
                <Link to="/" onClick={() => setMenuOpen(false)}>Ana Sayfa</Link>
                <Link to="/about" onClick={() => setMenuOpen(false)}>Hakkında</Link>
                <Link to="/support" onClick={() => setMenuOpen(false)}>Destek</Link>
            </nav>

            <div className={styles.actions}>
                <button onClick={toggleTheme} className={styles.themeToggle}>
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                </button>
                <div
                    ref={hamburgerRef}
                    className={styles.hamburger}
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
