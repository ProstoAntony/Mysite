import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

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

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="container" style={{ paddingTop: "100px" }}>
      <h2 className="mb-4">Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <div className="alert alert-info">
          Your cart is empty. <Link to="/products">Continue shopping</Link>
        </div>
      ) : (
        <>
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
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        className="form-control"
                        style={{ width: "80px" }}
                      />
                    </td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                  <td><strong>${calculateTotal().toFixed(2)}</strong></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <Link to="/products" className="btn btn-secondary me-2">
              Continue Shopping
            </Link>
            <Link to="/checkout" className="btn btn-primary">
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
