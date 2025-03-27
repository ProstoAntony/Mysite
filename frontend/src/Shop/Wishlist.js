import React, { useEffect, useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import AuthContext from '../context/AuthContext';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();
    const { user, authTokens } = useContext(AuthContext);
    const history = useHistory();

    useEffect(() => {
        fetchWishlist();
    }, [authTokens]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:8000/api/wishlist/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens?.access}`,
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Полученные данные избранного:', data);
                const wishlistData = data.results || [];
                setWishlistItems(wishlistData);
            } else {
                console.error('Ошибка загрузки избранного:', response.statusText);
                setError('Не удалось загрузить список избранного');
            }
        } catch (error) {
            console.error('Ошибка при загрузке избранного:', error);
            setError('Ошибка при загрузке списка избранного');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (id) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/wishlist/${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authTokens?.access}`,
                }
            });
            
            if (response.status === 204) {
                setWishlistItems(prev => prev.filter(item => item.id !== id));
                console.log('Успешно удалено из избранного');
            } else {
                throw new Error('Ошибка при удалении из избранного');
            }
        } catch (error) {
            console.error('Ошибка удаления из избранного:', error);
            alert('Произошла ошибка при удалении из избранного');
        }
    };

    const handleAddToCart = (product) => {
        try {
            addToCart(product);
            alert(`${product.name} добавлен в корзину`);
        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            alert('Произошла ошибка при добавлении в корзину');
        }
    };

    if (!authTokens?.access) {
        return (
            <div className="gaming-form d-flex align-items-center justify-content-center" 
                 style={{
                     backgroundImage: 'url("/images/Background 12.png")',
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     minHeight: '100vh'
                 }}>
                <div className="gaming-form__container text-center p-5">
                    <h2 className="text-light mb-4">Authorization Required</h2>
                    <p className="text-light mb-4">Please login to view your wishlist</p>
                    <Link to="/login" className="gaming-form__button filled">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="gaming-form d-flex align-items-center justify-content-center" 
                 style={{
                     backgroundImage: 'url("/images/Background 12.png")',
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     minHeight: '100vh'
                 }}>
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="gaming-form d-flex align-items-center justify-content-center" 
                 style={{
                     backgroundImage: 'url("/images/Background 12.png")',
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     minHeight: '100vh'
                 }}>
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="gaming-form" 
             style={{
                 backgroundImage: 'url("/images/Background 12.png")',
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 minHeight: '100vh',
                 padding: '100px 20px 40px'
             }}>
            <div className="container">
                <div className="gaming-form__container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="gaming-form__title">
                            <i className="fas fa-heart me-2"></i>
                            My Wishlist
                        </h2>
                        <Link to="/shop" className="gaming-form__button">
                            <i className="fas fa-store me-2"></i>
                            Continue Shopping
                        </Link>
                    </div>

                    {wishlistItems.length === 0 ? (
                        <div className="text-center p-5" style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            borderRadius: '15px'
                        }}>
                            <i className="fas fa-heart-broken fa-3x mb-3 text-light"></i>
                            <h4 className="text-light mb-4">Your wishlist is empty</h4>
                            <Link to="/shop" className="gaming-form__button filled">
                                Discover Games
                            </Link>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {wishlistItems.map((item) => (
                                <div key={item.id} className="col-md-6 col-lg-4">
                                    <div className="card h-100" style={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                        borderRadius: '15px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                        <div style={{ position: 'relative' }}>
                                            <img 
                                                src={item.product.image} 
                                                className="card-img-top" 
                                                alt={item.product.name}
                                                style={{ 
                                                    height: "200px", 
                                                    objectFit: "cover",
                                                    borderTopLeftRadius: '15px',
                                                    borderTopRightRadius: '15px'
                                                }}
                                            />
                                        </div>
                                        <div className="card-body text-light">
                                            <h5 className="card-title">{item.product.name}</h5>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div>
                                                    <span className="h5 text-success mb-0">
                                                        ${item.product.price}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button 
                                                    className="gaming-form__button filled flex-grow-1"
                                                    onClick={() => handleAddToCart(item.product)}
                                                >
                                                    <i className="fas fa-shopping-cart me-2"></i>
                                                    В корзину
                                                </button>
                                                <button 
                                                    className="gaming-form__button"
                                                    onClick={() => removeFromWishlist(item.id)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;