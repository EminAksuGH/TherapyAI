import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className={styles.header}>
            <div className={styles.logo}>TherapyAI</div>

            <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
                <Link to="/" onClick={() => setMenuOpen(false)}>Ana Sayfa</Link>
                <Link to="/about" onClick={() => setMenuOpen(false)}>Hakkında</Link>
                <Link to="/support" onClick={() => setMenuOpen(false)}>Destek</Link>
            </nav>

            <div
                className={styles.hamburger}
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <span></span>
                <span></span>
                <span></span>
            </div>
        </header>
    );
};

export default Header;
