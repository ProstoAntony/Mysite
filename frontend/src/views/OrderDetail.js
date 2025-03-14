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
        console.log('Order detail response:', response.data);
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
  const subtotal = order.order_items ? 
    order.order_items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0) : 
    parseFloat(order.subtotal || 0);
    
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = parseFloat(order.tax || (subtotal * 0.085));
  const total = parseFloat(order.total_price || 0);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
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
            <h4 className="mb-0">Order #{order.id}</h4>
            <div>
              <span className={`badge me-2 ${
                order.payment_status === 'Paid' ? 'bg-success' : 
                order.payment_status === 'Processing' ? 'bg-warning' :
                'bg-danger'
              }`}>
                {order.payment_status}
              </span>
              <span className={`badge ${
                order.status === 'completed' || order.status === 'Paid' ? 'bg-success' : 
                order.status === 'pending' ? 'bg-warning' : 
                'bg-danger'
              }`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>
        
        {order.status === 'pending' && order.payment_url && (
          <div className="mt-3 text-center">
            <a 
              href={order.payment_url}
              className="btn btn-primary btn-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Complete Payment with PayPal
            </a>
          </div>
        )}
        
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-4">
              <h5>Order Information</h5>
              <p>
                <strong>Date:</strong> {formatDate(order.created_at)}<br />
                <strong>Payment Method:</strong> {order.payment_method}<br />
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
                {order.order_items && order.order_items.map(item => (
                  <tr key={item.id}>
                    <td>{item.product_name || 'Product'}</td>
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
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'Paid' && (
        <div className="text-end mb-5">
          <button className="btn btn-danger">Cancel Order</button>
        </div>
      )}
      
      {order.payment_id && (
        <div className="card mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">Payment Information</h5>
          </div>
          <div className="card-body">
            <p><strong>Payment ID:</strong> {order.payment_id}</p>
            <p><strong>Payment Status:</strong> {order.payment_status}</p>
            {order.transaction_id && (
              <p><strong>Transaction ID:</strong> {order.transaction_id}</p>
            )}
            {order.payment_method === 'PayPal' && (
              <div className="alert alert-info">
                <i className="fab fa-paypal me-2"></i>
                This order was paid using PayPal.
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Order Timeline */}
      <div className="card mb-5">
        <div className="card-header bg-light">
          <h5 className="mb-0">Order Timeline</h5>
        </div>
        <div className="card-body">
          <ul className="timeline">
            <li className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h5 className="timeline-title">Order Placed</h5>
                <p className="timeline-date">{formatDate(order.created_at)}</p>
                <p>Your order has been received and is being processed.</p>
              </div>
            </li>
            
            {order.payment_status === 'Paid' && (
              <li className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h5 className="timeline-title">Payment Confirmed</h5>
                  <p className="timeline-date">{formatDate(order.updated_at)}</p>
                  <p>Your payment has been confirmed.</p>
                </div>
              </li>
            )}
            
            {order.status === 'shipped' && (
              <li className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h5 className="timeline-title">Order Shipped</h5>
                  <p className="timeline-date">{formatDate(order.shipped_date || order.updated_at)}</p>
                  <p>Your order has been shipped.</p>
                </div>
              </li>
            )}
            
            {order.status === 'delivered' && (
              <li className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h5 className="timeline-title">Order Delivered</h5>
                  <p className="timeline-date">{formatDate(order.delivered_date || order.updated_at)}</p>
                  <p>Your order has been delivered.</p>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;