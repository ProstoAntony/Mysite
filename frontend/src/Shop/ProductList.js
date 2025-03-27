import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/support-page.css'; // Используем те же стили
import Toast from '../components/Toast';

const ProductList = () => {
  const { authTokens } = useContext(AuthContext);
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [toast, setToast] = useState(null);

  // Загрузка категорий
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/categories/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authTokens?.access}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Raw categories data:', data); // Для отладки

        // Проверяем структуру данных и устанавливаем категории
        const categoriesArray = data.results || [];
        setCategories(categoriesArray);
        setLoading(false);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError(err.message);
        setCategories([]);
        setLoading(false);
      }
    };

    fetchCategories();
  }, [authTokens]);

  // Загрузка продуктов с учетом выбранной категории
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = 'http://127.0.0.1:8000/api/products/';
        if (selectedCategory) {
          url += `?category=${selectedCategory}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authTokens?.access}`,
          },
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setProducts(data.results);
        setLoading(false);
      } catch (err) {
        console.error('Error loading products:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (authTokens?.access) {
      fetchProducts();
    }
  }, [authTokens, selectedCategory]);

  // Обновляем функцию получения списка избранного
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/wishlist/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authTokens?.access}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          // Извлекаем results из ответа
          const wishlistData = data.results || [];
          setWishlistItems(wishlistData);
          console.log('Wishlist data:', wishlistData);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlistItems([]);
      }
    };

    if (authTokens?.access) {
      fetchWishlist();
    }
  }, [authTokens]);

  if (loading) return (
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

  if (error) return (
    <div className="gaming-form d-flex align-center justify-center" style={{ 
      backgroundImage: 'url("/images/Background 12.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      padding: '40px 0'
    }}>
      <div className="gaming-form__container" style={{ maxWidth: '800px', width: '90%', padding: '2.5rem' }}>
        <h1 className="gaming-form__title">Error</h1>
        <div className="alert" style={{ backgroundColor: 'rgba(220, 53, 69, 0.7)', borderRadius: '5px', padding: '15px' }}>
          <p className="mb-0">Error: {error}</p>
        </div>
      </div>
    </div>
  );

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleAddToCart = (product) => {
    try {
      addToCart(product);
      showToast(`${product.name} added to cart`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add item to cart', 'error');
    }
  };

  // Функция для добавления/удаления из избранного
  const handleWishlist = async (product) => {
    if (!authTokens?.access) {
        alert('Please login to add items to wishlist');
        return;
    }

    try {
        const isInWishlist = Array.isArray(wishlistItems) && 
            wishlistItems.some(item => item.product && item.product.id === product.id);
        
        if (isInWishlist) {
            const wishlistItem = wishlistItems.find(item => item.product.id === product.id);
            console.log('Removing from wishlist:', wishlistItem.id);
            
            const response = await fetch(`http://127.0.0.1:8000/api/wishlist/${wishlistItem.id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authTokens?.access}`,
                },
            });

            if (response.ok) {
                setWishlistItems(prev => prev.filter(item => item.product.id !== product.id));
                console.log('Successfully removed from wishlist');
            }
        } else {
            console.log('Adding to wishlist:', product.id);
            
            const response = await fetch('http://127.0.0.1:8000/api/wishlist/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens?.access}`,
                },
                body: JSON.stringify({
                    product: product.id
                }),
            });

            if (response.ok) {
                const newItem = await response.json();
                console.log('New wishlist item:', newItem);
                // Добавляем новый элемент в состояние
                setWishlistItems(prev => [...prev, { ...newItem, product }]);
                console.log('Successfully added to wishlist');
            } else {
                const errorData = await response.json();
                console.error('Error adding to wishlist:', errorData);
            }
        }
    } catch (error) {
        console.error('Error updating wishlist:', error);
    }
  };

  return (
    <div className="gaming-form" style={{ 
      backgroundImage: 'url("/images/Background 12.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div className="container-fluid py-5">
        <div className="row">
          {/* Боковой фильтр категорий */}
          <div className="col-lg-3">
            <div className="gaming-form__container mb-4" style={{ 
              padding: '2rem',
              minHeight: '600px',
              height: '100%'
            }}>
              <h3 className="gaming-form__title h4 mb-4">Categories</h3>
              <div className="category-list">
                {loading ? (
                  <div>Loading categories...</div>
                ) : error ? (
                  <div>Error: {error}</div>
                ) : (
                  <>
                    <div 
                      className={`category-item ${!selectedCategory ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(null)}
                      style={{
                        cursor: 'pointer',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        backgroundColor: !selectedCategory ? 'rgba(71, 85, 105, 0.8)' : 'rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <i className="fas fa-gamepad me-3" style={{ fontSize: '1.2rem' }}></i>
                        <span style={{ fontSize: '1.1rem' }}>All Games</span>
                      </div>
                    </div>

                    {categories.map(category => (
                      <div 
                        key={category.id}
                        className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category.id)}
                        style={{
                          cursor: 'pointer',
                          padding: '15px',
                          borderRadius: '8px',
                          marginBottom: '15px',
                          backgroundColor: selectedCategory === category.id ? 'rgba(71, 85, 105, 0.8)' : 'rgba(0, 0, 0, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div className="d-flex align-items-center">
                          {category.image && (
                            <img 
                              src={category.image}
                              alt={category.title}
                              style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '6px',
                                marginRight: '15px',
                                objectFit: 'cover'
                              }}
                            />
                          )}
                          <div>
                            <div className="fw-bold" style={{ fontSize: '1.1rem' }}>{category.title}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Основной контент с продуктами */}
          <div className="col-lg-9">
            <div className="gaming-form__container" style={{ 
              padding: '3rem',
              minHeight: '1800px',
              height: '100%',
              maxWidth: '1800px',
              margin: '0 auto'
            }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h1 className="gaming-form__title mb-2">
                    {selectedCategory 
                      ? categories.find(c => c.id === selectedCategory)?.title || 'Games'
                      : 'All Games'
                    }
                  </h1>
                  <p className="gaming-form__subtitle mb-0">
                    {products.length} games available
                  </p>
                </div>
              </div>

              <div className="row g-4">
                {products.map(product => (
                  <div className="col-lg-4 col-md-6 mb-4" key={product.id}>
                    <div style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(5px)',
                      borderRadius: '15px',
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    }}>
                      {/* Изображение */}
                      <div style={{ 
                        height: "280px", 
                        overflow: "hidden",
                        position: 'relative'
                      }}>
                        {product.image ? (
                          <img 
                            src={product.image}
                            style={{ 
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.3s ease"
                            }}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                            }}
                          />
                        ) : (
                          <img 
                            src="https://via.placeholder.com/300x300?text=No+Image"
                            style={{ 
                              width: "100%",
                              height: "100%",
                              objectFit: "cover"
                            }}
                            alt="No image available"
                          />
                        )}
                        
                        {/* Бейдж категории */}
                        {product.category && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            color: 'white',
                            fontSize: '0.8rem'
                          }}>
                            {product.category.title}
                          </div>
                        )}
                      </div>

                      {/* Информация о продукте */}
                      <div style={{ 
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        color: 'white'
                      }}>
                        {/* Название */}
                        <h5 className="mb-3" style={{ 
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          marginBottom: '0.5rem'
                        }}>
                          {product.name}
                        </h5>

                        {/* Цена и кнопки */}
                        <div className="mt-auto d-flex justify-content-between align-items-center">
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold" style={{ 
                                color: '#f0d000',
                                fontSize: '1.2rem'
                              }}>
                                ${product.price}
                              </span>
                              {product.regular_price && product.regular_price > product.price && (
                                <span style={{ 
                                  color: '#dc3545',
                                  textDecoration: 'line-through',
                                  fontSize: '0.9rem'
                                }}>
                                  ${product.regular_price}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="d-flex gap-2">
                            <button 
                              className="gaming-form__button"
                              style={{ 
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.9rem',
                                backgroundColor: 'rgba(71, 85, 105, 0.6)',
                                border: 'none'
                              }}
                              onClick={() => handleWishlist(product)}
                            >
                              <i className={`fas fa-heart ${
                                Array.isArray(wishlistItems) && 
                                wishlistItems.some(item => 
                                    item.product && item.product.id === product.id
                                ) ? 'text-danger' : ''
                              }`}></i>
                            </button>
                            <Link 
                              to={`/product/${product.id}`} 
                              className="gaming-form__button"
                              style={{ 
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.9rem',
                                backgroundColor: 'rgba(71, 85, 105, 0.6)',
                                border: 'none'
                              }}
                            >
                              <i className="fas fa-info-circle"></i>
                            </Link>
                            <button 
                              className="gaming-form__button filled"
                              style={{ 
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.9rem',
                                backgroundColor: product.stock > 0 ? 'rgba(59, 130, 246, 0.6)' : 'rgba(156, 163, 175, 0.6)',
                                border: 'none'
                              }}
                              disabled={product.stock <= 0}
                              onClick={() => handleAddToCart(product)}
                            >
                              <i className="fas fa-shopping-cart"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default ProductList;