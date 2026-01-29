import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaBrain, FaUserFriends } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    
    return (
        <section className={styles.homeContainer}>
            <div className={styles.heroSection}>
                <motion.h1 
                    className={styles.title}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    {t('home.title')}
                </motion.h1>
                
                <motion.p 
                    className={styles.lead}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                >
                    {t('home.lead')}
                </motion.p>
                
                <motion.div 
                    className={styles.ctaButton}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Link to="/chat">{t('home.cta')}</Link>
                </motion.div>
            </div>
            
            <div className={styles.imageSection}>
                <motion.div 
                    className={styles.imageContainer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.9 }}
                >
                    <div className={styles.therapyImage}></div>
                </motion.div>
            </div>
            
            <motion.div 
                className={styles.featuresSection}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.2 }}
            >
                <h2>{t('home.helpTitle')}</h2>
                <div className={styles.featureCards}>
                    <motion.div 
                        className={styles.featureCard}
                        whileHover={{ y: -10, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                    >
                        <FaHeartbeat className={styles.featureIcon} />
                        <h3>{t('home.emotionalTitle')}</h3>
                        <p>{t('home.emotionalDesc')}</p>
                    </motion.div>
                    
                    <motion.div 
                        className={styles.featureCard}
                        whileHover={{ y: -10, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                    >
                        <FaBrain className={styles.featureIcon} />
                        <h3>{t('home.cognitiveTitle')}</h3>
                        <p>{t('home.cognitiveDesc')}</p>
                    </motion.div>
                    
                    <motion.div 
                        className={styles.featureCard}
                        whileHover={{ y: -10, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                    >
                        <FaUserFriends className={styles.featureIcon} />
                        <h3>{t('home.personalTitle')}</h3>
                        <p>{t('home.personalDesc')}</p>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
};

export default Home;
