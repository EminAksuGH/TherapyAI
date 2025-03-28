import React from 'react';
import styles from './About.module.css';

const About = () => {
    return (
        <section className={styles.aboutContainer}>
            <div className={styles.aboutContent}>
                <h1>About Our Service</h1>
                <p className={styles.aboutText}>
                    Our service utilizes GPT AI to offer psychological support and guidance, helping you navigate difficult emotions and challenges.
                </p>
            </div>
        </section>
    );
};

export default About;
