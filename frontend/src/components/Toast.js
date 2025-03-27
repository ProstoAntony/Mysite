import React, { useEffect } from 'react';
import '../styles/toast.css';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const getToastClassName = () => {
        return `toast-notification ${type}`;
    };

    return (
        <div className={getToastClassName()}>
            <div className="toast-content">
                {type === 'success' && <i className="fas fa-check-circle"></i>}
                {type === 'error' && <i className="fas fa-exclamation-circle"></i>}
                {type === 'info' && <i className="fas fa-info-circle"></i>}
                <span>{message}</span>
            </div>
        </div>
    );
};

export default Toast; 