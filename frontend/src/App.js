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

import Wishlist from './Shop/Wishlist'
import Address from './Shop/Address'
import Notifications from './Shop/Notifications'
import Profile from './views/Profile';
import ProductDetail from './Shop/ProductDetail';

import Checkout from './views/Checkout';
import Purchases from './views/Purchases';
import SupportPage from './views/SupportPage';
import SupportRequestsPage from './views/SupportRequestsPage';
import Footer from './components/Footer';


function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <GuestProvider>
            <AddressProvider>
              <div className="app-container d-flex flex-column min-vh-100">
                <Navbar />
                <main className="flex-grow-1">
                  <Switch>
                    <Route exact path="/homepage" component={Homepage} />
                    <PrivateRoutes component={Dashboard} path="/dashboard" exact />
                    <Route component={Loginpage} path="/login" />
                    <Route component={Registerpage} path="/register" exact />
                    <PrivateRoutes exact path="/products" component={ProductList} />
                    <PrivateRoutes path="/cart" component={Cart} />
                    
                    <PrivateRoutes path="/wishlist" component={Wishlist} />
                    <PrivateRoutes path="/address" component={Address} />
                    <PrivateRoutes path="/profile" component={Profile} />
                    <PrivateRoutes path="/notifications" component={Notifications} />
                    
                    <PrivateRoutes exact path="/checkout" component={Checkout} />
                    
                    <PrivateRoutes exact path="/purchases" component={Purchases} />
                    
                    <Route path="/product/:id" component={ProductDetail} />
                    <Route path="/support" component={SupportPage} />
                    <Route path="/dashboard/support" component={SupportRequestsPage} />
                    <Route path="*" component={Homepage} />
                  </Switch>
                </main>
                <Footer />
              </div>
            </AddressProvider>
          </GuestProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App


