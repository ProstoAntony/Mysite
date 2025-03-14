import React from 'react'

import {BrowserRouter as Router, Route, Switch} from "react-router-dom"
import PrivateRoutes from "./utils/PrivateRoutes"
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { AddressProvider } from './context/AddressContext'
import { GuestProvider } from './context/GuestContext';

import Homepage from './views/Homepage'
import Registerpage from './views/Registerpage'
import Loginpage from './views/Loginpage'
import Dashboard from './views/Dashboard'
import Navbar from './views/Navbar'
import ProductList from './Shop/ProductList';
import Cart from './Shop/Cart';
import Order from './Shop/Order';
import Wishlist from './Shop/Wishlist'
import Address from './Shop/Address'
import Notifications from './Shop/Notifications'
import Profile from './views/Profile';
import ProductDetail from './Shop/ProductDetail';
// Add these imports at the top of your file
import Checkout from './views/Checkout';
import Purchases from './views/Purchases';
import OrderDetail from './views/OrderDetail';
import OrderSuccess from './views/OrderSuccess';
import OrderCancel from './views/OrderCancel';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <GuestProvider>
            <AddressProvider>
              <Navbar />
              <Switch>
                <Route exact path="/" component={Homepage} />
                <PrivateRoutes component={Dashboard} path="/dashboard" exact />
                <Route component={Loginpage} path="/login" />
                <Route component={Registerpage} path="/register" exact />
                <PrivateRoutes exact path="/products" component={ProductList} />
                <PrivateRoutes path="/cart" component={Cart} />
                <PrivateRoutes path="/orders" component={Order} />
                <PrivateRoutes path="/wishlist" component={Wishlist} />
                <PrivateRoutes path="/address" component={Address} />
                <PrivateRoutes path="/profile" component={Profile} />
                <PrivateRoutes path="/notifications" component={Notifications} />
                
                <PrivateRoutes exact path="/checkout" component={Checkout} />
                <PrivateRoutes exact path="/checkout/success" component={OrderSuccess} />
                <PrivateRoutes exact path="/checkout/cancel" component={OrderCancel} />
                <PrivateRoutes exact path="/purchases" component={Purchases} />
                <PrivateRoutes exact path="/order/:id" component={OrderDetail} />
                <Route path="/product/:id" component={ProductDetail} />
                <Route path="*" component={Homepage} />
              </Switch>
            </AddressProvider>
          </GuestProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App


