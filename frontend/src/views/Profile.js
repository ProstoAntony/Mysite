import React, { useState, useContext, useEffect, useRef } from 'react';
import AuthContext from '../context/AuthContext';
import useAxios from '../utils/useAxios';
import Cropper from 'react-easy-crop';

function Profile() {
    const { user, authTokens } = useContext(AuthContext);
    const api = useAxios();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        full_name: '',
        bio: '',
        mobile: '',
        user_type: '',
        image: null
    });
    
    // Состояния для кропа изображения
    const [newImage, setNewImage] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const previewCanvasRef = useRef(null);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const response = await api.get('/profile/', {
                headers: {
                    'Authorization': `Bearer ${authTokens?.access}`
                }
            });
            if (response.status === 200) {
                setProfileData(response.data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage(error.response?.data?.detail || 'Error fetching profile data');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const formData = new FormData();
            Object.keys(profileData).forEach(key => {
                if (key !== 'image' && profileData[key]) {
                    formData.append(key, profileData[key]);
                }
            });

            // Отправка изображения
            if (newImage) {
                formData.append('image', newImage);
            }
            
            submitFormWithImage(formData);
        } catch (error) {
            console.error('Error preparing form data:', error);
            setMessage('Error preparing form data');
            setLoading(false);
        }
    };

    const submitFormWithImage = async (formData) => {
        try {
            const response = await api.put('/profile/update/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authTokens?.access}`
                }
            });

            if (response.status === 200) {
                setMessage('Profile updated successfully!');
                setProfileData(response.data);
                resetImageStates();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage(error.response?.data?.detail || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const resetImageStates = () => {
        setNewImage(null);
        setImageSrc(null);
        setShowCropper(false);
        setCroppedAreaPixels(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setNewImage(file);
            
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result);
                setShowCropper(true);
                setShowModal(true);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
            });
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const applyCrop = async () => {
        if (croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
                
                // Создаем изображение для предпросмотра
                const img = new Image();
                img.onload = () => {
                    const canvas = previewCanvasRef.current;
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        
                        canvas.width = 150;
                        canvas.height = 150;
                        
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        
                        // Преобразуем canvas в Blob для отправки на сервер
                        canvas.toBlob((blob) => {
                            if (blob) {
                                setNewImage(blob);
                            }
                        });
                    }
                };
                img.src = croppedImage;
                
                setShowModal(false);
            } catch (e) {
                console.error('Error cropping image:', e);
            }
        } else {
            alert("Пожалуйста, выберите область для обрезки");
        }
    };

    const getCroppedImg = (imageSrc, pixelCrop) => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = imageSrc;
            
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = pixelCrop.width;
                canvas.height = pixelCrop.height;
                
                ctx.drawImage(
                    image,
                    pixelCrop.x,
                    pixelCrop.y,
                    pixelCrop.width,
                    pixelCrop.height,
                    0,
                    0,
                    pixelCrop.width,
                    pixelCrop.height
                );
                
                resolve(canvas.toDataURL('image/jpeg'));
            };
            
            image.onerror = (e) => {
                reject(e);
            };
        });
    };

    const closeModal = () => {
        setShowModal(false);
        resetImageStates();
    };

    return (
        <div className="gaming-form" style={{ 
            backgroundImage: 'url("/images/Background 12.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            padding: '80px 20px 40px'
        }}>
            <div className="container-fluid py-5">
                <div className="gaming-form__container" style={{ 
                    padding: '2.5rem', 
                    marginBottom: '2rem',
                    maxWidth: '1000px'
                }}>
                    <h1 className="gaming-form__title">My Profile</h1>
                    <p className="gaming-form__subtitle">Manage your account information</p>
                    
                    {message && (
                        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}
                             style={{ 
                                 backgroundColor: message.includes('Error') ? 'rgba(220, 53, 69, 0.7)' : 'rgba(40, 167, 69, 0.7)',
                                 color: 'white',
                                 borderRadius: '5px',
                                 backdropFilter: 'blur(5px)'
                             }}>
                            {message}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-4 text-center mb-3">
                                {/* Текущее изображение профиля */}
                                {!showCropper && profileData.image && (
                                    <img 
                                        src={profileData.image}
                                        alt="Profile" 
                                        className="img-fluid rounded-circle mb-3"
                                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                                    />
                                )}
                                
                                {/* Предпросмотр обрезанного изображения */}
                                {showCropper && !showModal && (
                                    <div className="mb-3">
                                        <h6>Выбранная область</h6>
                                        <div style={{ 
                                            width: '150px', 
                                            height: '150px', 
                                            overflow: 'hidden',
                                            borderRadius: '50%',
                                            margin: '0 auto',
                                            border: '2px solid #2a4a6f'
                                        }}>
                                            <canvas
                                                ref={previewCanvasRef}
                                                style={{
                                                    width: '100%',
                                                    height: '100%'
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                <div className="mb-3">
                                    <label className="form-label">Profile Picture</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                            
                            <div className="col-md-8">
                                <div className="mb-3">
                                    <label className="gaming-form__label">Username</label>
                                    <input 
                                        type="text" 
                                        className="gaming-form__input" 
                                        name="username"
                                        value={profileData.username} 
                                        onChange={handleInputChange}
                                        readOnly
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        name="email"
                                        value={profileData.email} 
                                        onChange={handleInputChange}
                                        readOnly
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Full Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="full_name"
                                        value={profileData.full_name} 
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Mobile</label>
                                    <input 
                                        type="tel" 
                                        className="form-control" 
                                        name="mobile"
                                        value={profileData.mobile} 
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Bio</label>
                                    <textarea 
                                        className="form-control" 
                                        name="bio"
                                        value={profileData.bio} 
                                        onChange={handleInputChange}
                                        rows="3"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">User Type</label>
                                    <select 
                                        className="form-control"
                                        name="user_type"
                                        value={profileData.user_type || ''}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Vendor">Vendor</option>
                                        <option value="Customer">Customer</option>
                                    </select>
                                </div>
                                <button 
                                    type="submit" 
                                    className="gaming-form__button filled"
                                    disabled={loading}
                                    style={{ marginTop: '1rem' }}
                                >
                                    {loading ? 'Updating...' : 'Update Profile'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* Модальное окно для обрезки изображения */}
            {showModal && imageSrc && (
                <div className="modal show" style={{ 
                    display: 'block', 
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1050
                }}>
                    <div className="modal-dialog modal-lg" style={{ margin: '30px auto' }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Выберите область для фото профиля</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                <div style={{ position: 'relative', height: '400px', width: '100%' }}>
                                    <Cropper
                                        image={imageSrc}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        cropShape="round"
                                        showGrid={false}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={onCropComplete}
                                    />
                                </div>
                                <div className="mt-3">
                                    <label>Zoom</label>
                                    <input
                                        type="range"
                                        className="form-range"
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        value={zoom}
                                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-danger"
                                    onClick={closeModal}
                                >
                                    Отмена
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-warning"
                                    onClick={applyCrop}
                                >
                                    Применить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;