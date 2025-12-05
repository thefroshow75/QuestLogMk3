import React, { useState, useEffect } from 'react';

interface NotificationProps {
    message: string;
    onDismiss: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => {
                handleDismiss();
            }, 3800);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleDismiss = () => {
        setVisible(false);
        setTimeout(onDismiss, 200); // Wait for fade out transition
    };

    return (
        <div 
            className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-200 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
            style={{
                backgroundColor: 'rgba(var(--color-accent-primary-rgb), 0.9)',
                color: 'rgba(var(--color-background-primary-rgb), 1)',
                border: '1px solid rgba(var(--color-background-primary-rgb), 0.5)'
            }}
        >
            <div className="flex items-center justify-between">
                <p className="font-bold">{message}</p>
                <button onClick={handleDismiss} className="ml-4 font-bold text-lg">&times;</button>
            </div>
        </div>
    );
};

export default Notification;
