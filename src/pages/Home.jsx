import React from 'react';
import styles from './Home.module.css';

const Home = () => {
    return (
        <section className={styles.homeContainer}>
            <div className={styles.heroSection}>
                <h1>Welcome to TherapyAI</h1>
                <p className={styles.lead}>
                    Discover a supportive space where advanced AI meets compassionate care.
                </p>
            </div>
        </section>
    );
};

export default Home;
