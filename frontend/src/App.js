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


