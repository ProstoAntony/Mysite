import React from 'react';
import { Link } from 'react-router-dom';

const OrderCancel = () => {
  return (
    <div className="container mt-5 pt-5 text-center">
      <div className="card p-5 shadow">
        <div className="mb-4">
          <i className="fas fa-times-circle text-danger" style={{ fontSize: '5rem' }}></i>
        </div>
        <h2 className="mb-3">Payment Cancelled</h2>
        <p className="lead mb-4">
          Your payment process was cancelled. No charges were made.
        </p>
        <p className="mb-4">
          If you experienced any issues during checkout, please contact our support team.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/checkout" className="btn btn-primary">
            Try Again
          </Link>
          <Link to="/cart" className="btn btn-outline-secondary">
            Return to Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderCancel;