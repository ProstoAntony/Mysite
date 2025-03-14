import { useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useEffect, useState, useRef } from 'react'
import useAxios from '../utils/useAxios'

function Navbar() {
    const [notifications, setNotifications] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef(null);
    const history = useHistory();
    const api = useAxios();
    let {user, logoutUser} = useContext(AuthContext)
    const cartContext = useCart();
    
    // Add logging to debug
    console.log('Cart Context:', cartContext);
    console.log("User auth data:", {
        id: user?.user_id,
        is_staff: user?.is_staff,
        is_superuser: user?.is_superuser
    });
    console.log("Full User Token Data:", user);
    console.log("User Type from Token:", user?.user_type);
    console.log("Is Staff:", user?.is_staff);
    console.log("Is Superuser:", user?.is_superuser);
    console.log("User profile:", user?.profile);
    console.log("User type:", user?.profile?.user_type);
    
    const { cartItems, removeFromCart } = cartContext || {};

    const handleRemoveItem = (e, itemId) => {
        e.preventDefault();
        if (typeof removeFromCart === 'function') {
            removeFromCart(itemId);
        } else {
            console.error('removeFromCart is not a function:', removeFromCart);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

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

    // Функция для обработки изменения поискового запроса
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

    // Закрытие результатов поиска при клике вне
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
                            
                            {/* Модальное окно с результатами поиска */}
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
                                            {/* Заменяем Link на div с обработчиком onClick, который использует window.location */}
                                            <div 
                                                className="d-flex align-items-center cursor-pointer"
                                                onClick={() => {
                                                    setShowSearchResults(false);
                                                    // Используем history.push вместо window.location.href
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
                                    <div className="text-center mt-2">
                                        <button 
                                            className="btn btn-sm btn-outline-light w-100"
                                            onClick={() => {
                                                setShowSearchResults(false);
                                                history.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                                            }}
                                        >
                                            View All Results
                                        </button>
                                    </div>
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
                                        <li><Link className="dropdown-item" to="/library">Library</Link></li>
                                        {user.is_staff && user.is_superuser && (
                                            <>
                                                <li><hr className="dropdown-divider" /></li>
                                                <li><Link className="dropdown-item" to="/admin/orders">Orders</Link></li>
                                                <li><Link className="dropdown-item" to="/admin/products">Products</Link></li>
                                                <li><Link className="dropdown-item" to="/admin/users">Users</Link></li>
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
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar