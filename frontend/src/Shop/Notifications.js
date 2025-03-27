import React, { useEffect, useState } from 'react';
import useAxios from '../utils/useAxios';
import '../styles/support-page.css';
import Toast from '../components/Toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [gameNews, setGameNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const api = useAxios();

    const RAWG_API_KEY = '09e6c4962260484eb5b2308c5afb1c83'; // Обновляем ключ API

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    useEffect(() => {
        fetchNotifications();
        fetchGameNews();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/notifications/');
            const notificationsData = Array.isArray(response.data) ? response.data : [];
            setNotifications(notificationsData);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
            showToast('Failed to load notifications', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchGameNews = async () => {
        try {
            const currentDate = new Date();
            const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1))
                .toISOString().split('T')[0];
            
            const response = await fetch(
                `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&dates=${lastMonth},${new Date().toISOString().split('T')[0]}&ordering=-released&page_size=5`
            );
            
            if (!response.ok) throw new Error('Failed to fetch game news');
            
            const data = await response.json();
            setGameNews(data.results);
        } catch (error) {
            console.error('Error fetching game news:', error);
            showToast('Failed to load game news', 'error');
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/api/notifications/${id}/`, { is_read: true });
            fetchNotifications();
            showToast('Notification marked as read', 'success');
        } catch (error) {
            console.error('Error marking notification as read:', error);
            showToast('Failed to mark notification as read', 'error');
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/api/notifications/${id}/`);
            setNotifications(prev => prev.filter(notif => notif.id !== id));
            showToast('Notification deleted', 'info');
        } catch (error) {
            console.error('Error deleting notification:', error);
            showToast('Failed to delete notification', 'error');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/api/notifications/mark-all-read/');
            fetchNotifications();
            showToast('All notifications marked as read', 'success');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            showToast('Failed to mark all notifications as read', 'error');
        }
    };

    const deleteAllNotifications = async () => {
        try {
            await api.delete('/api/notifications/delete-all/');
            setNotifications([]);
            showToast('All notifications deleted', 'info');
        } catch (error) {
            console.error('Error deleting all notifications:', error);
            showToast('Failed to delete all notifications', 'error');
        }
    };

    if (loading) {
        return (
            <div className="gaming-form d-flex justify-content-center align-items-center" style={{ 
                backgroundImage: 'url("/images/Background 12.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '100vh'
            }}>
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="gaming-form" style={{ 
            backgroundImage: 'url("/images/Background 12.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            padding: '40px 20px'
        }}>
            <div className="container-fluid py-5">
                <div className="row">
                    <div className="col-lg-8">
                        <div className="gaming-form__container" style={{ 
                            padding: '2.5rem',
                            height: '100%'
                        }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="gaming-form__title mb-0">Notifications</h2>
                                {notifications.length > 0 && (
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="gaming-form__button"
                                            onClick={markAllAsRead}
                                            style={{ backgroundColor: 'rgba(59, 130, 246, 0.6)' }}
                                        >
                                            <i className="fas fa-check-double me-2"></i>
                                            Mark All as Read
                                        </button>
                                        <button 
                                            className="gaming-form__button"
                                            onClick={deleteAllNotifications}
                                            style={{ backgroundColor: 'rgba(220, 53, 69, 0.6)' }}
                                        >
                                            <i className="fas fa-trash-alt me-2"></i>
                                            Delete All
                                        </button>
                                    </div>
                                )}
                            </div>

                            {notifications.length === 0 ? (
                                <div style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    borderRadius: '15px',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    color: 'white'
                                }}>
                                    <i className="fas fa-bell-slash fa-3x mb-3"></i>
                                    <h4>No notifications</h4>
                                    <p className="text-muted">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="notification-list">
                                    {notifications.map((notification) => (
                                        <div 
                                            key={notification.id}
                                            style={{
                                                backgroundColor: notification.is_read ? 'rgba(0, 0, 0, 0.3)' : 'rgba(59, 130, 246, 0.1)',
                                                borderRadius: '15px',
                                                padding: '1.5rem',
                                                marginBottom: '1rem',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="notification-icon" style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <i className="fas fa-bell" style={{ color: '#3b82f6' }}></i>
                                                    </div>
                                                    <div>
                                                        <h5 className="mb-1" style={{ color: 'white' }}>
                                                            {notification.title}
                                                        </h5>
                                                        <p className="mb-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                                            {notification.message}
                                                        </p>
                                                        <small style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                            {new Date(notification.created_at).toLocaleDateString()} at {' '}
                                                            {new Date(notification.created_at).toLocaleTimeString()}
                                                        </small>
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    {!notification.is_read && (
                                                        <button 
                                                            className="gaming-form__button"
                                                            onClick={() => markAsRead(notification.id)}
                                                            style={{ backgroundColor: 'rgba(59, 130, 246, 0.6)' }}
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                    )}
                                                    <button 
                                                        className="gaming-form__button"
                                                        onClick={() => deleteNotification(notification.id)}
                                                        style={{ backgroundColor: 'rgba(220, 53, 69, 0.6)' }}
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="gaming-form__container" style={{ 
                            padding: '2.5rem',
                            height: '100%'
                        }}>
                            <h3 className="gaming-form__title mb-4">Latest Game Releases</h3>
                            
                            {gameNews.length === 0 ? (
                                <div style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    borderRadius: '15px',
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    color: 'white'
                                }}>
                                    <i className="fas fa-gamepad fa-3x mb-3"></i>
                                    <p>No game news available</p>
                                </div>
                            ) : (
                                <div className="game-news-list">
                                    {gameNews.map((game) => (
                                        <div 
                                            key={game.id}
                                            style={{
                                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                                borderRadius: '15px',
                                                marginBottom: '1rem',
                                                overflow: 'hidden',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                transition: 'transform 0.3s ease',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => window.open(game.metacritic_url || `https://rawg.io/games/${game.slug}`, '_blank')}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <div style={{
                                                height: '150px',
                                                overflow: 'hidden'
                                            }}>
                                                <img 
                                                    src={game.background_image}
                                                    alt={game.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            </div>
                                            
                                            <div style={{ padding: '1rem' }}>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h5 style={{ 
                                                        color: 'white',
                                                        margin: 0,
                                                        fontSize: '1.1rem'
                                                    }}>
                                                        {game.name}
                                                    </h5>
                                                    {game.metacritic && (
                                                        <span style={{
                                                            backgroundColor: game.metacritic > 75 ? 'rgba(46, 213, 115, 0.8)' :
                                                                          game.metacritic > 50 ? 'rgba(255, 193, 7, 0.8)' :
                                                                          'rgba(220, 53, 69, 0.8)',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '5px',
                                                            fontSize: '0.9rem',
                                                            color: 'white'
                                                        }}>
                                                            {game.metacritic}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div style={{ 
                                                    color: 'rgba(255, 255, 255, 0.6)',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    Released: {new Date(game.released).toLocaleDateString()}
                                                </div>
                                                
                                                <div className="mt-2" style={{
                                                    display: 'flex',
                                                    gap: '0.5rem',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    {game.genres?.slice(0, 3).map(genre => (
                                                        <span 
                                                            key={genre.id}
                                                            style={{
                                                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                                                padding: '0.25rem 0.5rem',
                                                                borderRadius: '5px',
                                                                fontSize: '0.8rem',
                                                                color: 'rgba(255, 255, 255, 0.8)'
                                                            }}
                                                        >
                                                            {genre.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default Notifications;