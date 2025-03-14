import React, { useState, useEffect } from 'react';
import useAxios from '../utils/useAxios';

const Purchases = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useAxios();

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/');
        
        if (isMounted) {
          // Handle different response structures
          let orderData;
          if (response.data && typeof response.data === 'object') {
            orderData = Array.isArray(response.data) ? response.data :
                       Array.isArray(response.data.results) ? response.data.results :
                       Object.values(response.data);
          } else {
            orderData = [];
          }
          
          setOrders(orderData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching orders:', err);
          setError('Failed to load orders. Please try again later.');
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []); // Remove api from dependencies

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!orders || orders.length === 0) {
    return <div className="alert alert-info">No orders found.</div>;
  }

  return (
    <div className="purchases-page container py-5">
      <h2 className="mb-4">Your Orders</h2>
      <div className="row">
        {Array.isArray(orders) && orders.map(order => (
          <div key={order.id} className="col-12 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Order #{order.id}</h5>
                <p className="card-text">
                  <strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}
                </p>
                <p className="card-text">
                  <strong>Status:</strong> {order.status}
                </p>
                <p className="card-text">
                  <strong>Total:</strong> ${typeof order.total === 'number' ? 
                    order.total.toFixed(2) : 
                    parseFloat(order.total || 0).toFixed(2)}
                </p>
                {/* Add PayPal payment button if payment is pending */}
                {order.status === 'pending' && order.payment_url && (
                  <div className="mt-3">
                    <a 
                      href={order.payment_url} 
                      className="btn btn-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!order.payment_url.includes('paypal.com')) {
                          e.preventDefault();
                          alert('Payment URL is invalid. Please contact support.');
                        }
                      }}
                    >
                      Pay with PayPal
                    </a>
                    <small className="d-block text-muted mt-2">
                      If payment window doesn't open, please disable your pop-up blocker and try again
                    </small>
                  </div>
                )}
                {/* Show payment status with detailed information */}
                {order.payment_status && (
                  <div className="payment-status mt-2">
                    <p className="card-text">
                      <strong>Payment Status:</strong>{' '}
                      <span className={`badge bg-${
                        order.payment_status === 'completed' ? 'success' : 
                        order.payment_status === 'pending' ? 'warning' :
                        order.payment_status === 'failed' ? 'danger' : 'secondary'
                      }`}>
                        {order.payment_status.toUpperCase()}
                      </span>
                    </p>
                    {order.payment_status === 'failed' && (
                      <div className="alert alert-danger mt-2">
                        <small>
                          Payment failed. Please try again or contact support if the problem persists.
                          {order.payment_error && (
                            <span className="d-block mt-1">Error: {order.payment_error}</span>
                          )}
                        </small>
                      </div>
                    )}
                  </div>
                )}
                {/* Rest of the order details remain the same */}
                {order.order_items && (
                  <div className="order-items mt-3">
                    <h6>Items:</h6>
                    <ul className="list-unstyled">
                      {order.order_items.map(item => (
                        <li key={item.id}>
                          {item.quantity}x {item.product_name || `Product #${item.product}`} - ${
                            typeof item.price === 'number' ? 
                            item.price.toFixed(2) : 
                            parseFloat(item.price || 0).toFixed(2)
                          }
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Purchases;