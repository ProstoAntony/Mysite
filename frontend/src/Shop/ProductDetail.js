import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import useAxios from '../utils/useAxios';
import Gallery from './Gallery';
import '../styles/support-page.css';
import AuthContext from '../context/AuthContext';
import Toast from '../components/Toast';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart } = useCart();
  const api = useAxios();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { authTokens } = useContext(AuthContext);
  
  // Используем useRef для отслеживания, был ли уже выполнен запрос
  const dataFetchedRef = useRef(false);

  // Добавляем состояние для Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    // Если запрос уже был выполнен для текущего id, не делаем ничего
    if (dataFetchedRef.current === id) return;
    
    // Отмечаем, что запрос для текущего id начался
    dataFetchedRef.current = id;
    
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}/`);
        setProduct(response.data);
        
        // После получения продукта, загружаем связанные продукты из той же категории
        if (response.data.category) {
          const relatedResponse = await api.get(`/products/?category=${response.data.category.id}&exclude=${id}`);
          setRelatedProducts(relatedResponse.data.results.slice(0, 3)); // Берем только первые 3 связанных продукта
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]); // Удалили api из зависимостей

  // Исправляем проверку избранного
  useEffect(() => {
    const checkWishlist = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/wishlist/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens?.access}`,
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Полученные данные:', data); // Отладочный вывод
                
                // Проверяем, что data является массивом и ищем товар по id
                const isInList = Array.isArray(data) && 
                    data.some(item => item.product && item.product.id === parseInt(id));
                setIsInWishlist(isInList);
                console.log('Товар в избранном:', isInList);
            } else {
                console.error('Не удалось получить список избранного');
            }
        } catch (error) {
            console.error('Ошибка при проверке избранного:', error);
        }
    };

    if (authTokens?.access && id) {
        checkWishlist();
    }
  }, [id, authTokens]);

  // Исправляем функцию handleWishlist
  const handleWishlist = async () => {
    if (!authTokens?.access) {
        alert('Пожалуйста, войдите в систему, чтобы добавить товары в избранное');
        return;
    }

    try {
        if (isInWishlist) {
            // Получаем текущий список избранного
            const response = await fetch('http://127.0.0.1:8000/api/wishlist/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authTokens?.access}`,
                }
            });
            
            if (response.ok) {
                const wishlistData = await response.json();
                // Ищем элемент по product.id
                const wishlistItem = wishlistData.find(item => item.product && item.product.id === parseInt(id));
                
                if (wishlistItem) {
                    // Удаляем элемент по его id
                    const deleteResponse = await fetch(`http://127.0.0.1:8000/api/wishlist/${wishlistItem.id}/`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${authTokens?.access}`,
                        }
                    });
                    
                    if (deleteResponse.ok) {
                        setIsInWishlist(false);
                        console.log('Успешно удалено из избранного');
                    } else {
                        throw new Error('Ошибка при удалении из избранного');
                    }
                }
            }
        } else {
            // Добавляем в избранное
            const response = await fetch('http://127.0.0.1:8000/api/wishlist/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens?.access}`,
                },
                body: JSON.stringify({
                    product: parseInt(id)
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Ответ при добавлении:', data);
                setIsInWishlist(true);
                console.log('Успешно добавлено в избранное');
            } else {
                const errorData = await response.json();
                console.error('Ошибка добавления в избранное:', errorData);
                throw new Error('Ошибка при добавлении в избранное');
            }
        }
    } catch (error) {
        console.error('Ошибка обновления избранного:', error);
        alert('Произошла ошибка при обновлении избранного');
    }
  };

  // Обновляем функцию handleAddToCart
  const handleAddToCart = () => {
    if (product) {
      try {
        addToCart(product);
        showToast(`${product.name} added to cart`, 'success');
      } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Failed to add item to cart', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="gaming-form d-flex justify-content-center align-items-center" style={{ 
        backgroundImage: 'url("/images/Background 12.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh'
      }}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="gaming-form d-flex justify-content-center align-items-center" style={{ 
        backgroundImage: 'url("/images/Background 12.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh'
      }}>
        <div className="gaming-form__container" style={{ maxWidth: '600px', padding: '2rem' }}>
          <div className="alert" style={{ backgroundColor: 'rgba(220, 53, 69, 0.7)', color: 'white' }}>
            Product not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gaming-form" style={{ 
      backgroundImage: 'url("/images/Background 12.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div className="container-fluid py-5">
        <div className="gaming-form__container" style={{ 
          padding: '2.5rem', 
          maxWidth: '1600px',  // Увеличиваем максимальную ширину
          margin: '0 auto' 
        }}>
          {/* Навигация - обновленная версия */}
          <nav className="mb-4">
            <ol className="breadcrumb" style={{ 
              backgroundColor: 'rgba(13, 17, 23, 0.7)',
              padding: '15px 20px',
              borderRadius: '12px',
              margin: 0,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <li className="breadcrumb-item">
                <Link 
                  to="/" 
                  style={{ 
                    color: '#64748b',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#94a3b8'}
                  onMouseOut={(e) => e.target.style.color = '#64748b'}
                >
                  <i className="fas fa-home"></i>
                  <span>Store</span>
                </Link>
              </li>
              {product.category && (
                <li className="breadcrumb-item">
                  <Link 
                    to={`/category/${product.category.id}`}
                    style={{ 
                      color: '#64748b',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.color = '#94a3b8'}
                    onMouseOut={(e) => e.target.style.color = '#64748b'}
                  >
                    {product.category.title}
                  </Link>
                </li>
              )}
              <li 
                className="breadcrumb-item active" 
                style={{ 
                  color: '#e2e8f0',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  maxWidth: '200px'
                }}
                aria-current="page"
              >
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="row">
            {/* Галерея */}
            <div className="col-lg-7 mb-4">
              <div style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '15px',
                padding: '25px',
                height: '100%'
              }}>
                {id ? (
                  <img 
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '10px',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div className="d-flex justify-content-center align-items-center" 
                       style={{ height: "500px", backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '10px' }}>
                    <div className="text-center text-light">
                      <i className="fas fa-image fa-4x mb-3"></i>
                      <p>Изображение недоступно</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Информация о продукте - уменьшаем ширину */}
            <div className="col-lg-5">  {/* Изменили с col-lg-6 на col-lg-5 */}
              <div style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '15px',
                padding: '30px',
                height: '100%',
                color: 'white'
              }}>
                <h2 className="mb-4">{product.name}</h2>

                {/* Бейджи */}
                <div className="mb-4">
                  {product.category && (
                    <span className="badge me-2" style={{ backgroundColor: 'rgba(108, 117, 125, 0.8)' }}>
                      {product.category.title}
                    </span>
                  )}
                  {product.status === "Published" && (
                    <span className="badge me-2" style={{ backgroundColor: 'rgba(40, 167, 69, 0.8)' }}>
                      Available
                    </span>
                  )}
                  {product.featured && (
                    <span className="badge" style={{ backgroundColor: 'rgba(255, 193, 7, 0.8)' }}>
                      Featured
                    </span>
                  )}
                </div>

                {/* Цена */}
                <div className="mb-4">
                  <h3 style={{ color: '#f0d000', marginBottom: '0.5rem' }}>${product.price}</h3>
                  {product.regular_price && product.regular_price > product.price && (
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ textDecoration: 'line-through', color: '#dc3545' }}>
                        ${product.regular_price}
                      </span>
                      <span className="badge" style={{ backgroundColor: 'rgba(220, 53, 69, 0.8)' }}>
                        {Math.round((1 - product.price / product.regular_price) * 100)}% OFF
                      </span>
                    </div>
                  )}
                </div>

                {/* Описание */}
                <div className="mb-4">
                  <h5 className="border-bottom pb-2" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    Description
                  </h5>
                  <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                       dangerouslySetInnerHTML={{ __html: product.description || 'No description available' }}>
                  </div>
                </div>

                {/* Информация о наличии */}
                <div className="mb-4">
                  <h5 className="border-bottom pb-2" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    Game Details
                  </h5>
                  <div className="row">
                    <div className="col-6">
                      <p><strong>Status:</strong> {product.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
                      <p><strong>Available:</strong> {product.stock} copies</p>
                    </div>
                    <div className="col-6">
                      {product.vendor && <p><strong>Publisher:</strong> {product.vendor.name || product.vendor}</p>}
                      <p><strong>Release Date:</strong> {new Date(product.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Кнопка добавления в корзину */}
                <div className="d-flex gap-2 mb-3">
                  <button
                    className="gaming-form__button"
                    onClick={handleWishlist}
                    style={{
                      backgroundColor: isInWishlist ? 'rgba(220, 53, 69, 0.6)' : 'rgba(71, 85, 105, 0.6)',
                    }}
                  >
                    <i className={`fas fa-heart ${isInWishlist ? 'text-danger' : ''}`}></i>
                  </button>
                  <button
                    className="gaming-form__button filled flex-grow-1"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                  >
                    <i className="fas fa-shopping-cart me-2"></i>
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Связанные продукты - упрощенная версия */}
          {relatedProducts.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-4 text-light">Related Games</h3>
              <div className="row g-4">
                {relatedProducts.map(relatedProduct => (
                  <div className="col-lg-4 col-md-6" key={relatedProduct.id}>
                    <Link to={`/product/${relatedProduct.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        height: '100%',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}>
                        <div style={{ 
                          height: '250px',
                          position: 'relative' 
                        }}>
                          <img 
                            src={relatedProduct.image || 'https://via.placeholder.com/300x200'}
                            alt={relatedProduct.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          {relatedProduct.regular_price && relatedProduct.regular_price > relatedProduct.price && (
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              backgroundColor: 'rgba(220, 53, 69, 0.8)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              color: 'white',
                              fontWeight: 'bold'
                            }}>
                              {Math.round((1 - relatedProduct.price / relatedProduct.regular_price) * 100)}% OFF
                            </div>
                          )}
                        </div>
                        <div style={{ 
                          padding: '1rem',
                          color: 'white',
                          textAlign: 'center'
                        }}>
                          <h5 style={{ 
                            fontSize: '1.1rem',
                            margin: '0',
                            color: 'white'
                          }}>{relatedProduct.name}</h5>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Добавляем Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProductDetail;