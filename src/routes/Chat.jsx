import React from 'react';
import ChatWidget from '../components/ChatWidget';
import styles from './Chat.module.css';

const Chat = () => {
    return (
        <div className={styles.chatWrapper}>
            <div className={styles.chatContent}>
                <ChatWidget />
            </div>
        </div>
    );
};

export default Chat;
