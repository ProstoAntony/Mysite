import React, { useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import useAxios from '../utils/useAxios';
import '../styles/support-page.css';

function SupportPage() {
    const { user } = useContext(AuthContext);
    const api = useAxios();
    const history = useHistory();
    
    // Form states
    const [subject, setSubject] = useState('');
    const [customSubject, setCustomSubject] = useState('');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState(user ? user.email : '');
    const [name, setName] = useState(user ? user.username : '');
    const [orderNumber, setOrderNumber] = useState('');
    
    // Processing states
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    
    // Support topics
    const supportTopics = [
        { id: 'payment', label: 'Payment Issues' },
        { id: 'download', label: 'Download/Installation Problems' },
        { id: 'technical', label: 'Technical Game Issues' },
        { id: 'refund', label: 'Refund Requests' },
        { id: 'account', label: 'Account Issues' },
        { id: 'other', label: 'Other (Please specify)' }
    ];
    
    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const finalSubject = subject === 'other' ? customSubject : 
            supportTopics.find(topic => topic.id === subject)?.label || '';
        
        try {
            const response = await api.post('/support/create/', {
                subject: finalSubject,
                message: message,
                email: email,
                name: name,
                order_number: orderNumber || null
            });
            
            if (response.status === 201 || response.status === 200) {
                setSuccess(true);
                // Reset form
                setSubject('');
                setCustomSubject('');
                setMessage('');
                setOrderNumber('');
                if (!user) {
                    setEmail('');
                    setName('');
                }
            } else {
                throw new Error('Error sending request');
            }
            
        } catch (err) {
            console.error('Support form submission error:', err);
            setError('Failed to submit support request. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="gaming-form d-flex align-center justify-center" 
             style={{
                 backgroundImage: 'url("/images/Background 12.png")',
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 minHeight: '100vh',
                 padding: '40px 20px'
             }}>
            <div className="gaming-form__container" style={{ 
                maxWidth: '1200px',
                width: '100%',
                padding: '3rem'
            }}>
                <h1 className="gaming-form__title">Customer Support</h1>
                <p className="gaming-form__subtitle">We're here to help with any issues you encounter</p>
                
                {success ? (
                    <div className="text-center py-5">
                        <div className="mb-4">
                            <i className="fas fa-check-circle text-success" style={{ fontSize: '3.5rem' }}></i>
                        </div>
                        <h3 className="gaming-form__subtitle mb-3">Your message has been sent successfully!</h3>
                        <p className="mb-4">We will respond to your inquiry as soon as possible.</p>
                        <div className="d-flex justify-content-center gap-3">
                            <button 
                                className="gaming-form__button filled"
                                onClick={() => setSuccess(false)}
                            >
                                Send Another Message
                            </button>
                            <Link to="/" className="gaming-form__button">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}
                        
                        <div className="mb-4">
                            <label htmlFor="subject" className="gaming-form__label">Issue Type*</label>
                            <select 
                                id="subject" 
                                className="gaming-form__input" 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                                style={{ 
                                    color: '#fff',  // Убедимся, что текст белый
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)'  // Темный фон для выпадающего списка
                                }}
                            >
                                <option value="" style={{ color: '#333', backgroundColor: '#eee' }}>Select your issue type</option>
                                {supportTopics.map(topic => (
                                    <option 
                                        key={topic.id} 
                                        value={topic.id}
                                        style={{ color: '#333', backgroundColor: '#eee' }}  // Темный текст на светлом фоне
                                    >
                                        {topic.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {subject === 'other' && (
                            <div className="mb-4">
                                <label htmlFor="customSubject" className="gaming-form__label">Specify Topic*</label>
                                <input 
                                    type="text" 
                                    id="customSubject" 
                                    className="gaming-form__input" 
                                    value={customSubject}
                                    onChange={(e) => setCustomSubject(e.target.value)}
                                    placeholder="Enter your issue topic"
                                    required
                                />
                            </div>
                        )}
                        
                        <div className="mb-4">
                            <label htmlFor="orderNumber" className="gaming-form__label">Order Number (if applicable)</label>
                            <input 
                                type="text" 
                                id="orderNumber" 
                                className="gaming-form__input" 
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                placeholder="Example: ORD-12345"
                            />
                            <div className="form-text" style={{ color: '#999' }}>
                                Include order number if your issue is related to a specific purchase
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="message" className="gaming-form__label">Issue Description*</label>
                            <textarea 
                                id="message" 
                                className="gaming-form__input" 
                                rows="6" 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe your issue in detail..."
                                required
                                style={{ minHeight: '150px' }}
                            ></textarea>
                        </div>
                        
                        {!user && (
                            <>
                                <div className="alert" style={{ 
                                    background: 'rgba(0,0,0,0.3)', 
                                    color: '#fff',
                                    backdropFilter: 'blur(3px)',
                                    marginBottom: '1.5rem',
                                    padding: '1rem'
                                }}>
                                    <i className="fas fa-info-circle me-2"></i>
                                    You are not logged in. Please provide your contact information so we can respond to you.
                                </div>
                                
                                <div className="row mb-4">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label htmlFor="name" className="gaming-form__label">Your Name*</label>
                                        <input 
                                            type="text" 
                                            id="name" 
                                            className="gaming-form__input" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="email" className="gaming-form__label">Email Address*</label>
                                        <input 
                                            type="email" 
                                            id="email" 
                                            className="gaming-form__input" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        
                        <div className="d-grid gap-2 col-12 col-md-6 mx-auto mt-4">
                            <button 
                                type="submit" 
                                className="gaming-form__button filled"
                                disabled={loading}
                                style={{ padding: '0.8rem' }}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-paper-plane me-2"></i>
                                        Send Message
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
                
                <div style={{ 
                    marginTop: '2rem',
                    padding: '1rem',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(5px)'
                }}>
                    <div className="row">
                        <div className="col-md-6 mb-3 mb-md-0">
                            <h5 className="gaming-form__subtitle mb-2">Frequently Asked Questions</h5>
                            <p style={{ color: '#ccc' }}>
                                Before submitting a request, check our <Link to="/faq" style={{ color: '#fff', textDecoration: 'underline' }}>FAQ section</Link> for quick answers.
                            </p>
                        </div>
                        <div className="col-md-6">
                            <h5 className="gaming-form__subtitle mb-2">Response Time</h5>
                            <p style={{ color: '#ccc' }}>
                                We typically respond within 24 hours on business days.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SupportPage; 