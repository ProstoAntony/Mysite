import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="gaming-footer">
            <div className="gaming-footer__content">
                <div className="container-fluid">
                    <div className="row">
                        {/* Main Information */}
                        <div className="col-lg-4 mb-4">
                            <div className="gaming-footer__section">
                                <h3 className="gaming-footer__title">
                                    <i className="fas fa-gamepad me-2"></i>
                                    GAME SHOP
                                </h3>
                                <p className="gaming-footer__description">
                                    Your ultimate destination for digital gaming entertainment.
                                    Find the best deals on your favorite games.
                                </p>
                                <div className="gaming-footer__social">
                                    <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="gaming-footer__social-link">
                                        <i className="fab fa-discord"></i>
                                    </a>
                                    <a href="https://store.steampowered.com" target="_blank" rel="noopener noreferrer" className="gaming-footer__social-link">
                                        <i className="fab fa-steam"></i>
                                    </a>
                                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="gaming-footer__social-link">
                                        <i className="fab fa-twitter"></i>
                                    </a>
                                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="gaming-footer__social-link">
                                        <i className="fab fa-youtube"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="col-lg-2 col-md-4 mb-4">
                            <div className="gaming-footer__section">
                                <h4 className="gaming-footer__subtitle">Navigation</h4>
                                <ul className="gaming-footer__list">

                                    <li>
                                        <Link to="/shop">Store</Link>
                                    </li>
                                    
                                    <li>
                                        <Link to="/cart">Cart</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="col-lg-2 col-md-4 mb-4">
                            <div className="gaming-footer__section">
                                <h4 className="gaming-footer__subtitle">Categories</h4>
                                <ul className="gaming-footer__list">
                                    <li>
                                        <Link to="/products">All Games</Link>
                                    </li>
                                    
                                    
                                </ul>
                            </div>
                        </div>

                        {/* Support */}
                        <div className="col-lg-4 col-md-4 mb-4">
                            <div className="gaming-footer__section">
                                <h4 className="gaming-footer__subtitle">Support</h4>
                                <ul className="gaming-footer__list">
                                    <li style={{ color: '#ffffff' }}>
                                        <i className="fas fa-envelope me-2"></i>
                                        support@gameshop.com
                                    </li>
                                    <li style={{ color: '#ffffff' }}>
                                        <i className="fas fa-clock me-2"></i>
                                        24/7 Customer Support
                                    </li>
                                    <li>
                                        <Link to="/support" className="gaming-footer__support-button">
                                            <i className="fas fa-headset me-2"></i>
                                            Get Support
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="gaming-footer__bottom">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <p className="gaming-footer__copyright">
                                    © 2025 Game Shop. All rights reserved.
                                </p>
                            </div>
                            <div className="col-md-6">
                                <div className="gaming-footer__links">
                                    <Link to="/privacy">Privacy Policy</Link>
                                    <Link to="/terms">Terms of Service</Link>
                                    <Link to="/refund">Refund Policy</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer; 