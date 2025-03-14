import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import useAxios from '../utils/useAxios';

function Profile() {
    const { user, authTokens } = useContext(AuthContext);  // Add authTokens
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
    const [newImage, setNewImage] = useState(null);

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

            if (newImage) {
                formData.append('image', newImage);
            }

            const response = await api.put('/profile/update/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authTokens?.access}`
                }
            });

            if (response.status === 200) {
                setMessage('Profile updated successfully!');
                setProfileData(response.data);
                setNewImage(null);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage(error.response?.data?.detail || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setNewImage(e.target.files[0]);
        }
    };

    return (
        <div className="container" style={{ paddingTop: "100px" }}>
            <div className="row">
                <div className="col-md-8 offset-md-2">
                    <div className="card">
                        <div className="card-header bg-dark text-white">
                            <h4 className="mb-0">My Profile</h4>
                        </div>
                        <div className="card-body">
                            {message && (
                                <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
                                    {message}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-4 text-center mb-3">
                                        {(newImage || profileData.image) && (
                                            <img 
                                                src={newImage ? URL.createObjectURL(newImage) : profileData.image}
                                                alt="Profile" 
                                                className="img-fluid rounded-circle mb-3"
                                                style={{ width: "150px", height: "150px", objectFit: "cover" }}
                                            />
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
                                            <label className="form-label">Username</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
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
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? 'Updating...' : 'Update Profile'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;