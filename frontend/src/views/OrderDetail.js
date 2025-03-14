import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAxios from '../utils/useAxios';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const api = useAxios();
  
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await api.get(`/orders/${id}/`);
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOrderDetail();
  }, [id, api]);
  
  if (loading) {
    return (
      <div className="container mt-5 pt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mt-5 pt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mt-5 pt-5">
        <div className="alert alert-warning">Order not found</div>
      </div>
    );
  }
  
  // Calculate order summary
  const subtotal = order.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.085;
  
  return (
    <div className="container mt-5 pt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Details</h2>
        <Link to="/purchases" className="btn btn-outline-secondary">
          <i className="fas fa-arrow-left me-2"></i>Back to Orders
        </Link>
      </div>
      
      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Order #{order.order_number}</h4>
            <div>
              <span className={`badge me-2 ${
                order.payment_status === 'completed' ? 'bg-success' : 
                order.payment_status === 'refunded' ? 'bg-info' : 
                order.payment_status === 'failed' ? 'bg-danger' : 'bg-warning'
              }`}>
                Payment: {order.payment_status.toUpperCase()}
              </span>
              <span className={`badge ${
                order.order_status === 'delivered' ? 'bg-success' : 
                order.order_status === 'shipped' ? 'bg-info' : 
                order.order_status === 'cancelled' ? 'bg-danger' : 'bg-warning'
              }`}>
                Status: {order.order_status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-4">
              <h5>Order Information</h5>
              <p>
                <strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}<br />
                <strong>Payment Method:</strong> {order.payment_method === 'credit_card' ? 'Credit Card' : 'PayPal'}<br />
                <strong>Email:</strong> {order.email}
              </p>
            </div>
            
            <div className="col-md-6 mb-4">
              <h5>Shipping Address</h5>
              <address>
                {order.full_name}<br />
                {order.address}<br />
                {order.city}, {order.postal_code}<br />
                {order.country}
              </address>
            </div>
          </div>
          
          <h5>Order Items</h5>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>${parseFloat(item.price).toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td className="text-end">${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="row">
            <div className="col-md-6 ms-auto">
              <div className="card">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Order Summary</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping:</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax (8.5%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span>${parseFloat(order.total_price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
        <div className="text-end mb-5">
          <button className="btn btn-danger">Cancel Order</button>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;