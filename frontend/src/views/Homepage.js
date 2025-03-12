import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ProductList from '../Shop/ProductList';
import ProductListGuest from '../Shop/ProductListGuest';
import { useCart } from '../context/CartContext';

function HomePage() {
    const { user } = useContext(AuthContext);
    const { cartItems } = useCart();

    return (
        <div className="container-fluid" style={{ paddingTop: "100px" }}>
            <div className="row">
                <nav className="col-md-2 d-none d-md-block bg-light sidebar mt-4">
                    <div className="sidebar-sticky">
                        <ul className="nav flex-column">
                            <li className="nav-item">
                                <Link className="nav-link" to="/">
                                    <i className="fas fa-home me-2"></i>
                                    Home
                                </Link>
                            </li>
                            {user ? (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/dashboard">
                                            <i className="fas fa-user me-2"></i>
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/orders">
                                            <i className="fas fa-shopping-bag me-2"></i>
                                            Orders
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">
                                        <i className="fas fa-sign-in-alt me-2"></i>
                                        Login
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </nav>

                <main role="main" className="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
                    <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3">
                        <h1 className="h2">Welcome to Our Shop</h1>
                    </div>

                    {user ? <ProductList /> : <ProductListGuest />}
                </main>
            </div>
        </div>
    );
}

export default HomePage;