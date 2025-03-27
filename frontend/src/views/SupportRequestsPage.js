import React, { useState, useEffect, useRef, useContext } from 'react';
import useAxios from '../utils/useAxios';
import '../styles/support-page.css';
import AuthContext from '../context/AuthContext';
import Toast from '../components/Toast';

function SupportRequestsPage() {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' или 'users'
    const [directMessage, setDirectMessage] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [newChatMessage, setNewChatMessage] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const messagesEndRef = useRef(null);
    const api = useAxios();
    const [toast, setToast] = useState(null);

    // Обновляем функцию загрузки данных
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Изменяем путь на правильный
                const [requestsResponse, usersResponse] = await Promise.all([
                    api.get('/support/tickets/'),  // Изменено с '/support/my-tickets/' на '/support/tickets/'
                    api.get('/users/list/')
                ]);
                
                console.log('Support Requests:', requestsResponse.data);
                console.log('Users:', usersResponse.data);
                
                setRequests(requestsResponse.data);
                setUsers(usersResponse.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Функция для прокрутки чата вниз
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Загрузка сообщений чата для выбранного пользователя
    const fetchChatMessages = async (userId) => {
        try {
            const response = await api.get(`/api/chat/messages/${userId}/`);
            if (response.data) {
                setChatMessages(response.data);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Error fetching chat messages:', error);
            setChatMessages([]);
        }
    };

    // Функция для показа уведомлений
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // Обновляем обработчик отправки сообщения
    const handleDirectMessage = async (e) => {
        e.preventDefault();
        if (!directMessage.trim() || !selectedUser) return;

        try {
            await api.post('/api/chat/', {
                message: directMessage,
                receiver: selectedUser.id
            });
            setDirectMessage('');
            if (selectedUserId === selectedUser.id) {
                fetchChatMessages(selectedUser.id);
            }
            showToast('Message sent successfully!', 'success');
        } catch (err) {
            console.error('Error sending message:', err);
            showToast('Failed to send message. Please try again.', 'error');
        }
    };

    // Обновляем обработчик отправки сообщения в чат
    const sendChatMessage = async (e) => {
        e.preventDefault();
        if (!newChatMessage.trim() || !selectedUserId) return;

        try {
            const response = await api.post('/api/chat/', {
                message: newChatMessage,
                receiver: selectedUserId
            });
            
            if (response.data) {
                setChatMessages(prev => [...prev, response.data]);
                setNewChatMessage('');
                scrollToBottom();
                showToast('Message sent successfully!', 'success');
            }
        } catch (error) {
            console.error('Error sending chat message:', error);
            showToast('Failed to send message. Please try again.', 'error');
        }
    };

    // Обновляем обработчик ответа на тикет
    const handleReply = async (e) => {
        e.preventDefault();
        if (!reply.trim() || !selectedRequest) return;

        try {
            const response = await api.post(`/support/reply/${selectedRequest.id}/`, {
                message: reply,
                request_id: selectedRequest.id
            });

            if (selectedRequest.user) {
                await api.post('/api/chat/', {
                    message: reply,
                    receiver: selectedRequest.user,
                    related_ticket: selectedRequest.id
                });
            }

            if (response.status === 200 || response.status === 201) {
                const updatedResponse = await api.get('/support/tickets/');
                setRequests(updatedResponse.data);
                const updatedRequest = updatedResponse.data.find(
                    req => req.id === selectedRequest.id
                );
                setSelectedRequest(updatedRequest);
                setReply('');
                showToast('Reply sent successfully!', 'success');
            }
        } catch (err) {
            console.error('Error sending reply:', err);
            showToast('Failed to send reply. Please try again.', 'error');
        }
    };

    // Фильтрация запросов
    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.status === filter;
    });

    // Изменим обработчик клика на кнопке Details
    const handleDetailsClick = (request) => {
        // Если уже выбран этот запрос - сворачиваем
        if (selectedRequest && selectedRequest.id === request.id) {
            setSelectedRequest(null);
        } else {
            // Иначе разворачиваем новый запрос
            setSelectedRequest(request);
        }
    };

    // Обновляем часть рендеринга для деталей запроса
    const renderRequestDetails = () => {
        if (!selectedRequest) {
            return (
                <div className="text-center text-light mt-5">
                    <h5>Select a request to view details</h5>
                </div>
            );
        }

        return (
            <div className="card bg-dark text-light">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{selectedRequest.subject}</h5>
                    <span className={`badge ${selectedRequest.status === 'pending' ? 'bg-warning' : 'bg-success'}`}>
                        {selectedRequest.status}
                    </span>
                </div>
                <div className="card-body">
                    <div className="mb-4">
                        <div className="d-flex justify-content-between mb-2">
                            <strong>From:</strong>
                            <span>{new Date(selectedRequest.created_at).toLocaleString()}</span>
                        </div>
                        <div className="mb-2">
                            <strong>Email:</strong> {selectedRequest.user_email}
                        </div>
                        {selectedRequest.order_number && (
                            <div className="mb-2">
                                <strong>Order Number:</strong> {selectedRequest.order_number}
                            </div>
                        )}
                    </div>

                    <div className="card bg-dark border-secondary mb-4">
                        <div className="card-header">
                            <h6 className="mb-0">User Message</h6>
                        </div>
                        <div className="card-body">
                            <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                {selectedRequest.message}
                            </p>
                        </div>
                    </div>

                    {selectedRequest.admin_reply && (
                        <div className="card bg-success bg-opacity-25 mb-4">
                            <div className="card-header">
                                <h6 className="mb-0">Admin Reply</h6>
                            </div>
                            <div className="card-body">
                                <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                    {selectedRequest.admin_reply}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <button 
                            className="gaming-form__button"
                            onClick={() => {
                                setSelectedUserId(selectedRequest.user);
                                setShowChat(true);
                                fetchChatMessages(selectedRequest.user);
                            }}
                        >
                            <i className="fas fa-comments me-2"></i>
                            Open Chat
                        </button>
                    </div>

                    {selectedRequest.status === 'pending' && (
                        <form onSubmit={handleReply}>
                            <div className="mb-3">
                                <label className="form-label">Reply to User</label>
                                <textarea
                                    className="form-control bg-dark text-light"
                                    rows="4"
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    placeholder="Type your reply here..."
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="gaming-form__button filled">
                                Send Reply
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    };

    // Добавляем индикатор загрузки
    if (loading) {
        return (
            <div className="gaming-form d-flex align-center justify-center" 
                 style={{
                     backgroundImage: 'url("/images/Background 12.png")',
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     minHeight: '100vh',
                     padding: '20px'
                 }}>
                <div className="text-center text-light">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4 className="mt-3">Loading data...</h4>
                </div>
            </div>
        );
    }

    // Добавляем отображение ошибки
    if (error) {
        return (
            <div className="gaming-form d-flex align-center justify-center" 
                 style={{
                     backgroundImage: 'url("/images/Background 12.png")',
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     minHeight: '100vh',
                     padding: '20px'
                 }}>
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error!</h4>
                    <p>{error}</p>
                    <button 
                        className="gaming-form__button filled"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Компонент чата
    const ChatModal = () => (
        <div className="chat-modal" style={{
            position: 'fixed',
            right: '20px',
            bottom: '20px',
            width: '350px',
            height: '500px',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderRadius: '15px',
            zIndex: 1000,
            display: showChat ? 'flex' : 'none',
            flexDirection: 'column'
        }}>
            <div className="chat-header" style={{
                padding: '15px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h5 className="m-0 text-white">Chat with User</h5>
                <button 
                    className="btn-close btn-close-white"
                    onClick={() => setShowChat(false)}
                ></button>
            </div>
            
            <div className="chat-messages" style={{
                flex: 1,
                overflowY: 'auto',
                padding: '15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                {chatMessages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.sender === user.id ? 'sent' : 'received'}`}
                        style={{
                            alignSelf: msg.sender === user.id ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            padding: '10px 15px',
                            borderRadius: '15px',
                            backgroundColor: msg.sender === user.id ? 
                                'rgba(33, 150, 243, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                            color: 'white'
                        }}
                    >
                        <div className="message-text">{msg.message}</div>
                        <div className="message-time" style={{
                            fontSize: '0.8em',
                            opacity: 0.7,
                            marginTop: '5px'
                        }}>
                            {new Date(msg.created_at).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={sendChatMessage} className="chat-input" style={{
                padding: '15px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Type a message..."
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            color: 'white'
                        }}
                    />
                    <button 
                        className="btn btn-primary"
                        type="submit"
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="gaming-form d-flex align-center justify-center" 
             style={{
                 backgroundImage: 'url("/images/Background 12.png")',
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 minHeight: '100vh',
                 padding: '20px'
             }}>
            <div className="gaming-form__container" style={{ maxWidth: '1400px', width: '100%' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="gaming-form__title">Admin Support Panel</h2>
                    <div className="btn-group">
                        <button 
                            className={`gaming-form__button ${activeTab === 'requests' ? 'filled' : ''}`}
                            onClick={() => setActiveTab('requests')}
                        >
                            Support Requests
                        </button>
                        <button 
                            className={`gaming-form__button ${activeTab === 'users' ? 'filled' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Users
                        </button>
                    </div>
                </div>

                {activeTab === 'requests' ? (
                    <div className="row">
                        {/* Список запросов */}
                        <div className="col-md-4">
                            <div className="card bg-dark text-light">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Requests</h5>
                                    <select 
                                        className="form-select form-select-sm bg-dark text-light" 
                                        style={{ width: 'auto' }}
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                    >
                                        <option value="all">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                                <div className="list-group list-group-flush" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                    {filteredRequests.map(request => (
                                        <div
                                            key={request.id}
                                            className="list-group-item bg-dark text-light border-secondary"
                                        >
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div>
                                                    <h6 className="mb-1">{request.subject}</h6>
                                                    <small>{request.user_email}</small>
                                                </div>
                                                <span className={`badge ${request.status === 'pending' ? 'bg-warning' : 'bg-success'}`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">
                                                    {new Date(request.created_at).toLocaleDateString()}
                                                </small>
                                                <button 
                                                    className={`gaming-form__button btn-sm ${selectedRequest?.id === request.id ? 'filled' : ''}`}
                                                    onClick={() => handleDetailsClick(request)}
                                                    style={{
                                                        padding: '4px 12px',
                                                        fontSize: '0.875rem',
                                                        backgroundColor: selectedRequest?.id === request.id ? 'rgba(33, 150, 243, 0.8)' : 'transparent',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    <i className={`fas ${selectedRequest?.id === request.id ? 'fa-chevron-up' : 'fa-chevron-down'} me-1`}></i>
                                                    {selectedRequest?.id === request.id ? 'Hide Details' : 'Show Details'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Детали запроса */}
                        <div className="col-md-8">
                            {renderRequestDetails()}
                        </div>
                    </div>
                ) : (
                    <div className="row">
                        {/* Список пользователей */}
                        <div className="col-md-4">
                            <div className="card bg-dark text-light">
                                <div className="card-header">
                                    <h5 className="mb-0">Registered Users</h5>
                                </div>
                                <div className="list-group list-group-flush" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                    {users.map(user => (
                                        <button
                                            key={user.id}
                                            className={`list-group-item list-group-item-action bg-dark text-light border-secondary
                                                ${selectedUser?.id === user.id ? 'active' : ''}`}
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-1">{user.username}</h6>
                                                    <small>{user.email}</small>
                                                </div>
                                                <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Детали пользователя */}
                        <div className="col-md-8">
                            {selectedUser ? (
                                <div className="card bg-dark text-light">
                                    <div className="card-header">
                                        <h5 className="mb-0">User Details</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <strong>Username:</strong> {selectedUser.username}
                                        </div>
                                        <div className="mb-3">
                                            <strong>Email:</strong> {selectedUser.email}
                                        </div>
                                        <div className="mb-3">
                                            <strong>Status:</strong> {selectedUser.is_active ? 'Active' : 'Inactive'}
                                        </div>
                                        <form onSubmit={handleDirectMessage}>
                                            <div className="mb-3">
                                                <label className="form-label">Send Direct Message</label>
                                                <textarea
                                                    className="form-control bg-dark text-light"
                                                    rows="4"
                                                    value={directMessage}
                                                    onChange={(e) => setDirectMessage(e.target.value)}
                                                    required
                                                ></textarea>
                                            </div>
                                            <button type="submit" className="gaming-form__button filled">
                                                Send Message
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-light mt-5">
                                    <h5>Select a user to view details</h5>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {ChatModal()}
            
            {/* Добавляем Toast в конец компонента */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

export default SupportRequestsPage; 