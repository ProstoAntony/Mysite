import React, { useState, useEffect, useRef, useContext } from 'react';
import AuthContext from '../context/AuthContext';

function Gallery({ productId }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageScale, setImageScale] = useState(100);
    const [brightness, setBrightness] = useState(100);
    const [loading, setLoading] = useState(true);
    const { authTokens } = useContext(AuthContext);
    
    // Используем useRef для отслеживания, был ли уже выполнен запрос
    const fetchedRef = useRef({});
    
    useEffect(() => {
        // Если нет productId или запрос для этого productId уже был выполнен, не делаем ничего
        if (!productId || fetchedRef.current[productId]) return;
        
        // Отмечаем, что запрос для этого productId начался
        fetchedRef.current[productId] = true;
        
        let isMounted = true;
        
        // Используем тот же подход, что и в ProductList.js
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}/`, {
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
                console.log('Product data:', data);
                
                if (isMounted && data && data.image) {
                    setSelectedImage(data.image);
                }
            } catch (err) {
                console.error('Error fetching product:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (authTokens?.access) {
            fetchProduct();
        } else {
            setLoading(false);
        }
        
        // Устанавливаем таймаут для предотвращения бесконечной загрузки
        const timeoutId = setTimeout(() => {
            if (isMounted) {
                setLoading(false);
            }
        }, 3000);
        
        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [productId, authTokens]);
    
    const imageStyle = {
        transform: `scale(${imageScale / 100})`,
        filter: `brightness(${brightness}%)`,
        transition: 'transform 0.3s, filter 0.3s'
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="product-gallery">
            <div className="main-image mb-3 position-relative">
                {selectedImage ? (
                    <>
                        <img 
                            src={selectedImage} 
                            alt="Selected product" 
                            className="img-fluid rounded"
                            style={{ ...imageStyle, maxHeight: '400px', width: 'auto' }}
                            onError={(e) => {
                                console.error('Image load error:', selectedImage);
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Available';
                            }}
                        />
                        <div className="image-controls mt-3">
                            <div className="mb-2">
                                <label className="form-label">Zoom: {imageScale}%</label>
                                <input 
                                    type="range" 
                                    className="form-range" 
                                    min="50" 
                                    max="200" 
                                    value={imageScale}
                                    onChange={(e) => setImageScale(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="form-label">Brightness: {brightness}%</label>
                                <input 
                                    type="range" 
                                    className="form-range" 
                                    min="50" 
                                    max="150" 
                                    value={brightness}
                                    onChange={(e) => setBrightness(e.target.value)}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="placeholder-image d-flex justify-content-center align-items-center bg-light rounded" style={{ height: "400px" }}>
                        <div className="text-center">
                            <i className="fas fa-image fa-4x text-muted mb-3"></i>
                            <p className="text-muted">No image available</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Gallery;