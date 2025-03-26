import styles from './Header.module.css';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.logo}>TherapyAI</div>
            <nav className={styles.nav}>
                <Link to="/">Ana Sayfa</Link>
                <Link to="/about">Hakkında</Link>
                <Link to="/support">Destek</Link>
            </nav>
        </header>
    );
};

export default Header;
