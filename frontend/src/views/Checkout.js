import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import useAxios from '../utils/useAxios';
import AuthContext from '../context/AuthContext';

const Checkout = () => {
  const { user } = useContext(AuthContext);
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
      const serviceFee = parseFloat((subtotal * 0.05).toFixed(2));
      const total = parseFloat((subtotal + shipping + tax + serviceFee).toFixed(2));
      
      const orderData = {
        full_name: shippingInfo.fullName,
        email: shippingInfo.email,
        address: shippingInfo.address,
        city: shippingInfo.city,
        postal_code: shippingInfo.postalCode,
        country: shippingInfo.country,
        payment_method: 'PayPal',
        subtotal: subtotal,
        shipping_cost: shipping,
        tax: tax,
        service_fee: serviceFee,
        total_price: total,
        order_items: cartItems.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: parseFloat(item.price)
        }))
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
                // Calculate order totals
                const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
                const shippingCost = cartItems.reduce((sum, item) => sum + (parseFloat(item.shipping || 0) * item.quantity), 0);
                const taxRate = 0.10; // 10% tax
                const serviceFeeRate = 0.05; // 5% service fee
                const tax = subtotal * taxRate;
                const serviceFee = subtotal * serviceFeeRate;
                const total = subtotal + shippingCost + tax + serviceFee;

                const orderData = {
                  customer: user.id,
                  payment_method: 'PayPal',
                  payment_id: details.id,
                  payment_status: paymentStatus,
                  order_status: 'Pending',
                  sub_total: subtotal.toFixed(2),
                  shipping: shippingCost.toFixed(2),
                  tax: tax.toFixed(2),
                  service_fee: serviceFee.toFixed(2),
                  total: total.toFixed(2),
                  order_items: cartItems.map(item => ({
                    product: item.id,
                    qty: item.quantity,
                    price: parseFloat(item.price),
                    sub_total: (parseFloat(item.price) * item.quantity).toFixed(2),
                    shipping: parseFloat(item.shipping || 0).toFixed(2)
                  }))
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
  
  // Обновляем стили для основного контейнера
  return (
    <div className="gaming-form" style={{ 
      backgroundImage: 'url("/images/Background 12.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div className="container-fluid py-5">
        <div className="gaming-form__container" style={{ 
          padding: '2.5rem', 
          marginBottom: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Шаги оформления заказа */}
          <div className="checkout-steps mb-4">
            <div className="d-flex justify-content-center">
              <div className={`step ${activeStep >= 0 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-title">Shipping</div>
              </div>
              <div className={`step-line ${activeStep >= 1 ? 'active' : ''}`}></div>
              <div className={`step ${activeStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-title">Payment</div>
              </div>
              <div className={`step-line ${activeStep >= 2 ? 'active' : ''}`}></div>
              <div className={`step ${activeStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-title">Confirmation</div>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-md-8">
              {/* Форма доставки */}
              {activeStep === 0 && (
                <div className="shipping-form" style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '15px',
                  padding: '25px',
                  color: 'white'
                }}>
                  <h3 className="mb-4 text-center">Shipping Information</h3>
                  
                  {error && (
                    <div className="alert" style={{
                      backgroundColor: 'rgba(220, 53, 69, 0.7)',
                      color: 'white',
                      borderRadius: '10px'
                    }}>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmitShipping}>
                    <div className="mb-3">
                      <label htmlFor="fullName" className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control gaming-form__input"
                        id="fullName"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleInputChange}
                        required
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white'
                        }}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control gaming-form__input"
                        id="email"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        required
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white'
                        }}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="address" className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control gaming-form__input"
                        id="address"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white'
                        }}
                      />
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="city" className="form-label">City</label>
                        <input
                          type="text"
                          className="form-control gaming-form__input"
                          id="city"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleInputChange}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white'
                          }}
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label htmlFor="postalCode" className="form-label">Postal Code</label>
                        <input
                          type="text"
                          className="form-control gaming-form__input"
                          id="postalCode"
                          name="postalCode"
                          value={shippingInfo.postalCode}
                          onChange={handleInputChange}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="country" className="form-label">Country</label>
                      <select
                        className="form-select gaming-form__input"
                        id="country"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleInputChange}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white'
                        }}
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
                        className="gaming-form__button"
                        onClick={() => history.push('/cart')}
                      >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Cart
                      </button>
                      
                      <button type="submit" className="gaming-form__button filled">
                        Continue to Payment
                        <i className="fas fa-arrow-right ms-2"></i>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Форма оплаты */}
              {activeStep === 1 && (
                <div className="payment-form" style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '15px',
                  padding: '25px',
                  color: 'white'
                }}>
                  <h3 className="mb-4 text-center">Payment Method</h3>
                  
                  {error && (
                    <div className="alert" style={{
                      backgroundColor: 'rgba(220, 53, 69, 0.7)',
                      color: 'white',
                      borderRadius: '10px'
                    }}>
                      {error}
                    </div>
                  )}

                  <div className="payment-methods mb-4">
                    <div className="payment-method-option" onClick={() => setPaymentMethod('PayPal')}>
                      <input
                        type="radio"
                        id="PayPal"
                        name="paymentMethod"
                        value="PayPal"
                        checked={paymentMethod === 'PayPal'}
                        onChange={handlePaymentMethodChange}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="PayPal" className={`payment-method-label ${paymentMethod === 'PayPal' ? 'active' : ''}`}>
                        <i className="fab fa-paypal me-2"></i>
                        PayPal
                      </label>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="order-summary" style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}>
                    <h4 className="mb-3">Order Summary</h4>
                    <div className="summary-item d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="summary-item d-flex justify-content-between mb-2">
                      <span>Shipping:</span>
                      <span>${calculateTotal() > 50 ? '0.00' : '5.99'}</span>
                    </div>
                    <div className="summary-item d-flex justify-content-between mb-2">
                      <span>Tax (8.5%):</span>
                      <span>${(calculateTotal() * 0.085).toFixed(2)}</span>
                    </div>
                    <div className="summary-item d-flex justify-content-between mb-2">
                      <span>Service Fee (5%):</span>
                      <span>${(calculateTotal() * 0.05).toFixed(2)}</span>
                    </div>
                    <hr style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                    <div className="summary-total d-flex justify-content-between fw-bold">
                      <span>Total:</span>
                      <span>${(
                        calculateTotal() + 
                        (calculateTotal() > 50 ? 0 : 5.99) + 
                        calculateTotal() * 0.085 + 
                        calculateTotal() * 0.05
                      ).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="gaming-form__button"
                      onClick={() => setActiveStep(0)}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Back
                    </button>

                    <button 
                      type="button"
                      className="gaming-form__button filled"
                      onClick={handlePlaceOrder}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          Place Order
                          <i className="fas fa-check ms-2"></i>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Подтверждение заказа */}
              {activeStep === 2 && (
                <div className="success-message text-center" style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '15px',
                  padding: '40px 25px',
                  color: 'white'
                }}>
                  <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                  <h3 className="mt-4 mb-3">Order Placed Successfully!</h3>
                  <p className="mb-4">Thank you for your order. You will receive a confirmation email shortly.</p>
                  <button
                    className="gaming-form__button filled"
                    onClick={() => history.push('/')}
                  >
                    <i className="fas fa-shopping-bag me-2"></i>
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* PayPal кнопки */}
          {activeStep === 1 && paymentMethod === 'PayPal' && (
            <div className="row justify-content-center mt-4">
              <div className="col-md-8">
                <div 
                  id="paypal-button-container" 
                  style={{ 
                    minHeight: '200px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '20px'
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
