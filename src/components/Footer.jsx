import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerLinks}>
                    <Link to="/privacy" className={styles.footerLink}>
                        Gizlilik Politikası
                    </Link>
                </div>
                <p className={styles.copyright}>
                    © {new Date().getFullYear()} TherapyAI. Tüm hakları saklıdır.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
