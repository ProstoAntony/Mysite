import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  return (
    <div className="container" style={{ paddingTop: "100px" }}>
      <h2>My Wishlist</h2>
      <div className="row">
        {wishlist.map((item) => (
          <div key={item.id} className="col-md-4 mb-4">
            <div className="card">
              <img src={item.product.image} className="card-img-top" alt={item.product.name} />
              <div className="card-body">
                <h5 className="card-title">{item.product.name}</h5>
                <p className="card-text">${item.product.price}</p>
                <button 
                  className="btn btn-primary me-2"
                  onClick={() => addToCart(item.product)}
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
        ))}
      </div>
    </div>
  );
};

export default Wishlist;