import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ProductList from '../Shop/ProductList';
import ProductListGuest from '../Shop/ProductListGuest';
import { useCart } from '../context/CartContext';
import useAxios from '../utils/useAxios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../styles/swiper.css';

function HomePage() {
    const { user } = useContext(AuthContext);
    const { cartItems } = useCart();
    const [discountedProducts, setDiscountedProducts] = useState([]);
    const api = useAxios();

    useEffect(() => {
        fetchDiscountedProducts();
    }, []);

    const fetchDiscountedProducts = async () => {
        try {
            // Try to fetch products without authentication first
            try {
                const response = await fetch('http://127.0.0.1:8000/api/products/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // Filter products with discounts (where price < regular_price)
                    const discounted = (data.results || []).filter(
                        product => product.regular_price && product.price < product.regular_price
                    ).slice(0, 3); // Get top 3 discounted products
                    
                    if (discounted.length > 0) {
                        setDiscountedProducts(discounted);
                        return;
                    }
                }
            } catch (publicApiError) {
                console.log('Public API error:', publicApiError);
            }
            
            // If we're here, either the public API failed or there were no discounted products
            // Only try the authenticated endpoint if user is logged in
            if (user) {
                const response = await api.get('/products/discounted/');
                setDiscountedProducts(response.data.results || []);
            } else {
                // For guest users, set empty array if public API failed
                setDiscountedProducts([]);
            }
        } catch (error) {
            console.error('Error fetching discounted products:', error);
            setDiscountedProducts([]);
        }
    };

    // Функция для создания правильной ссылки в зависимости от статуса авторизации
    const getProductLink = (productId) => {
        return user ? `/product/${productId}` : '/login';
    };

    // Функция для отображения кнопки действия в зависимости от статуса авторизации
    const getActionButton = (productId) => {
        if (user) {
            return (
                <Link to={`/product/${productId}`} className="btn btn-primary btn-sm mt-2">
                    View Details
                </Link>
            );
        } else {
            return (
                <Link to="/login" className="btn btn-primary btn-sm mt-2">
                    Login to Buy
                </Link>
            );
        }
    };

    return (
        <div style={{ 
            width: '100%',
            minHeight: '100vh',
            backgroundImage: 'url("/images/Background 12.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            padding: '0' // Убираем отступ с 10px до 0
        }}>
            <div className="row" style={{ margin: 0 }}>
                {/* Левый баннер - убираем все отступы */}
                <div className="col-md-8" style={{ 
                    padding: '0',
                    height: '700px'
                }}>
                    {discountedProducts.length > 0 && (
                        <Swiper
                            modules={[Autoplay, Navigation, Pagination]}
                            spaceBetween={0}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{
                                delay: 3500,
                                disableOnInteraction: false,
                            }}
                            style={{
                                height: '100%',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '12px',
                            }}
                        >
                            {discountedProducts.map((product) => (
                                <SwiperSlide key={product.id}>
                                    <div style={{
                                        position: 'relative',
                                        height: '100%',
                                        width: '100%',
                                    }}>
                                        <img 
                                            src={product.image}
                                            style={{ 
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "fill",
                                                objectPosition: "center"
                                            }}
                                            alt={product.name}
                                        />
                                        <div className="banner-info" style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '12px',
                                            background: 'rgba(0,0,0,0.5)',
                                            backdropFilter: 'blur(2px)'
                                        }}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h3 className="mb-0" style={{
                                                    color: 'white',
                                                    textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                                }}>{product.name}</h3>
                                                <div className="discount-badge badge bg-success" style={{
                                                    fontSize: '1.2em',
                                                    padding: '8px 15px'
                                                }}>
                                                    -{Math.round(((product.regular_price - product.price) / product.regular_price) * 100)}% OFF
                                                </div>
                                            </div>
                                            
                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                <div>
                                                    <h4 className="mb-0 text-success fw-bold">${product.price}</h4>
                                                    {product.regular_price && (
                                                        <small className="text-danger text-decoration-line-through">
                                                            ${product.regular_price}
                                                        </small>
                                                    )}
                                                </div>
                                                <div>
                                                    {user ? (
                                                        <Link to={`/product/${product.id}`} className="btn btn-success">
                                                            <i className="fas fa-info-circle me-1"></i> View Details
                                                        </Link>
                                                    ) : (
                                                        <Link to="/login" className="btn btn-success">
                                                            <i className="fas fa-sign-in-alt me-1"></i> Login to Buy
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </div>
                
                {/* Правая колонка - убираем отступы и увеличиваем ширину */}
                <div className="col-md-4" style={{ 
                    padding: '0' // Убираем отступы
                }}>
                    <div style={{ 
                        height: '700px',
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '5px', // Уменьшаем расстояние между баннерами с 10px до 5px
                        width: '100%', // Увеличиваем ширину с 80% до 100%
                        margin: '0' // Убираем центрирование
                    }}>
                        {/* Верхний правый баннер */}
                        {discountedProducts.length > 1 && (
                            <div style={{
                                position: 'relative',
                                flex: '1.1',
                                backgroundColor: 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    padding: '0px', // Убираем отступ для полного заполнения
                                    height: '100%'
                                }}>
                                    <img 
                                        src={discountedProducts[1].image}
                                        style={{ 
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "fill",
                                            objectPosition: "center"
                                        }}
                                        alt={discountedProducts[1].name}
                                    />
                                </div>
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '12px',
                                    background: 'rgba(0,0,0,0.5)',
                                    backdropFilter: 'blur(2px)',
                                    color: 'white'
                                }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0" style={{
                                            color: 'white',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                        }}>{discountedProducts[1].name}</h5>
                                        <span className="badge bg-success">
                                            -{Math.round(((discountedProducts[1].regular_price - discountedProducts[1].price) / discountedProducts[1].regular_price) * 100)}% OFF
                                        </span>
                                    </div>
                                    
                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                        <div>
                                            <h6 className="mb-0 text-success fw-bold">${discountedProducts[1].price}</h6>
                                            {discountedProducts[1].regular_price && (
                                                <small className="text-danger text-decoration-line-through">
                                                    ${discountedProducts[1].regular_price}
                                                </small>
                                            )}
                                        </div>
                                        <div>
                                            {user ? (
                                                <Link to={`/product/${discountedProducts[1].id}`} className="btn btn-sm btn-success">
                                                    <i className="fas fa-info-circle me-1"></i> Details
                                                </Link>
                                            ) : (
                                                <Link to="/login" className="btn btn-sm btn-success">
                                                    <i className="fas fa-sign-in-alt me-1"></i> Login
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Нижний правый баннер */}
                        {discountedProducts.length > 2 && (
                            <div style={{
                                position: 'relative',
                                flex: '0.9',
                                backgroundColor: 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    padding: '0px', // Убираем отступ для полного заполнения
                                    height: '100%'
                                }}>
                                    <img 
                                        src={discountedProducts[2].image}
                                        style={{ 
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "fill",
                                            objectPosition: "center"
                                        }}
                                        alt={discountedProducts[2].name}
                                    />
                                </div>
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '12px',
                                    background: 'rgba(0,0,0,0.5)',
                                    backdropFilter: 'blur(2px)',
                                    color: 'white'
                                }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0" style={{
                                            color: 'white',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                        }}>{discountedProducts[2].name}</h5>
                                        <span className="badge bg-success">
                                            -{Math.round(((discountedProducts[2].regular_price - discountedProducts[2].price) / discountedProducts[2].regular_price) * 100)}% OFF
                                        </span>
                                    </div>
                                    
                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                        <div>
                                            <h6 className="mb-0 text-success fw-bold">${discountedProducts[2].price}</h6>
                                            {discountedProducts[2].regular_price && (
                                                <small className="text-danger text-decoration-line-through">
                                                    ${discountedProducts[2].regular_price}
                                                </small>
                                            )}
                                        </div>
                                        <div>
                                            {user ? (
                                                <Link to={`/product/${discountedProducts[2].id}`} className="btn btn-sm btn-success">
                                                    <i className="fas fa-info-circle me-1"></i> Details
                                                </Link>
                                            ) : (
                                                <Link to="/login" className="btn btn-sm btn-success">
                                                    <i className="fas fa-sign-in-alt me-1"></i> Login
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;