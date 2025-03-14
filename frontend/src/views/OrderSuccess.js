import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const OrderSuccess = () => {
  const { clearCart } = useCart();
  const history = useHistory();
  
  useEffect(() => {
    // Clear the cart when the success page loads
    clearCart();
    
    // Redirect to orders page after 5 seconds
    const timer = setTimeout(() => {
      history.push('/orders');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [clearCart, history]);

  return (
    <div className="container mt-5 pt-5 text-center">
      <div className="card p-5 shadow">
        <div className="mb-4">
          <i className="fas fa-check-circle text-success" style={{ fontSize: '5rem' }}></i>
        </div>
        <h2 className="mb-3">Order Placed Successfully!</h2>
        <p className="lead mb-4">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
        <p className="mb-4">
          You will receive an email confirmation shortly with your order details.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/orders" className="btn btn-primary">
            View My Orders
          </Link>
          <Link to="/" className="btn btn-outline-secondary">
            Continue Shopping
          </Link>
        </div>
        <p className="mt-4 text-muted">
          You will be redirected to your orders in 5 seconds...
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;