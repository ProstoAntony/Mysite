import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import useAxios from '../utils/useAxios';

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
  // Change default payment method to match backend choices
  const [paymentMethod, setPaymentMethod] = useState('PayPal');  // Changed to 'PayPal' with capital letters
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState(true); // Track server status
  const [sdkReady, setSdkReady] = useState(false); // Добавляем состояние для PayPal SDK
  
  const { cartItems, calculateTotal, clearCart } = useCart();
  const api = useAxios();
  const history = useHistory();
  
  // Check server connection on component mount
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        // Try a simple request to check if server is available
        const response = await fetch('http://127.0.0.1:8000/api/products/', {
          method: 'HEAD',
          mode: 'no-cors', // Use no-cors to avoid CORS issues
          cache: 'no-cache'
        });
        setServerStatus(true);
      } catch (error) {
        console.error('Server connection check failed:', error);
        setServerStatus(false);
        setError('Cannot connect to the server. Please make sure the backend server is running.');
      }
    };
    
    checkServerConnection();
  }, []);
  
  useEffect(() => {
    // Redirect to cart if cart is empty
    if (!cartItems || cartItems.length === 0) {
      history.push('/cart');
    }
  }, [cartItems, history]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmitShipping = (e) => {
    e.preventDefault();
    // Validate shipping info - only fullName and email are required
    if (!shippingInfo.fullName || !shippingInfo.email) {
      setError('Please fill in your name and email');
      return;
    }
    
    setActiveStep(1);
    setError('');
  };
  
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };
  
  // Добавляем эффект для загрузки PayPal SDK
  useEffect(() => {
    const loadPayPalScript = async () => {
      // Clear any existing PayPal script
      const existingScript = document.querySelector('script[src*="paypal"]');
      if (existingScript) {
        existingScript.remove();
        setSdkReady(false);
      }
      
      // Используем sandbox client ID для тестирования
      // Если process.env.REACT_APP_PAYPAL_CLIENT_ID недоступен, используем резервный ID
      const paypalClientId = 'AbT8A_4uf65aiST4niZ5d928FUpYOlWGIj5Ol4vovn-CGGF6pYKugXk4hGnwJEpSzRPCGo_IT5S6Wv_7';
      console.log('Loading PayPal with client ID:', paypalClientId);
      
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`;
      script.async = true;
      
      script.onload = () => {
        console.log('PayPal SDK loaded successfully');
        setSdkReady(true);
      };
      
      script.onerror = (err) => {
        console.error('Failed to load PayPal SDK:', err);
        setError('Failed to load payment system');
        setSdkReady(false);
      };
      
      document.body.appendChild(script);
    };
    
    if (activeStep === 1 && paymentMethod === 'PayPal') {
      loadPayPalScript();
    }
    
    return () => {
      const paypalScript = document.querySelector('script[src*="paypal"]');
      if (paypalScript) {
        paypalScript.remove();
        setSdkReady(false);
      }
    };
  }, [activeStep, paymentMethod]);
  
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Если выбран PayPal и SDK не загружен, показываем ошибку
    if (paymentMethod === 'PayPal' && !sdkReady) {
      setError('PayPal is still loading. Please wait a moment and try again.');
      setLoading(false);
      return;
    }
    
    try {
      // Calculate totals directly
      const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      const shipping = subtotal > 50 ? 0 : 5.99;
      const tax = parseFloat((subtotal * 0.085).toFixed(2));
      const total = parseFloat((subtotal + shipping + tax).toFixed(2));
      
      // Restructure order data to match Django model
      const orderData = {
        user: null, // Will be set by backend based on auth token
        shipping_address: {
          full_name: shippingInfo.fullName,
          email: shippingInfo.email,
          address: shippingInfo.address,
          city: shippingInfo.city,
          postal_code: shippingInfo.postalCode,
          country: shippingInfo.country,
        },
        order_items: cartItems.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: parseFloat(item.price)
        })),
        payment_method: paymentMethod,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping_cost: shipping,
        tax: tax,
        total: total,
        status: 'pending',
        return_url: `${window.location.origin}/checkout/success`,
        cancel_url: `${window.location.origin}/checkout/cancel`
      };

      console.log('Sending order data:', orderData);
      
      // Если выбран PayPal, показываем кнопки PayPal
      if (paymentMethod === 'PayPal' && sdkReady) {
        // Очищаем контейнер перед рендерингом
        const paypalContainer = document.getElementById('paypal-button-container');
        if (paypalContainer) {
          paypalContainer.innerHTML = '';
          
          // Рендерим кнопки PayPal
          window.paypal.Buttons({
            style: {
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'paypal'
            },
            createOrder: function(data, actions) {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: total.toFixed(2)
                  }
                }]
              });
            },
            // In your onApprove function in handlePlaceOrder
            onApprove: async function(data, actions) {
              try {
                const details = await actions.order.capture();
                console.log('Payment completed', details);
                
                // Map PayPal status to match what the backend expects
                // The backend expects "Paid" not "paid"
                const paymentStatus = "Paid";
                
                // Simplify the order data structure to match Django model expectations
                const orderData = {
                  full_name: shippingInfo.fullName,
                  email: shippingInfo.email,
                  address: shippingInfo.address,
                  city: shippingInfo.city,
                  postal_code: shippingInfo.postalCode,
                  country: shippingInfo.country,
                  payment_method: 'PayPal',
                  payment_id: details.id,
                  payment_status: paymentStatus,
                  transaction_id: details.id, // Add transaction_id which is used in paypal_payment_verify
                  status: 'Paid', // Match the case in the backend
                  order_items: cartItems.map(item => ({
                    product: item.id,
                    quantity: item.quantity,
                    price: parseFloat(item.price)
                  })),
                  total_price: calculateTotal()
                };
                
                console.log('Sending simplified order data:', orderData);
                
                // Create order in backend
                const response = await api.post('/orders/', orderData);
                
                if (response.status === 201) {
                  clearCart();
                  setActiveStep(2);
                }
              } catch (error) {
                console.error('Payment capture error:', error);
                if (error.response && error.response.data) {
                  console.error('Error response data:', error.response.data);
                  
                  // Create a more readable error message
                  let errorMessage = 'Payment verification failed: ';
                  const errorData = error.response.data;
                  
                  if (errorData.payment_status) {
                    errorMessage += `Invalid payment status: ${errorData.payment_status.join(', ')}`;
                    console.log('Payment status error details:', errorData.payment_status);
                  } else if (typeof errorData === 'object') {
                    // Format other error fields
                    const errorFields = Object.keys(errorData)
                      .map(key => `${key}: ${Array.isArray(errorData[key]) ? errorData[key].join(', ') : errorData[key]}`)
                      .join(', ');
                    errorMessage += errorFields;
                  } else {
                    errorMessage += JSON.stringify(errorData);
                  }
                  
                  setError(errorMessage);
                } else {
                  setError('Payment verification failed. Please contact support.');
                }
              }
            },
            onError: function(err) {
              console.error('PayPal Error:', err);
              setError('Payment failed. Please try again.');
              setLoading(false);
            }
          }).render('#paypal-button-container');
          
          // Показываем контейнер с кнопками
          paypalContainer.style.display = 'block';
        }
        setLoading(false);
        return;
      }
      
      // Для других методов оплаты отправляем запрос на создание заказа
      const response = await api.post('/orders/', orderData);
      
      if (response.status === 201) {
        // Check if there's a payment URL to redirect to (for external payment gateways)
        if (response.data && response.data.payment_url) {
          window.location.href = response.data.payment_url;
          return;
        }
        
        clearCart();
        setActiveStep(2);
      }
    } catch (err) {
      console.error('Error creating order:', err);
      
      // Provide more specific error messages based on the error type
      if (err.message && err.message.includes('Network Error')) {
        setError('Network error: Cannot connect to the server. Please make sure the backend server is running at http://127.0.0.1:8000');
      } else if (err.response) {
        console.error('Response data:', err.response.data);
        
        // Handle specific validation errors
        const errorData = err.response.data;
        let errorMessage = 'Failed to create order: ';
        
        if (errorData.tax) {
          errorMessage += errorData.tax.join(', ');
        } else if (errorData.payment_method) {
          errorMessage += errorData.payment_method.join(', ');
        } else if (errorData.detail) {
          errorMessage += errorData.detail;
        } else {
          errorMessage += 'Please try again';
        }
        
        setError(errorMessage);
      } else {
        setError(`Failed to create order: ${err.message || 'Please try again'}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Render shipping form
  const renderShippingForm = () => (
    <div className="shipping-form">
      <h3 className="mb-4">Shipping Information</h3>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {!serverStatus && (
        <div className="alert alert-warning">
          <strong>Server Connection Issue:</strong> Cannot connect to the backend server. 
          Please make sure the Django server is running at http://127.0.0.1:8000
        </div>
      )}
      
      <form onSubmit={handleSubmitShipping}>
        <div className="mb-3">
          <label htmlFor="fullName" className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            id="fullName"
            name="fullName"
            value={shippingInfo.fullName}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={shippingInfo.email}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="address" className="form-label">Address</label>
          <input
            type="text"
            className="form-control"
            id="address"
            name="address"
            value={shippingInfo.address}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="city" className="form-label">City</label>
            <input
              type="text"
              className="form-control"
              id="city"
              name="city"
              value={shippingInfo.city}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="col-md-6 mb-3">
            <label htmlFor="postalCode" className="form-label">Postal Code</label>
            <input
              type="text"
              className="form-control"
              id="postalCode"
              name="postalCode"
              value={shippingInfo.postalCode}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="mb-3">
          <label htmlFor="country" className="form-label">Country</label>
          <select
            className="form-select"
            id="country"
            name="country"
            value={shippingInfo.country}
            onChange={handleInputChange}
          >
            <option value="">Select Country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="RU">Russia</option>
          </select>
        </div>
        
        <div className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => history.push('/cart')}
          >
            Back to Cart
          </button>
          
          <button type="submit" className="btn btn-primary">
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
  
  // Render payment form
  // Update payment form with correct payment method values
  const renderPaymentForm = () => (
    <div className="payment-form">
      <h3 className="mb-4">Payment Method</h3>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {paymentMethod === 'PayPal' && !sdkReady ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading PayPal...</p>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder}>
          <div className="mb-4">
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                id="PayPal"
                name="paymentMethod"
                value="PayPal"
                checked={paymentMethod === 'PayPal'}
                onChange={handlePaymentMethodChange}
              />
              <label className="form-check-label" htmlFor="PayPal">
                PayPal
              </label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                id="Credit_Card"
                name="paymentMethod"
                value="Credit_Card"
                checked={paymentMethod === 'Credit_Card'}
                onChange={handlePaymentMethodChange}
              />
              <label className="form-check-label" htmlFor="Credit_Card">
                Credit Card
              </label>
            </div>
          </div>
          
          <div className="order-summary mb-4">
            <h4>Order Summary</h4>
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
          
          <div className="d-flex justify-content-between mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setActiveStep(0)}
            >
              Back to Shipping
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
  
  // Render success message
  const renderSuccess = () => (
    <div className="success-message text-center">
      <h3 className="mb-4">Order Placed Successfully!</h3>
      <p>Thank you for your order. You will receive a confirmation email shortly.</p>
      <button
        className="btn btn-primary mt-3"
        onClick={() => history.push('/')}
      >
        Continue Shopping
      </button>
    </div>
  );
  
  // Main render method
  return (
    <div className="checkout-page container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {activeStep === 0 && renderShippingForm()}
          {activeStep === 1 && renderPaymentForm()}
          {activeStep === 2 && renderSuccess()}
        </div>
      </div>
      
      {/* Добавляем контейнер для кнопок PayPal */}
      <div className="row justify-content-center mt-4">
        <div className="col-md-8">
          <div 
            id="paypal-button-container" 
            style={{ 
              minHeight: '200px', 
              display: 'none',
              marginTop: '20px',
              width: '100%' 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
