import React, { useEffect, useState } from 'react';
import useAxios from '../utils/useAxios';
import { Link } from 'react-router-dom';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const api = useAxios();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const response = await api.get('/api/wishlist/');
            console.log('Wishlist response:', response.data); // Для отладки
            const wishlistData = Array.isArray(response.data) ? response.data : [];
            setWishlistItems(wishlistData);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setWishlistItems([]);
        }
    };

    const removeFromWishlist = async (id) => {
        try {
            await api.delete(`/api/wishlist/${id}/`);
            setWishlistItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    return (
        <div className="container" style={{ paddingTop: "100px" }}>
            <h2 className="mb-4">My Wishlist</h2>
            {wishlistItems.length === 0 ? (
                <div className="alert alert-info">
                    Your wishlist is empty. <Link to="/products">Browse products</Link>
                </div>
            ) : (
                <div className="row">
                    {wishlistItems.map((item) => (
                        <div key={item.id} className="col-md-4 mb-4">
                            <div className="card">
                                <img 
                                    src={item.product.image} 
                                    className="card-img-top" 
                                    alt={item.product.name}
                                    style={{ height: "200px", objectFit: "cover" }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{item.product.name}</h5>
                                    <p className="card-text">
                                        <strong>Price: </strong>${item.product.price}
                                    </p>
                                    <div className="d-flex justify-content-between">
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => {/* Add to cart logic */}}
                                        >
                                            Add to Cart
                                        </button>
                                        <button 
                                            className="btn btn-danger"
                                            onClick={() => removeFromWishlist(item.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;