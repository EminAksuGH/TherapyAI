import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerLinks}>
                    <Link to="/privacy" className={styles.footerLink}>
                        {t('footer.privacy')}
                    </Link>
                </div>
                <p className={styles.copyright}>
                    {t('footer.copyright', { year: new Date().getFullYear() })}
                </p>
            </div>
        </footer>
    );
};

export default Footer;
