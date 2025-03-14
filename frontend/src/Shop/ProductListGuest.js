import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

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
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="container mt-5">
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        </div>
    );

    return (
        <>
            {/* Баннер для незарегистрированных пользователей */}
            <div className="container-fluid py-4 mb-4" style={{ 
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                color: 'white'
            }}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h2 className="mb-2">Welcome to Our Shop!</h2>
                            <p className="mb-md-0">
                                Register or login to access exclusive deals, save your cart, and complete purchases.
                            </p>
                        </div>
                        <div className="col-md-4 text-md-end">
                            <Link to="/register" className="btn btn-light me-2">
                                Register
                            </Link>
                            <Link to="/login" className="btn btn-outline-light">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <section className="py-5" style={{ backgroundColor: "#eee" }}>
                <div className="container">
                    <h2 className="text-center mb-5">Our Products</h2>
                    <div className="row">
                        {products.map(product => (
                            <div className="col-md-4 mb-4" key={product.id}>
                                <div className="card h-100">
                                    <div className="card-img-container" style={{ 
                                        height: "250px", 
                                        overflow: "hidden",
                                        borderTopLeftRadius: "inherit",
                                        borderTopRightRadius: "inherit"
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
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title mb-2">{product.name}</h5>
                                        <div className="mb-2">
                                            {product.category && (
                                                <span className="badge bg-secondary me-2">{product.category.title}</span>
                                            )}
                                            {product.status === "Published" && (
                                                <span className="badge bg-success">Available</span>
                                            )}
                                        </div>
                                        
                                        <div className="mb-3" dangerouslySetInnerHTML={{ __html: product.description?.substring(0, 100) + '...' }}></div>
                                        
                                        <div className="mt-auto d-flex justify-content-between align-items-center gap-2">
                                            <div>
                                                <h6 className="mb-0 fw-bold">${product.price}</h6>
                                                {product.regular_price && product.regular_price > product.price && (
                                                    <small className="text-danger text-decoration-line-through">
                                                        ${product.regular_price}
                                                    </small>
                                                )}
                                            </div>
                                            <Link to="/login" className="btn btn-primary">
                                                Login to Buy
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductListGuest;