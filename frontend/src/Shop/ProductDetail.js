import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import useAxios from '../utils/useAxios';
import Gallery from './Gallery';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart } = useCart();
  const api = useAxios();
  
  // Используем useRef для отслеживания, был ли уже выполнен запрос
  const dataFetchedRef = useRef(false);

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

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      alert(`${product.name} добавлен в корзину`);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pb-5" key={id}>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          {product.category && (
            <li className="breadcrumb-item">
              <Link to={`/category/${product.category.id}`}>{product.category.title}</Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="row">
        {/* Галерея изображений */}
        <div className="col-md-6 mb-4">
          {id ? (
            <Gallery productId={id} />
          ) : (
            <div className="placeholder-image d-flex justify-content-center align-items-center bg-light" style={{ height: "400px" }}>
              <div className="text-center">
                <i className="fas fa-image fa-4x text-muted mb-3"></i>
                <p className="text-muted">Изображение недоступно</p>
              </div>
            </div>
          )}
        </div>

        {/* Информация о продукте */}
        <div className="col-md-6">
          <h2 className="mb-3">{product.name}</h2>
          
          {/* Категория и статус */}
          <div className="mb-3">
            {product.category && (
              <span className="badge bg-secondary me-2">{product.category.title}</span>
            )}
            {product.status === "Published" && (
              <span className="badge bg-success">Available</span>
            )}
            {product.stock <= 0 && (
              <span className="badge bg-danger ms-2">Out of Stock</span>
            )}
            {product.featured && (
              <span className="badge bg-warning ms-2">Featured</span>
            )}
          </div>
          
          {/* Цена */}
          <div className="price-container mb-4">
            <h3 className="text-primary mb-0">${product.price}</h3>
            {product.regular_price && product.regular_price > product.price && (
              <div>
                <span className="text-decoration-line-through text-muted me-2">
                  ${product.regular_price}
                </span>
                <span className="badge bg-danger">
                  {Math.round((1 - product.price / product.regular_price) * 100)}% OFF
                </span>
              </div>
            )}
          </div>
          
          {/* Описание */}
          <div className="description mb-4">
            <h5>Description</h5>
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description }}></div>
            ) : (
              <p className="text-muted">No description available</p>
            )}
          </div>
          
          {/* Информация о наличии */}
          <div className="stock-info mb-4">
            <h5>Availability</h5>
            <p>
              <strong>In Stock:</strong> {product.stock > 0 ? `${product.stock} items` : 'No'}
            </p>
            {product.vendor && (
              <p><strong>Vendor:</strong> {product.vendor.name || product.vendor}</p>
            )}
            {product.date && (
              <p><strong>Added:</strong> {new Date(product.date).toLocaleDateString()}</p>
            )}
          </div>
          
          {/* Варианты продукта, если есть */}
          {product.variants && product.variants.length > 0 && (
            <div className="variants mb-4">
              <h5>Available Variants</h5>
              <div className="row">
                {product.variants.map(variant => (
                  <div className="col-md-6 mb-2" key={variant.id}>
                    <div className="card">
                      <div className="card-body">
                        <h6>{variant.name}</h6>
                        <p className="mb-0">${variant.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Кнопка добавления в корзину */}
          <button
            className="btn btn-success btn-lg w-100"
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
          >
            <i className="fas fa-shopping-cart me-2"></i>
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      {/* Связанные продукты */}
      {relatedProducts.length > 0 && (
        <div className="related-products mt-5">
          <h3 className="mb-4">Related Products</h3>
          <div className="row">
            {relatedProducts.map(relatedProduct => (
              <div className="col-md-4 mb-4" key={relatedProduct.id}>
                <div className="card h-100 product-card">
                  <div className="card-img-container" style={{ 
                    height: "200px", 
                    overflow: "hidden",
                    borderTopLeftRadius: "inherit",
                    borderTopRightRadius: "inherit",
                    position: "relative"
                  }}>
                    {relatedProduct.image ? (
                      <img 
                        src={relatedProduct.image}
                        style={{ 
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                        alt={relatedProduct.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="d-flex justify-content-center align-items-center bg-light h-100">
                        <div className="text-center">
                          <i className="fas fa-image fa-3x text-muted"></i>
                          <p className="text-muted mt-2">No image</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Бейджи для товара */}
                    <div className="position-absolute top-0 start-0 p-2">
                      {relatedProduct.featured && (
                        <span className="badge bg-warning mb-1 d-block">Featured</span>
                      )}
                      {relatedProduct.regular_price && relatedProduct.regular_price > relatedProduct.price && (
                        <span className="badge bg-danger d-block">
                          {Math.round((1 - relatedProduct.price / relatedProduct.regular_price) * 100)}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{relatedProduct.name}</h5>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong className="text-primary">${relatedProduct.price}</strong>
                          {relatedProduct.regular_price && relatedProduct.regular_price > relatedProduct.price && (
                            <small className="text-decoration-line-through text-muted ms-2">
                              ${relatedProduct.regular_price}
                            </small>
                          )}
                        </div>
                        {relatedProduct.stock <= 0 && (
                          <span className="badge bg-danger">Out of Stock</span>
                        )}
                      </div>
                      <Link to={`/product/${relatedProduct.id}`} className="btn btn-outline-primary w-100">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;