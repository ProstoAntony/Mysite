import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import useAxios from '../utils/useAxios';

function NavbarComponent() {
    const [notifications, setNotifications] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef(null);
    const history = useHistory();
    const api = useAxios();
    let { user, logoutUser } = useContext(AuthContext);
    const cartContext = useCart();
    const [showChat, setShowChat] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const { cartItems, removeFromCart } = cartContext || {};

    // Функция для обработки поиска
    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/products/?search=${encodeURIComponent(searchQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data.results || []);
                    setShowSearchResults(true);
                }
            } catch (error) {
                console.error('Error searching products:', error);
            }
        }
    };

    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim().length >= 2) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/products/?search=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data.results || []);
                    setShowSearchResults(true);
                }
            } catch (error) {
                console.error('Error searching products:', error);
            }
        } else {
            setShowSearchResults(false);
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchRef]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/api/notifications/');
            const notificationsData = Array.isArray(response.data) ? response.data : [];
            setNotifications(notificationsData);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        }
    };

    // Функция для получения непрочитанных сообщений
    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/api/chat/unread_count/');
            setUnreadMessages(response.data.unread_count);
        } catch (error) {
            console.error('Error fetching unread messages:', error);
        }
    };

    // Функция для получения истории чата
    const fetchChatHistory = async () => {
        try {
            const response = await api.get('/api/chat/admin_chat/');
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    // Функция для отправки сообщения
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await api.post('/api/chat/', {
                message: newMessage,
                receiver: 1 // ID админа
            });
            setMessages([...messages, response.data]);
            setNewMessage('');
            scrollToBottom();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Прокрутка чата вниз
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000); // Проверка каждые 30 секунд
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        if (showChat) {
            fetchChatHistory();
            api.post('/api/chat/mark_as_read/');
            setUnreadMessages(0);
        }
    }, [showChat]);

    // Добавляем компонент чата
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
                <h5 className="m-0 text-white">Chat with Support</h5>
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
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.sender === user.user_id ? 'sent' : 'received'}`}
                        style={{
                            alignSelf: msg.sender === user.user_id ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            padding: '10px 15px',
                            borderRadius: '15px',
                            backgroundColor: msg.sender === user.user_id ? 
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
            
            <form onSubmit={sendMessage} className="chat-input" style={{
                padding: '15px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
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
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    <i className="fas fa-store me-1"></i>
                    Shop
                </Link>
                
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/products">PRODUCT CATALOG</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/support">SUPPORT</Link>
                        </li>
                        {user && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/purchases">
                                        <i className="fas fa-shopping-bag me-2"></i>MY ORDERS
                                    </Link>
                                </li>
                                {user.is_staff && user.is_superuser && (
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/dashboard">ADMIN PANEL</Link>
                                    </li>
                                )}
                            </>
                        )}
                    </ul>

                    <div className="d-flex align-items-center">
                        {/* Search */}
                        <div className="position-relative" ref={searchRef}>
                            <form className="d-flex me-3" onSubmit={handleSearch}>
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        className="form-control bg-dark text-light border-secondary" 
                                        placeholder="SEARCH GAMES" 
                                        style={{ minWidth: '200px' }}
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                    <button 
                                        className="btn btn-outline-secondary" 
                                        type="submit"
                                    >
                                        <i className="fas fa-search"></i>
                                    </button>
                                </div>
                            </form>
                            
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="position-absolute bg-dark border border-secondary rounded p-2" 
                                     style={{ 
                                         width: '300px', 
                                         maxHeight: '400px', 
                                         overflowY: 'auto', 
                                         zIndex: 1000,
                                         top: '100%',
                                         right: 0
                                     }}>
                                    <h6 className="text-light mb-2">Search Results</h6>
                                    {searchResults.map(product => (
                                        <div key={product.id} className="search-result-item mb-2 border-bottom pb-2">
                                            <div 
                                                className="d-flex align-items-center cursor-pointer"
                                                onClick={() => {
                                                    setShowSearchResults(false);
                                                    history.push(`/product/${product.id}`);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="search-result-img me-2" style={{ width: '50px', height: '50px' }}>
                                                    <img 
                                                        src={product.image || "https://via.placeholder.com/50x50?text=No+Image"} 
                                                        alt={product.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "https://via.placeholder.com/50x50?text=No+Image";
                                                        }}
                                                    />
                                                </div>
                                                <div className="search-result-info">
                                                    <div className="text-light">{product.name}</div>
                                                    <div className="text-success">${product.price}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {user ? (
                            <>
                                {/* Notifications */}
                                <div className="icon-container me-3">
                                    <Link to="/notifications" className="text-white text-decoration-none">
                                        <i className="fas fa-bell"></i>
                                        {notifications.length > 0 && (
                                            <span className="badge bg-danger rounded-pill icon-badge">
                                                {notifications.length}
                                            </span>
                                        )}
                                    </Link>
                                </div>

                                {/* Добавляем Wishlist */}
                                <div className="icon-container me-3">
                                    <Link to="/wishlist" className="text-white text-decoration-none">
                                        <i className="fas fa-heart"></i>
                                    </Link>
                                </div>

                                {/* Cart */}
                                <div className="icon-container me-3">
                                    <Link to="/cart" className="text-white text-decoration-none">
                                        <i className="fas fa-shopping-cart"></i>
                                        {cartItems && cartItems.length > 0 && (
                                            <span className="badge bg-danger rounded-pill icon-badge">
                                                {cartItems.length}
                                            </span>
                                        )}
                                    </Link>
                                </div>

                                {/* Profile */}
                                <div className="dropdown">
                                    <button className="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                        <i className="fas fa-user me-2"></i>
                                        {user.username}
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                                        <li><Link className="dropdown-item" to="/purchases">My Orders</Link></li>
                                        {user.is_staff && user.is_superuser && (
                                            <>
                                                <li><hr className="dropdown-divider" /></li>
                                                <li><Link className="dropdown-item" to="/dashboard">Admin Panel</Link></li>
                                                <li><Link className="dropdown-item" to="/dashboard/support">Support Requests</Link></li>
                                            </>
                                        )}
                                        <li><hr className="dropdown-divider" /></li>
                                        <li><button className="dropdown-item" onClick={logoutUser}>Sign Out</button></li>
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/login" className="btn btn-outline-light me-2">
                                    <i className="fas fa-sign-in-alt me-2"></i>
                                    Sign In
                                </Link>
                                <Link to="/register" className="btn btn-light">
                                    Register
                                </Link>
                            </div>
                        )}

                        {user && !user.is_staff && (
                            <div className="icon-container me-3">
                                <button 
                                    className="btn btn-link text-white position-relative"
                                    onClick={() => setShowChat(!showChat)}
                                >
                                    <i className="fas fa-comments"></i>
                                    {unreadMessages > 0 && (
                                        <span className="badge bg-danger rounded-pill icon-badge">
                                            {unreadMessages}
                                        </span>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {ChatModal()}
        </nav>
    );
}

export default NavbarComponent; 