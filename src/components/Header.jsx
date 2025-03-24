import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css'; 

const Header = () => {
    return (
        <header className={styles.header}>
            <img src="./assets/logo.png" alt="Logo" className={styles.logo} />
            <nav>
                <ul className={styles.navList}>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/support">Support</Link></li>
                    <li><Link to="/about">About</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
