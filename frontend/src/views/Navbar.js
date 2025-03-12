import { useContext } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useEffect, useState } from 'react'
import useAxios from '../utils/useAxios'

function Navbar() {
    const [notifications, setNotifications] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const api = useAxios();
    let {user, logoutUser} = useContext(AuthContext)
    const cartContext = useCart();
    
    // Add logging to debug
    console.log('Cart Context:', cartContext);
    
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
                <Link className="navbar-brand" to="/">Shop</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/homepage">Home</Link>
                        </li>
                        {user && <li className="nav-item">
                            <Link className="nav-link" to="/dashboard">Dashboard</Link>
                        </li>}
                    </ul>
                    
                    {user && (
                        <div className="d-flex align-items-center me-3">
                            <div className="icon-container">
                                <Link to="/notifications" className="text-white text-decoration-none">
                                    <i className="fas fa-bell"></i>
                                    {notifications.length > 0 && (
                                        <span className="badge bg-danger rounded-pill icon-badge">
                                            {notifications.length}
                                        </span>
                                    )}
                                </Link>
                            </div>
                            <div className="icon-container">
                                <Link to="/cart" className="text-white text-decoration-none">
                                    <i className="fas fa-shopping-cart"></i>
                                    {cartItems && cartItems.length > 0 && (
                                        <span className="badge bg-danger rounded-pill icon-badge">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </Link>
                            </div>
                            <div className="icon-container">
                                <Link to="/profile" className="text-white text-decoration-none">
                                    <i className="fas fa-user"></i>
                                </Link>
                            </div>
                        </div>
                    )}

                    <ul className="navbar-nav">
                        {user ? (
                            <li className="nav-item">
                                <Link className="nav-link" onClick={logoutUser}>Logout</Link>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">Register</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar