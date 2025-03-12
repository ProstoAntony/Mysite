import React, { useEffect, useState } from 'react';
import useAxios from '../utils/useAxios';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const api = useAxios();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/api/notifications/');
            console.log('Notifications response:', response.data); // Для отладки
            const notificationsData = Array.isArray(response.data) ? response.data : [];
            setNotifications(notificationsData);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/api/notifications/${id}/`, { is_read: true });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/api/notifications/${id}/`);
            setNotifications(prev => prev.filter(notif => notif.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    return (
        <div className="container" style={{ paddingTop: "100px" }}>
            <h2 className="mb-4">Notifications</h2>
            {notifications.length === 0 ? (
                <div className="alert alert-info">No notifications</div>
            ) : (
                <div className="list-group">
                    {notifications.map((notification) => (
                        <div 
                            key={notification.id} 
                            className={`list-group-item list-group-item-action ${!notification.is_read ? 'bg-light' : ''}`}
                        >
                            <div className="d-flex w-100 justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1">{notification.title}</h6>
                                    <p className="mb-1">{notification.message}</p>
                                    <small className="text-muted">
                                        {new Date(notification.created_at).toLocaleDateString()}
                                    </small>
                                </div>
                                <div>
                                    {!notification.is_read && (
                                        <button 
                                            className="btn btn-sm btn-primary me-2"
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                    <button 
                                        className="btn btn-sm btn-danger"
                                        onClick={() => deleteNotification(notification.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;