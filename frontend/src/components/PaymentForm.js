import React, { useState } from 'react';

const PaymentForm = ({ onPaymentSubmit, onBack, loading, error }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (paymentMethod === 'credit_card') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        alert('Please fill in all card details');
        return;
      }
    }
    
    // Submit payment
    onPaymentSubmit(paymentMethod);
  };
  
  return (
    <div className="payment-form">
      <h3 className="mb-4">Payment Method</h3>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="radio"
              name="paymentMethod"
              id="creditCard"
              value="credit_card"
              checked={paymentMethod === 'credit_card'}
              onChange={() => setPaymentMethod('credit_card')}
            />
            <label className="form-check-label" htmlFor="creditCard">
              Credit / Debit Card
            </label>
          </div>
          
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="paymentMethod"
              id="paypal"
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={() => setPaymentMethod('paypal')}
            />
            <label className="form-check-label" htmlFor="paypal">
              PayPal
            </label>
          </div>
        </div>
        
        {paymentMethod === 'credit_card' && (
          <div className="card-details">
            <div className="mb-3">
              <label htmlFor="cardNumber" className="form-label">Card Number</label>
              <input
                type="text"
                className="form-control"
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength="19"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="cardName" className="form-label">Cardholder Name</label>
              <input
                type="text"
                className="form-control"
                id="cardName"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="expiryDate" className="form-label">Expiry Date (MM/YY)</label>
                <input
                  type="text"
                  className="form-control"
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  maxLength="5"
                />
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="cvv" className="form-label">CVV</label>
                <input
                  type="text"
                  className="form-control"
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength="4"
                />
              </div>
            </div>
          </div>
        )}
        
        {paymentMethod === 'paypal' && (
          <div className="paypal-info alert alert-info">
            <p>You will be redirected to PayPal to complete your payment after clicking "Place Order".</p>
          </div>
        )}
        
        <div className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onBack}
            disabled={loading}
          >
            Back
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;