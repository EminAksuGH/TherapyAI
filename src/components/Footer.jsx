import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p>© {new Date().getFullYear()} TherapyAI. Tüm hakları saklıdır.</p>
        </footer>
    );
};

export default Footer;
