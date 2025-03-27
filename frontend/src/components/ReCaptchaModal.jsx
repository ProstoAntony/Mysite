import React, { useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import '../styles/gaming-form.css';

const ReCaptchaModal = ({ isOpen, onClose, onVerify, currentTheme }) => {
  const recaptchaRef = useRef(null);

  if (!isOpen) return null;

  const handleVerify = (token) => {
    if (token) {
      onVerify(token);
    }
  };

  const handleCancel = () => {
    onClose();
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  return (
    <div className="recaptcha-modal-overlay">
      <div className={`recaptcha-modal ${currentTheme}`}>
        <div className="recaptcha-modal__title">Подтвердите, что вы не робот</div>
        <div className="recaptcha-modal__content">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
            onChange={handleVerify}
            theme="dark"
          />
        </div>
        <div className="recaptcha-modal__buttons">
          <button 
            className="recaptcha-modal__button cancel" 
            onClick={handleCancel}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReCaptchaModal;