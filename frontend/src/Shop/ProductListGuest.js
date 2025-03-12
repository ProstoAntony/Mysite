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
        <section className="py-5" style={{ backgroundColor: "#eee" }}>
            <div className="container">
                <h2 className="text-center mb-5">Our Products</h2>
                <div className="row">
                    {products.map(product => (
                        <div className="col-md-4 mb-4" key={product.id}>
                            <div className="card h-100">
                                <div className="bg-image hover-zoom ripple ripple-surface ripple-surface-light">
                                    <img 
                                        src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
                                        className="w-100"
                                        style={{ height: "300px", objectFit: "contain" }}
                                        alt={product.name}
                                    />
                                    <Link to="/login" className="text-decoration-none">
                                        <div className="hover-overlay">
                                            <div className="mask" style={{ backgroundColor: "rgba(251, 251, 251, 0.15)" }}></div>
                                        </div>
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <h5 className="card-title mb-3">{product.name}</h5>
                                    <div className="mb-2 text-muted small">
                                        {product.category && (
                                            <span className="badge bg-secondary me-2">{product.category.title}</span>
                                        )}
                                    </div>
                                    <div className="mb-3">{product.description?.substring(0, 100)}...</div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0">${product.price}</h6>
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
    );
};

export default ProductListGuest;