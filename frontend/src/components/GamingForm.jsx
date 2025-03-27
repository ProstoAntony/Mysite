import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ReCaptchaModal from './ReCaptchaModal';
import '../styles/gaming-form.css';

const themes = {
  apex: {
    image: '/images/ApexLegends.jpg',
    color: 'var(--apex-color)',
    colorAlpha3: 'var(--apex-color-alpha-3)',
    colorAlpha2: 'var(--apex-color-alpha-2)'
  },
  valorant: {
    image: '/images/Valorant.jpg',
    color: 'var(--valorant-color)',
    colorAlpha3: 'var(--valorant-color-alpha-3)',
    colorAlpha2: 'var(--valorant-color-alpha-2)'
  },
  cyberpunk: {
    image: '/images/CyberPunk.jpg',
    color: 'var(--cyberpunk-color)',
    colorAlpha3: 'var(--cyberpunk-color-alpha-3)',
    colorAlpha2: 'var(--cyberpunk-color-alpha-2)'
  }
};

const GamingForm = ({ initialMode = 'login' }) => {
  const [currentTheme, setCurrentTheme] = useState('apex');
  const [isLogin, setIsLogin] = useState(initialMode === 'login');

  const theme = themes[currentTheme];
  
  const { loginUser, registerUser } = useContext(AuthContext);
  const history = useHistory();
  
  // Form state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);

  const handleThemeChange = (themeName) => {
    setCurrentTheme(themeName);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setCaptchaToken('');
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    setShowCaptchaModal(false);
    // Автоматически отправляем форму после получения токена
    registerUser(email, username, password, password2, token);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      loginUser(email, password);
    } else {
      // Показываем модальное окно с reCAPTCHA
      setShowCaptchaModal(true);
    }
  };

  return (
    <div className={`gaming-form d-flex align-center justify-center ${currentTheme}`}
         style={{
           backgroundImage: `url(${theme.image})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      <div className="gaming-form__container">
        <h1 className="gaming-form__title">{isLogin ? 'Login' : 'Sign Up'}</h1>
        <p className="gaming-form__subtitle">Enter your credentials to continue</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="gaming-form__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              className="gaming-form__input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input
            type="password"
            placeholder="Password"
            className="gaming-form__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="gaming-form__input"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
          )}
          

          
          <button type="submit" className="gaming-form__button filled">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="d-flex justify-center" style={{ marginTop: '1rem' }}>
          <button
            onClick={toggleForm}
            className="gaming-form__link"
          >
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
          </button>
        </div>

        <div className="text-center mb-3">
          <h4 className="gaming-form__subtitle">What world you deserve?</h4>
        </div>

        <div className="gaming-form__theme-buttons">
          <button
            onClick={() => handleThemeChange('apex')}
            className={`gaming-form__theme-button ${currentTheme === 'apex' ? 'active' : ''}`}
          >
            Apex
          </button>
          <button
            onClick={() => handleThemeChange('valorant')}
            className={`gaming-form__theme-button ${currentTheme === 'valorant' ? 'active' : ''}`}
          >
            Valorant
          </button>
          <button
            onClick={() => handleThemeChange('cyberpunk')}
            className={`gaming-form__theme-button ${currentTheme === 'cyberpunk' ? 'active' : ''}`}
          >
            Cyberpunk
          </button>
        </div>
      </div>
      
      {/* Модальное окно с reCAPTCHA */}
      <ReCaptchaModal 
        isOpen={showCaptchaModal} 
        onClose={() => setShowCaptchaModal(false)} 
        onVerify={handleCaptchaChange}
        currentTheme={currentTheme}
      />
    </div>
  );
};

export default GamingForm;