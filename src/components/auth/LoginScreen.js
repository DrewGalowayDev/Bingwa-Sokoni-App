import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import BeeLogo from '../ui/Beelogo.png';
import './LoginScreen.css';

/**
 * Login Screen Component
 * PIN-based authentication with registration flow
 */

export const LoginScreen = () => {
  const { hasPin, login, setupPin } = useAuth();
  const [mode, setMode] = useState(hasPin ? 'login' : 'register');
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handlePinChange = (index, value, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = isConfirm ? [...confirmPin] : [...pin];
    newPin[index] = value.slice(-1);
    
    if (isConfirm) {
      setConfirmPin(newPin);
    } else {
      setPin(newPin);
    }
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(
        `${isConfirm ? 'confirm-' : ''}pin-${index + 1}`
      );
      nextInput?.focus();
    }

    setError('');
  };

  const handleKeyDown = (index, e, isConfirm = false) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      const prevInput = document.getElementById(
        `${isConfirm ? 'confirm-' : ''}pin-${index - 1}`
      );
      prevInput?.focus();
    }
  };

  const handleLogin = () => {
    const pinString = pin.join('');
    if (pinString.length !== 4) {
      setError('Please enter your 4-digit PIN');
      return;
    }

    const result = login(pinString);
    if (!result.success) {
      setError(result.error);
      setPin(['', '', '', '']);
    }
  };

  const handleRegister = () => {
    if (step === 1) {
      // Validate phone number
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 9) {
        setError('Please enter a valid phone number');
        return;
      }
      setStep(2);
      setError('');
    } else if (step === 2) {
      // Validate PIN
      const pinString = pin.join('');
      if (pinString.length !== 4) {
        setError('Please enter a 4-digit PIN');
        return;
      }
      setStep(3);
      setError('');
    } else if (step === 3) {
      // Confirm PIN
      const pinString = pin.join('');
      const confirmString = confirmPin.join('');
      
      if (pinString !== confirmString) {
        setError('PINs do not match');
        setConfirmPin(['', '', '', '']);
        return;
      }

      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('0') 
        ? '254' + cleanPhone.slice(1) 
        : cleanPhone.startsWith('254') 
          ? cleanPhone 
          : '254' + cleanPhone;

      const result = setupPin(pinString, formattedPhone);
      if (!result.success) {
        setError(result.error);
      }
    }
  };

  const renderPinInputs = (values, isConfirm = false) => (
    <div className="pin-inputs">
      {values.map((digit, index) => (
        <input
          key={index}
          id={`${isConfirm ? 'confirm-' : ''}pin-${index}`}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handlePinChange(index, e.target.value, isConfirm)}
          onKeyDown={(e) => handleKeyDown(index, e, isConfirm)}
          className="pin-input"
          autoComplete="off"
        />
      ))}
    </div>
  );

  return (
    <div className="login-screen">
      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon beesam-logo-large">
            <img src={BeeLogo} alt="BEESAM Tech" className="login-logo-img" />
          </div>
          <h1 className="logo-text">BEESAM Tech</h1>
          <p className="logo-tagline">Safaricom Data Packages</p>
        </div>

        {/* Login Mode */}
        {mode === 'login' && (
          <div className="login-form">
            <h2>Welcome Back!</h2>
            <p>Enter your 4-digit PIN to continue</p>
            
            {renderPinInputs(pin)}
            
            {error && <div className="error-message">{error}</div>}
            
            <button className="login-btn" onClick={handleLogin}>
              Unlock
            </button>
            
            <button 
              className="text-btn"
              onClick={() => {
                setMode('register');
                setStep(1);
                setError('');
              }}
            >
              Forgot PIN? Reset Account
            </button>
          </div>
        )}

        {/* Register Mode */}
        {mode === 'register' && (
          <div className="login-form">
            {step === 1 && (
              <>
                <h2>Get Started</h2>
                <p>Enter your Safaricom number</p>
                
                <div className="phone-input-wrapper">
                  <span className="phone-prefix">+254</span>
                  <input
                    type="tel"
                    className="phone-input"
                    placeholder="7XX XXX XXX"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setError('');
                    }}
                    maxLength={12}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2>Create PIN</h2>
                <p>Set a 4-digit PIN for quick access</p>
                {renderPinInputs(pin)}
              </>
            )}

            {step === 3 && (
              <>
                <h2>Confirm PIN</h2>
                <p>Re-enter your PIN to confirm</p>
                {renderPinInputs(confirmPin, true)}
              </>
            )}

            {error && <div className="error-message">{error}</div>}

            <button className="login-btn" onClick={handleRegister}>
              {step === 3 ? 'Create Account' : 'Continue'}
            </button>

            {step > 1 && (
              <button 
                className="text-btn"
                onClick={() => {
                  setStep(step - 1);
                  setError('');
                }}
              >
                Go Back
              </button>
            )}

            {hasPin && step === 1 && (
              <button 
                className="text-btn"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
              >
                Already have an account? Login
              </button>
            )}
          </div>
        )}

        {/* Step Indicators */}
        {mode === 'register' && (
          <div className="step-indicators">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`step-dot ${step >= s ? 'active' : ''}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
