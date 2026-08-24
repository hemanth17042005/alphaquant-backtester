import React, { useState, useEffect, useRef } from 'react';
import {
  Lock, Mail, User, KeyRound, ShieldCheck, Eye, EyeOff,
  RefreshCw, CheckCircle2, AlertCircle, ArrowRight, LogOut,
  Sparkles, Clock, X, ChevronRight, Fingerprint, Award, Check
} from 'lucide-react';
import { registerUser, verifyEmailOtp, loginUser, resendOtp } from '../services/api';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login', // 'login' | 'signup' | 'otp' | 'profile'
  currentUser,
  onAuthSuccess,
  onLogout
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'otp' | 'profile'
  
  // Form fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP 6-box input state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);

  // Async / status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Sync mode with props when modal opens
  useEffect(() => {
    if (isOpen) {
      if (currentUser && initialMode !== 'otp') {
        setMode('profile');
      } else {
        setMode(initialMode || 'login');
      }
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode, currentUser]);

  // Resend cooldown timer countdown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first OTP input when entering OTP mode
  useEffect(() => {
    if (mode === 'otp' && isOpen) {
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 150);
    }
  }, [mode, isOpen]);

  if (!isOpen) return null;

  // Calculate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Basic', color: '#EF4444' };
    if (score <= 4) return { score: 2, label: 'Strong', color: '#00BBF9' };
    return { score: 3, label: 'Institutional Grade', color: '#00F5D4' };
  };

  const passwordStrength = getPasswordStrength(password);

  // ----------------- OTP INPUT HANDLERS -----------------
  const handleOtpChange = (index, value) => {
    // Only accept numeric single characters
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    setErrorMsg('');

    // If character typed, move to next input
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      handleVerifyOtpSubmit(e);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setOtpDigits(newDigits);
      // Focus appropriate box
      const targetIndex = Math.min(pastedData.length, 5);
      otpInputRefs.current[targetIndex]?.focus();
    }
  };

  const fillDemoOtp = (codeToFill) => {
    const code = (codeToFill || demoCode).trim();
    if (code && code.length === 6) {
      const digits = code.split('');
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // ----------------- FORM SUBMIT ACTIONS -----------------

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.requires_verification) {
        // Account unverified: transition to OTP verification screen
        setDemoCode(res.demo_code || '');
        setResendCooldown(45);
        setMode('otp');
        setSuccessMsg(res.message || `Verification code sent to ${email}`);
      } else if (res.token && res.user) {
        onAuthSuccess(res.user, res.token, rememberMe);
        setSuccessMsg('Authenticated successfully! Welcome back.');
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        email: email.trim(),
        full_name: fullName.trim(),
        password
      });

      setDemoCode(res.demo_code || '');
      setResendCooldown(45);
      setMode('otp');
      setSuccessMsg(res.message || `Verification code dispatched to ${email}`);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmailOtp({
        email: email.trim(),
        otp_code: fullCode
      });

      if (res.token && res.user) {
        setSuccessMsg('Email verified & session authorized!');
        onAuthSuccess(res.user, res.token, rememberMe);
        setTimeout(() => {
          onClose();
        }, 700);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP code. Please retry or click Resend.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtpClick = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await resendOtp(email.trim());
      setDemoCode(res.demo_code || '');
      setResendCooldown(45);
      setSuccessMsg(res.message || 'Fresh 6-digit OTP code dispatched to your email.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend code. Please wait a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(4, 7, 13, 0.85)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: mode === 'profile' ? '460px' : '480px',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(8, 11, 17, 0.98) 100%)',
          border: '1px solid rgba(0, 245, 212, 0.25)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(0, 245, 212, 0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative Top Glow Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: mode === 'otp'
            ? 'linear-gradient(90deg, #F15BB5, #00F5D4, #00BBF9)'
            : 'linear-gradient(90deg, #00F5D4, #00BBF9, #9B5DE5)'
        }} />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFF';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
          title="Close"
        >
          <X size={16} />
        </button>

        {/* ========================================================================= */}
        {/* MODE: LOGGED-IN PROFILE VIEW                                              */}
        {/* ========================================================================= */}
        {mode === 'profile' && currentUser && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00F5D4 0%, #00BBF9 100%)',
                color: '#080B11',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 900,
                fontFamily: 'var(--font-display)',
                margin: '0 auto 1rem auto',
                boxShadow: '0 0 25px rgba(0, 245, 212, 0.4)',
                border: '3px solid rgba(255, 255, 255, 0.2)'
              }}>
                {(currentUser.full_name || currentUser.email || 'Q').slice(0, 2).toUpperCase()}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: '#FFF' }}>
                {currentUser.full_name || 'Quant Trader'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {currentUser.email}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.6rem' }}>
                <span className="badge-bull" style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}>
                  <Award size={12} style={{ marginRight: '3px' }} />
                  {currentUser.tier || 'PRO_QUANT'}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#10B981',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px'
                }}>
                  ● Verified
                </span>
              </div>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.5rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Account ID</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                  {currentUser.id ? currentUser.id.slice(0, 12) + '...' : 'SEC-9921'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Security Standard</span>
                <span style={{ color: '#00F5D4', fontWeight: 600 }}>HMAC-SHA256 JWT</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Email Verification</span>
                <span style={{ color: '#10B981', fontWeight: 600 }}>Active (OTP Authenticated)</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                style={{ flex: 1, padding: '0.7rem', justifyContent: 'center' }}
              >
                Return to Terminal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onLogout) onLogout();
                  onClose();
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.7rem',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#EF4444',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE: 6-DIGIT OTP VERIFICATION SCREEN                                     */}
        {/* ========================================================================= */}
        {mode === 'otp' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                background: 'rgba(0, 245, 212, 0.12)',
                border: '1px solid rgba(0, 245, 212, 0.4)',
                color: '#00F5D4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.85rem auto',
                boxShadow: '0 0 20px rgba(0, 245, 212, 0.2)'
              }}>
                <KeyRound size={26} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800 }}>
                Enter Verification Code
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                We sent a 6-digit OTP code to:
              </p>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#00BBF9',
                marginTop: '0.2rem'
              }}>
                {email || 'your-email@domain.com'}
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#F87171',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                animation: 'shake 0.3s ease'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message Banner */}
            {successMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(0, 245, 212, 0.1)',
                border: '1px solid rgba(0, 245, 212, 0.3)',
                color: '#00F5D4',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.8rem',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Simulated Fast Fill Helper (Instant Testing) */}
            {demoCode && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(155, 93, 229, 0.12)',
                border: '1px dashed rgba(155, 93, 229, 0.4)',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#D8B4FE' }}>
                  <Sparkles size={14} color="#C084FC" />
                  <span>Demo Code: <strong>{demoCode}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => fillDemoOtp(demoCode)}
                  style={{
                    background: 'rgba(155, 93, 229, 0.25)',
                    border: '1px solid rgba(155, 93, 229, 0.6)',
                    color: '#FFF',
                    borderRadius: '5px',
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Autofill Code
                </button>
              </div>
            )}

            {/* 6-Digit OTP Boxes */}
            <form onSubmit={handleVerifyOtpSubmit}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  marginBottom: '1.5rem'
                }}
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    disabled={loading}
                    style={{
                      width: '48px',
                      height: '56px',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: digit ? '2px solid #00F5D4' : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: '#00F5D4',
                      boxShadow: digit ? '0 0 12px rgba(0, 245, 212, 0.25)' : 'none',
                      outline: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#00F5D4';
                      e.target.style.boxShadow = '0 0 14px rgba(0, 245, 212, 0.3)';
                    }}
                    onBlur={(e) => {
                      if (!digit) {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                ))}
              </div>

              {/* Submit Verification Button */}
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || otpDigits.join('').length !== 6}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  justifyContent: 'center',
                  opacity: (loading || otpDigits.join('').length !== 6) ? 0.65 : 1,
                  marginBottom: '1rem'
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Verify & Authenticate</span>
                  </>
                )}
              </button>

              {/* Resend OTP & Change Email options */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.78rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FFF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  ← Change Email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtpClick}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: resendCooldown > 0 ? 'var(--text-dim)' : '#00BBF9',
                    fontWeight: 700,
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  {resendCooldown > 0 ? (
                    <>
                      <Clock size={13} />
                      <span>Resend in {resendCooldown}s</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={13} />
                      <span>Resend Code</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE: SIGN IN / SIGN UP FORMS                                             */}
        {/* ========================================================================= */}
        {(mode === 'login' || mode === 'signup') && (
          <div>
            {/* Header / Brand */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00F5D4 0%, #00BBF9 100%)',
                color: '#080B11',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto',
                boxShadow: '0 0 20px rgba(0, 245, 212, 0.4)'
              }}>
                <Fingerprint size={24} strokeWidth={2.5} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                ALPHA<span style={{ color: 'var(--accent-primary)' }}>QUANT</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {mode === 'login'
                  ? 'Sign in to access your quantitative workstation'
                  : 'Create your institutional trading account'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '1.25rem',
              gap: '4px'
            }}>
              <button
                type="button"
                id="tab-auth-login"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: mode === 'login' ? 'linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(0, 187, 249, 0.2))' : 'transparent',
                  color: mode === 'login' ? '#00F5D4' : 'var(--text-muted)',
                  boxShadow: mode === 'login' ? '0 0 12px rgba(0, 245, 212, 0.2)' : 'none'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                id="tab-auth-signup"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: mode === 'signup' ? 'linear-gradient(135deg, rgba(155, 93, 229, 0.2), rgba(0, 187, 249, 0.2))' : 'transparent',
                  color: mode === 'signup' ? '#9B5DE5' : 'var(--text-muted)',
                  boxShadow: mode === 'signup' ? '0 0 12px rgba(155, 93, 229, 0.2)' : 'none'
                }}
              >
                Create Account
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#F87171',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.8rem',
                marginBottom: '1rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message Banner */}
            {successMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(0, 245, 212, 0.1)',
                border: '1px solid rgba(0, 245, 212, 0.3)',
                color: '#00F5D4',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.8rem',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={mode === 'login' ? handleLoginSubmit : handleSignUpSubmit}>
              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>
                    FULL NAME
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input
                      type="text"
                      id="input-signup-name"
                      className="input-dark"
                      placeholder="e.g. Warren Buffett"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      style={{ width: '100%', paddingLeft: '38px' }}
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  EMAIL ADDRESS
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input
                    type="email"
                    id="input-auth-email"
                    className="input-dark"
                    placeholder="trader@alphaquant.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', paddingLeft: '38px' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    PASSWORD
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!email) {
                          setErrorMsg('Enter your email first to receive a verification OTP.');
                        } else {
                          handleResendOtpClick();
                          setMode('otp');
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#00BBF9',
                        fontSize: '0.74rem',
                        cursor: 'pointer'
                      }}
                    >
                      OTP Sign In
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="input-auth-password"
                    className="input-dark"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', paddingLeft: '38px', paddingRight: '38px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password strength indicator for signup */}
                {mode === 'signup' && password && (
                  <div style={{ marginTop: '0.45rem' }}>
                    <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '0.25rem' }}>
                      <div style={{ flex: 1, borderRadius: '2px', background: passwordStrength.score >= 1 ? passwordStrength.color : 'rgba(255,255,255,0.1)' }} />
                      <div style={{ flex: 1, borderRadius: '2px', background: passwordStrength.score >= 2 ? passwordStrength.color : 'rgba(255,255,255,0.1)' }} />
                      <div style={{ flex: 1, borderRadius: '2px', background: passwordStrength.score >= 3 ? passwordStrength.color : 'rgba(255,255,255,0.1)' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: passwordStrength.color, fontWeight: 600 }}>
                      Strength: {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password (Sign Up only) */}
              {mode === 'signup' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>
                    CONFIRM PASSWORD
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="input-signup-confirm-password"
                      className="input-dark"
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        paddingLeft: '38px',
                        borderColor: (confirmPassword && password !== confirmPassword) ? '#EF4444' : undefined
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Remember Me Checkbox */}
              {mode === 'login' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <input
                    type="checkbox"
                    id="remember-me-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#00F5D4', cursor: 'pointer' }}
                  />
                  <label htmlFor="remember-me-checkbox" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    Keep session active on this browser
                  </label>
                </div>
              )}

              {/* Submit CTA Button */}
              <button
                type="submit"
                id="btn-auth-submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : mode === 'login' ? (
                  <>
                    <ShieldCheck size={18} />
                    <span>Sign In to Terminal</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Send OTP</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Footer Notice */}
            <div style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '0.85rem'
            }}>
              {mode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg('');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#00F5D4',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Sign up for free
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#00F5D4',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Sign in here
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
