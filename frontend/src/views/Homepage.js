import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ProductList from '../Shop/ProductList';
import ProductListGuest from '../Shop/ProductListGuest';
import { useCart } from '../context/CartContext';
import useAxios from '../utils/useAxios';

function HomePage() {
    const { user } = useContext(AuthContext);
    const { cartItems } = useCart();
    const [discountedProducts, setDiscountedProducts] = useState([]);
    const api = useAxios();

    useEffect(() => {
        fetchDiscountedProducts();
    }, []);

    const fetchDiscountedProducts = async () => {
        try {
            // Try to fetch products without authentication first
            try {
                const response = await fetch('http://127.0.0.1:8000/api/products/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // Filter products with discounts (where price < regular_price)
                    const discounted = (data.results || []).filter(
                        product => product.regular_price && product.price < product.regular_price
                    ).slice(0, 3); // Get top 3 discounted products
                    
                    if (discounted.length > 0) {
                        setDiscountedProducts(discounted);
                        return;
                    }
                }
            } catch (publicApiError) {
                console.log('Public API error:', publicApiError);
            }
            
            // If we're here, either the public API failed or there were no discounted products
            // Only try the authenticated endpoint if user is logged in
            if (user) {
                const response = await api.get('/products/discounted/');
                setDiscountedProducts(response.data.results || []);
            } else {
                // For guest users, set empty array if public API failed
                setDiscountedProducts([]);
            }
        } catch (error) {
            console.error('Error fetching discounted products:', error);
            setDiscountedProducts([]);
        }
    };

    // Функция для создания правильной ссылки в зависимости от статуса авторизации
    const getProductLink = (productId) => {
        return user ? `/product/${productId}` : '/login';
    };

    // Функция для отображения кнопки действия в зависимости от статуса авторизации
    const getActionButton = (productId) => {
        if (user) {
            return (
                <Link to={`/product/${productId}`} className="btn btn-primary btn-sm mt-2">
                    View Details
                </Link>
            );
        } else {
            return (
                <Link to="/login" className="btn btn-primary btn-sm mt-2">
                    Login to Buy
                </Link>
            );
        }
    };

    return (
        <div className="container-fluid" style={{ paddingTop: "80px", background: '#1b2838' }}>
            <div className="discount-slider">
                {/* Main Featured Banner */}
                <div className="featured-banner mb-3">
                    {discountedProducts.length > 0 && (
                        <div className="main-banner-card">
                            <div className="image-container">
                                <img 
                                    src={discountedProducts[0].image}
                                    alt={discountedProducts[0].name}
                                    className="main-banner-image"
                                    style={{ 
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        objectPosition: 'center' 
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/400x200?text=Product+Image";
                                    }}
                                />
                            </div>
                            <div className="banner-info">
                                <h3 className="banner-title">{discountedProducts[0].name}</h3>
                                <div className="banner-price-container">
                                    <div className="discount-badge">
                                        -{Math.round(((discountedProducts[0].regular_price - discountedProducts[0].price) / discountedProducts[0].regular_price) * 100)}%
                                    </div>
                                    <div className="price-info">
                                        <div className="old-price">${discountedProducts[0].regular_price}</div>
                                        <div className="new-price">${discountedProducts[0].price}</div>
                                    </div>
                                </div>
                                {getActionButton(discountedProducts[0].id)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Two Smaller Banners */}
                <div className="secondary-banners d-flex justify-content-between">
                    {discountedProducts.slice(1, 3).map(product => {
                        const discountPercentage = Math.round(
                            ((product.regular_price - product.price) / product.regular_price) * 100
                        );
                        
                        return (
                            <div key={product.id} className="secondary-banner-item">
                                {/* Удаляем внешний Link и оставляем только div */}
                                <div className="secondary-banner-card">
                                    <div className="image-container">
                                        <img 
                                            src={product.image}
                                            alt={product.name}
                                            className="secondary-banner-image"
                                            style={{ 
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                objectPosition: 'center' 
                                            }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://via.placeholder.com/200x100?text=Product+Image";
                                            }}
                                        />
                                    </div>
                                    <div className="banner-info">
                                        <h4 className="banner-title">{product.name}</h4>
                                        <div className="banner-price-container">
                                            <div className="discount-badge">
                                                -{discountPercentage}%
                                            </div>
                                            <div className="price-info">
                                                <div className="old-price">${product.regular_price}</div>
                                                <div className="new-price">${product.price}</div>
                                            </div>
                                        </div>
                                        {getActionButton(product.id)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Rest of the content */}
            <div className="row mt-4">
                <main role="main" className="col-12">
                    <h2 className="text-light mb-4">Featured & Recommended</h2>
                    {user ? <ProductList /> : <ProductListGuest />}
                </main>
            </div>
        </div>
    );
}

export default HomePage;