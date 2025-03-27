import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/support-page.css'; // Используем те же стили

const ProductListGuest = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/products/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Products data received:', data);
                console.log('First product example:', data.results && data.results[0]);
                setProducts(data.results || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products');
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return (
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

    if (error) return (
        <div className="gaming-form d-flex align-center justify-center" style={{ 
            backgroundImage: 'url("/images/Background 12.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            padding: '40px 0'
        }}>
            <div className="gaming-form__container" style={{ maxWidth: '800px', width: '90%', padding: '2.5rem' }}>
                <h1 className="gaming-form__title">Error</h1>
                <div className="alert" style={{ backgroundColor: 'rgba(220, 53, 69, 0.7)', borderRadius: '5px', padding: '15px' }}>
                    <p className="mb-0">{error}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="gaming-form" style={{ 
            backgroundImage: 'url("/images/Background 12.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh'
        }}>
            {/* Обновленный баннер для незарегистрированных пользователей */}
            <div style={{ 
                padding: '25px 0',
                marginBottom: '20px',
                background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.8) 0%, rgba(37, 117, 252, 0.8) 100%)',
                backdropFilter: 'blur(5px)'
            }}>
                <div className="container-fluid">
                    <div className="row align-items-center" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                        <div className="col-md-8">
                            <h2 className="mb-2 text-white">Welcome to Our Shop!</h2>
                            <p className="mb-md-0 text-white">
                                Register or login to access exclusive deals, save your cart, and complete purchases.
                            </p>
                        </div>
                        <div className="col-md-4 text-md-end">
                            <Link to="/register" className="gaming-form__button filled me-2">
                                Register
                            </Link>
                            <Link to="/login" className="gaming-form__button">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid py-4">
                <div className="gaming-form__container" style={{ 
                    padding: '2.5rem', 
                    marginBottom: '2rem',
                    maxWidth: '1400px'
                }}>
                    <h1 className="gaming-form__title">Our Products</h1>
                    <p className="gaming-form__subtitle">Browse our collection of premium games</p>
                    
                    <div className="row">
                        {products.map(product => (
                            <div className="col-lg-4 col-md-6 mb-4" key={product.id}>
                                <div style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    backdropFilter: 'blur(5px)',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}>
                                    <div style={{ 
                                        height: "250px", 
                                        overflow: "hidden"
                                    }}>
                                        {product.image ? (
                                            <img 
                                                src={product.image}
                                                style={{ 
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    transition: "transform 0.3s ease"
                                                }}
                                                alt={product.name}
                                                onError={(e) => {
                                                    console.error('Image load error:', product.image);
                                                    e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                                }}
                                                className="product-image"
                                            />
                                        ) : (
                                            <img 
                                                src="https://via.placeholder.com/300x300?text=No+Image"
                                                style={{ 
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover"
                                                }}
                                                alt="No image available"
                                            />
                                        )}
                                    </div>
                                    <div style={{ 
                                        padding: '1.25rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flexGrow: 1,
                                        color: 'white'
                                    }}>
                                        <h5 className="mb-2">{product.name}</h5>
                                        <div className="mb-2">
                                            {product.category && (
                                                <span className="badge me-2" style={{ backgroundColor: 'rgba(108, 117, 125, 0.8)' }}>
                                                    {product.category.title}
                                                </span>
                                            )}
                                            {product.status === "Published" && (
                                                <span className="badge" style={{ backgroundColor: 'rgba(40, 167, 69, 0.8)' }}>
                                                    Available
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="mb-3 text-light" style={{ fontSize: '0.9rem' }} 
                                             dangerouslySetInnerHTML={{ __html: product.description?.substring(0, 100) + '...' }}>
                                        </div>
                                        
                                        <div className="mt-auto d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-0 fw-bold" style={{ color: '#f0d000' }}>${product.price}</h6>
                                                {product.regular_price && product.regular_price > product.price && (
                                                    <small style={{ color: '#dc3545', textDecoration: 'line-through' }}>
                                                        ${product.regular_price}
                                                    </small>
                                                )}
                                            </div>
                                            <Link to="/login" className="gaming-form__button filled" style={{ padding: '0.5rem 1rem' }}>
                                                Login to Buy
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductListGuest;