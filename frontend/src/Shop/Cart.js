import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const getProductImage = (item) => {
    try {
      if (item.image) {
        return item.image;
      }
      return '/images/default-product.png';
    } catch (error) {
      return '/images/default-product.png';
    }
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
    showToast('Товар успешно удален из корзины', 'info');
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      showToast('Количество не может быть меньше 1', 'error');
      return;
    }
    if (newQuantity > 99) {
      showToast('Максимальное количество - 99 штук', 'error');
      return;
    }
    updateQuantity(itemId, newQuantity);
    showToast('Количество товара обновлено', 'success');
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Calculate shipping cost (free for orders over $50)
  const calculateShipping = () => {
    const subtotal = calculateTotal();
    return subtotal > 50 ? 0 : 5.99;
  };

  // Calculate tax (8.5%)
  const calculateTax = () => {
    return calculateTotal() * 0.085;
  };

  // Calculate final total
  const calculateFinalTotal = () => {
    return calculateTotal() + calculateShipping() + calculateTax();
  };

  return (
    <div className="background-style" style={{ minHeight: "100vh" }}>
      <div className="container" style={{ paddingTop: "100px" }}>
        <h2 className="mb-4">Shopping Cart</h2>
        {cartItems.length === 0 ? (
          <div className="alert alert-info">
            Ваша корзина пуста. <Link to="/products">Продолжить покупки</Link>
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-lg-8">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img 
                                src={getProductImage(item)}
                                alt={item.name}
                                style={{ 
                                  width: "50px", 
                                  height: "50px",
                                  objectFit: "cover",
                                  marginRight: "10px",
                                  borderRadius: "4px"
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/images/default-product.png";
                                }}
                              />
                              {item.name}
                            </div>
                          </td>
                          <td>${item.price}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                              className="form-control"
                              style={{ width: "80px" }}
                            />
                          </td>
                          <td>${(item.price * item.quantity).toFixed(2)}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveFromCart(item.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="col-lg-4">
                <div className="card">
                  <div className="card-header bg-dark text-white">
                    <h4 className="mb-0">Order Summary</h4>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    
                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping:</span>
                      <span>{calculateShipping() === 0 ? 'Free' : `$${calculateShipping().toFixed(2)}`}</span>
                    </div>
                    
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tax (8.5%):</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                    
                    <hr />
                    
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total:</span>
                      <span>${calculateFinalTotal().toFixed(2)}</span>
                    </div>
                    
                    <div className="d-grid gap-2 mt-3">
                      <Link to="/checkout" className="btn btn-primary">
                        Proceed to Checkout
                      </Link>
                      <Link to="/products" className="btn btn-outline-secondary">
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
                
                {calculateTotal() < 50 && (
                  <div className="alert alert-info mt-3">
                    <i className="fas fa-info-circle me-2"></i>
                    Add ${(50 - calculateTotal()).toFixed(2)} more to your cart for free shipping!
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Добавляем компонент Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </div>
  );
};

export default Cart;
