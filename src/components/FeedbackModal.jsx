import React, { useState } from 'react';
import styles from './FeedbackModal.module.css';
import { useTranslation } from 'react-i18next';

const FeedbackModal = ({ isOpen, onClose, onSubmit, aiMessage, userMessage }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();

    const feedbackReasons = [
        { value: 'inappropriate', label: t('feedback.reasons.inappropriate') },
        { value: 'not_enough', label: t('feedback.reasons.notEnough') },
        { value: 'incorrect', label: t('feedback.reasons.incorrect') },
        { value: 'unhelpful', label: t('feedback.reasons.unhelpful') },
        { value: 'too_generic', label: t('feedback.reasons.tooGeneric') },
        { value: 'off_topic', label: t('feedback.reasons.offTopic') },
        { value: 'technical_issue', label: t('feedback.reasons.technical') },
        { value: 'other', label: t('feedback.reasons.other') }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedReason) {
            alert(t('feedback.reasonRequired'));
            return;
        }

        if (!description.trim()) {
            alert(t('feedback.descriptionRequired'));
            return;
        }

        setIsSubmitting(true);
        
        try {
            await onSubmit({
                reason: selectedReason,
                description: description.trim(),
                userMessage,
                aiMessage
            });
            
            // Reset form
            setSelectedReason('');
            setDescription('');
            onClose();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert(t('feedback.submitError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setSelectedReason('');
            setDescription('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{t('feedback.title')}</h3>
                    <button 
                        className={styles.closeButton} 
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        ×
                    </button>
                </div>
                
                <div className={styles.messagePreview}>
                    <div className={styles.userMessagePreview}>
                        <strong>{t('feedback.userMessage')}</strong>
                        <p>"{userMessage?.length > 100 ? userMessage.substring(0, 100) + '...' : userMessage}"</p>
                    </div>
                    <div className={styles.aiMessagePreview}>
                        <strong>{t('feedback.aiMessage')}</strong>
                        <p>"{aiMessage?.length > 100 ? aiMessage.substring(0, 100) + '...' : aiMessage}"</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.feedbackForm}>
                    <div className={styles.reasonSection}>
                        <label className={styles.sectionLabel}>{t('feedback.reasonLabel')}</label>
                        <div className={styles.reasonGrid}>
                            {feedbackReasons.map((reason) => (
                                <label key={reason.value} className={styles.reasonOption}>
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={reason.value}
                                        checked={selectedReason === reason.value}
                                        onChange={(e) => setSelectedReason(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    <span className={styles.reasonLabel}>{reason.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.descriptionSection}>
                        <label htmlFor="description" className={styles.sectionLabel}>
                            {t('feedback.descriptionLabel')}
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('feedback.descriptionPlaceholder')}
                            className={styles.descriptionTextarea}
                            rows={4}
                            disabled={isSubmitting}
                            maxLength={1000}
                        />
                        <div className={styles.characterCount}>
                            {description.length}/1000
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button 
                            type="button" 
                            onClick={handleClose} 
                            className={styles.cancelButton}
                            disabled={isSubmitting}
                        >
                            {t('feedback.cancel')}
                        </button>
                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? t('feedback.submitting') : t('feedback.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal; 