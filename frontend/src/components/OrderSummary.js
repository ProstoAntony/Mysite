import React from 'react';

const OrderSummary = ({ cartItems, calculateTotal }) => {
  // Calculate subtotal
  const subtotal = calculateTotal();
  
  // Calculate shipping (free for orders over $50)
  const shipping = subtotal > 50 ? 0 : 5.99;
  
  // Calculate tax (8.5%)
  const tax = subtotal * 0.085;
  
  // Calculate total
  const total = subtotal + shipping + tax;
  
  return (
    <div className="order-summary card">
      <div className="card-header bg-dark text-white">
        <h4 className="mb-0">Order Summary</h4>
      </div>
      
      <div className="card-body">
        <div className="items-list mb-4">
          {cartItems.map(item => (
            <div key={item.id} className="item d-flex justify-content-between mb-2">
              <div>
                <span className="item-quantity me-2">{item.quantity}x</span>
                <span className="item-name">{item.name}</span>
              </div>
              <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <hr />
        
        <div className="price-details">
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
  );
};

export default OrderSummary;