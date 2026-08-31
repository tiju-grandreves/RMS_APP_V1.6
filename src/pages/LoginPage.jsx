import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import httpService from '../services/httpService';
import { useShop } from '../services/ShopContext';
import { validateEmail } from '../components/common/Validators';
import {
  MOCK_ADMIN_CREDENTIALS,
  MOCK_USER_DATA,
  MOCK_RECEPTIONIST_CREDENTIALS,
  MOCK_RECEPTIONIST_DATA,
  MOCK_ACCOUNTANT_CREDENTIALS,
  MOCK_ACCOUNTANT_DATA,
} from '../services/mockData';

const LoginPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const { shop, loading: shopLoading, error: shopError, loadShopBySlug } = useShop();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  /* ✅ Fixed teal color for all icons always */
  const ic = '#3ab8c8';

  useEffect(() => {
    if (shopSlug) {
      loadShopBySlug(shopSlug);
    }
  }, [shopSlug, loadShopBySlug]);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    const rememberMeFlag = localStorage.getItem('rememberMeFlag') === 'true';
    if (rememberMeFlag && rememberedEmail && rememberedPassword) {
      setFormData({ email: rememberedEmail, password: rememberedPassword });
      setRememberMe(true);
    } else {
      const storedUser = JSON.parse(localStorage.getItem('userData'));
      if (storedUser?.emailaddressuser || storedUser?.email) {
        setFormData((prev) => ({
          ...prev,
          email: storedUser.emailaddressuser || storedUser.email || '',
        }));
      }
    }
  }, []);

  const getEmailErrorMessage = () => {
    if (!emailTouched) return '';
    if (!formData.email.trim()) return 'Email is required';
    return validateEmail(formData.email);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'email') setEmailTouched(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailTouched(true);
    const emailError = validateEmail(formData.email);
    if (emailError) return;
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    const emailLower = formData.email.trim().toLowerCase();

    if (emailLower === MOCK_ADMIN_CREDENTIALS.email && formData.password === MOCK_ADMIN_CREDENTIALS.password) {
  localStorage.setItem('userData', JSON.stringify(MOCK_USER_DATA));
  localStorage.setItem('accessToken', MOCK_USER_DATA.accessToken);
  window.dispatchEvent(new Event('userLoggedIn'));
  navigate('/AdminDashboard'); // ← fixed
  return;
}
    if (emailLower === MOCK_RECEPTIONIST_CREDENTIALS.email && formData.password === MOCK_RECEPTIONIST_CREDENTIALS.password) {
      localStorage.setItem('userData', JSON.stringify(MOCK_RECEPTIONIST_DATA));
      localStorage.setItem('accessToken', MOCK_RECEPTIONIST_DATA.accessToken);
      window.dispatchEvent(new Event('userLoggedIn'));
     navigate('/ReceptionistHome');  
      return;
    }
    if (emailLower === MOCK_ACCOUNTANT_CREDENTIALS.email && formData.password === MOCK_ACCOUNTANT_CREDENTIALS.password) {
  localStorage.setItem('userData', JSON.stringify(MOCK_ACCOUNTANT_DATA));
  localStorage.setItem('accessToken', MOCK_ACCOUNTANT_DATA.accessToken);
  window.dispatchEvent(new Event('userLoggedIn'));
  navigate('/AccountantHome');
  return;
}

    setLoading(true);
    setError('');
    try {
      const response = await httpService.post('/auth/login', {
        email: formData.email,
        password: formData.password,
        shop_slug: shopSlug,
      });
      const { accessToken, refreshToken, user } = response || {};
      if (accessToken && user) {
        const userDataToStore = { ...user, emailaddressuser: user.email, accessToken, refreshToken, shopSlug };
        localStorage.setItem('userData', JSON.stringify(userDataToStore));
        localStorage.setItem('accessToken', accessToken);
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
          localStorage.setItem('rememberedPassword', formData.password);
          localStorage.setItem('rememberMeFlag', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
          localStorage.removeItem('rememberMeFlag');
        }
        window.dispatchEvent(new Event('userLoggedIn'));
        // switch (user.roleId) {
        //   case 3: navigate('/RequestListing'); break;
        //   case 1:
        //   case 2:
        //   default: navigate('/AdminDashboard');
        // }
       
     switch (user.roleName) {
  case 'Admin': navigate('/AdminDashboard'); break;
  case 'Receptionist': navigate('/ReceptionistHome'); break;
  case 'Service Officer': navigate('/ServiceOfficerHome'); break;
  case 'Account Manager': navigate('/AccountantHome');
  break;
  default: navigate('/AdminDashboard');
}
      } else {
        setError('Login failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.message || 'Oops! something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (shopSlug && shopError) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#f0f4f8' }}>
        <div
          className="text-center max-w-[420px] p-8"
          style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 2px 32px rgba(26,46,56,0.08)' }}
        >
          <h2 className="font-extrabold mb-2" style={{ fontSize: '20px', color: '#1a2e38' }}>
            Shop not found
          </h2>
          <p className="text-sm" style={{ color: '#8896a7' }}>
            We couldn't find a shop for this link. Please check the URL or contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden" style={{ background: '#f0f4f8' }}>

      {/* ══════════ LEFT PANEL ══════════ */}
      <div
        className="hidden lg:flex lg:w-[54%] lg:h-screen relative flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #3dd6c8 0%, #2fb5b8 20%, #3a9ec8 45%, #395062 75%, #1a2e38 100%)',
        }}
      >
        <div style={{
          position: 'absolute', top: '-100px', left: '-100px',
          width: '380px', height: '380px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', top: '60px', right: '-40px',
          width: '220px', height: '220px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute', bottom: '180px', left: '20%',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        <div style={{
          position: 'absolute', top: '14%', right: '10%',
          width: '160px', height: '160px',
          background: 'rgba(255,255,255,0.09)',
          borderRadius: '24px',
          transform: 'rotate(45deg)',
          border: '1px solid rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', top: '18%', right: '14%',
          width: '100px', height: '100px',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: '16px',
          transform: 'rotate(45deg)',
        }} />
        <div style={{
          position: 'absolute', top: '24%', right: '20%',
          width: '50px', height: '50px',
          background: 'rgba(255,255,255,0.10)',
          borderRadius: '8px',
          transform: 'rotate(45deg)',
        }} />
        <div style={{
          position: 'absolute', top: '10%', right: '38%',
          width: '18px', height: '18px',
          background: 'rgba(255,255,255,0.18)',
          borderRadius: '3px',
          transform: 'rotate(45deg)',
        }} />
        <div style={{
          position: 'absolute', top: '44%', right: '5%',
          width: '14px', height: '14px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '2px',
          transform: 'rotate(45deg)',
        }} />
        <div style={{
          position: 'absolute', top: '60%', right: '28%',
          width: '10px', height: '10px',
          background: 'rgba(255,255,255,0.12)',
          borderRadius: '2px',
          transform: 'rotate(45deg)',
        }} />

        <div style={{
          position: 'absolute', bottom: 0, left: '-5%', right: '-5%', height: '200px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '100% 100% 0 0 / 70px 70px 0 0',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: '-10%', right: '-10%', height: '130px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '100% 100% 0 0 / 50px 50px 0 0',
        }} />

        <div className="relative z-10 flex flex-col justify-center flex-1 px-16">
          <h1
            className="text-white font-extrabold leading-[1.1] mb-5"
            style={{ fontSize: 'clamp(42px, 5.5vw, 62px)', letterSpacing: '-1.5px' }}
          >
            Welcome<br />to {shop?.shopName || 'RMS'}!
          </h1>
          <p className="text-white/70 text-base leading-relaxed mb-6" style={{ maxWidth: '320px', fontSize: '15px' }}>
            Your all-in-one solution for smooth, efficient management.
          </p>
          <div style={{ width: '56px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.6)' }} />
        </div>

        <div
          className="relative z-10 flex items-start justify-around pb-12 px-12 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}
        >
          {[
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#3dd6c8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="#3dd6c8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              label: 'Secure',
              desc: 'Your data is safe with us.',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#5b9ec9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              label: 'Fast',
              desc: 'Quick access to what matters.',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 20V10M12 20V4M6 20v-6" stroke="#6b8abf" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              label: 'Reliable',
              desc: 'Built for performance & uptime.',
            },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center" style={{ maxWidth: '120px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '10px',
              }}>
                {f.icon}
              </div>
              <span className="text-white font-bold text-sm mb-1" style={{ letterSpacing: '0.2px' }}>{f.label}</span>
              <span className="text-white/50 text-xs leading-snug">{f.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ RIGHT PANEL ══════════ */}
      <div
        className="flex-1 min-h-screen flex items-center justify-center px-4 sm:px-6 py-10"
        style={{ background: '#f0f4f8' }}
      >
        <div
          className="w-full max-w-[420px] p-6 sm:p-9"
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 2px 32px rgba(26,46,56,0.08)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex justify-center mb-6">
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)',
                width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(58,184,200,0.35)',
              }} />
              <div style={{
                position: 'absolute', top: '50%', right: '-10px', transform: 'translateY(-50%)',
                width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(91,158,201,0.35)',
              }} />
              <div style={{
                position: 'absolute', bottom: '-5px', left: '20%',
                width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(107,138,191,0.30)',
              }} />
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: shop?.shopLogo ? '#fff' : 'linear-gradient(135deg, #3dd6c8 0%, #3a9ec8 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(58,184,200,0.30)',
                overflow: 'hidden',
              }}>
                {shop?.shopLogo ? (
                  <img src={shop.shopLogo} alt={shop.shopName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          </div>

          <h2 className="text-center font-extrabold mb-1" style={{ fontSize: '22px', color: '#1a2e38', letterSpacing: '-0.3px' }}>
            Enter your details
          </h2>
          <p className="text-center text-sm mb-7" style={{ color: '#8896a7' }}>
            Sign in to continue to your account
          </p>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
              padding: '10px 14px', marginBottom: '16px',
            }}>
              <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: '#1a2e38' }}>
                Email address
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 flex items-center pointer-events-none">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="3" stroke={ic} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 7l10 7 10-7" stroke={ic} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onFocus={() => { setFocusedField('email'); setEmailTouched(true); }}
                  onBlur={() => setFocusedField(null)}
                  disabled={loading}
                  placeholder="Enter your email address"
                  style={{
                    width: '100%',
                    paddingLeft: '42px',
                    paddingRight: '16px',
                    paddingTop: '13px',
                    paddingBottom: '13px',
                    border: focusedField === 'email' ? '1.5px solid #3ab8c8' : '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#1a2e38',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    background: focusedField === 'email' ? '#f8fffe' : '#fff',
                    boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(58,184,200,0.10)' : 'none',
                  }}
                />
              </div>
              <div style={{ minHeight: '18px' }}>
                {getEmailErrorMessage() && (
                  <p className="text-xs" style={{ color: '#ef4444' }}>{getEmailErrorMessage()}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: '#1a2e38' }}>
                Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 flex items-center pointer-events-none">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke={ic} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={ic} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  disabled={loading}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    paddingLeft: '42px',
                    paddingRight: '48px',
                    paddingTop: '13px',
                    paddingBottom: '13px',
                    border: focusedField === 'password' ? '1.5px solid #3ab8c8' : '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#1a2e38',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    background: focusedField === 'password' ? '#f8fffe' : '#fff',
                    boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(58,184,200,0.10)' : 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M3 3L21 21" stroke={ic} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10.58 10.58C10.21 10.95 10 11.46 10 12C10 13.1 10.9 14 12 14C12.54 14 13.05 13.79 13.42 13.42" stroke={ic} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9.88 5.09C10.56 4.96 11.27 4.89 12 4.89C16.6 4.89 20.2 7.69 22 11.89C21.49 13.08 20.81 14.16 20 15.09" stroke={ic} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6.1 6.1C4.38 7.27 3.01 9.01 2 11.89C3.8 16.09 7.4 18.89 12 18.89C13.99 18.89 15.82 18.37 17.4 17.4" stroke={ic} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M2 12C3.8 7.8 7.4 5 12 5C16.6 5 20.2 7.8 22 12C20.2 16.2 16.6 19 12 19C7.4 19 3.8 16.2 2 12Z" stroke={ic} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={ic} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between" style={{ marginTop: '2px' }}>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div style={{
                  width: '18px', height: '18px', borderRadius: '5px',
                  border: rememberMe ? 'none' : '1.5px solid #cbd5e1',
                  background: rememberMe ? 'linear-gradient(135deg, #3dd6c8, #3a9ec8)' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {rememberMe && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-sm" style={{ color: '#4a5568' }}>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgotpassword')}
                className="text-sm font-medium"
                style={{
                  color: '#3ab8c8', background: 'none', border: 'none', cursor: 'pointer',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                onMouseLeave={e => e.target.style.textDecoration = 'none'}
              >
                Forgot password?
              </button>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading || shopLoading}
              className="w-full flex items-center justify-center gap-2 text-white font-bold transition-all duration-200"
              style={{
                padding: '14px 0',
                borderRadius: '12px',
                fontSize: '15px',
                letterSpacing: '0.3px',
                background: 'linear-gradient(90deg, #3dd6c8 0%, #3a9ec8 50%, #395062 100%)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(58,184,200,0.30)',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none',
              }}
              onMouseEnter={e => { if (!loading) e.target.style.boxShadow = '0 6px 24px rgba(58,184,200,0.40)'; }}
              onMouseLeave={e => { e.target.style.boxShadow = loading ? 'none' : '0 4px 16px rgba(58,184,200,0.30)'; }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2.5" strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round"/>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  Sign in
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>

            <p className="text-center text-xs mt-1" style={{ color: '#8896a7', lineHeight: '1.6' }}>
              By continuing, you agree to the{' '}
              <span
                className="font-semibold cursor-pointer"
                style={{ color: '#3ab8c8', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                onClick={() => navigate('/termspage')}
              >
                Terms of Service
              </span>
              {' '}and{' '}
              <span
                className="font-semibold cursor-pointer"
                style={{ color: '#3ab8c8', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                onClick={() => navigate('/privacypolicy')}
              >
                Privacy Policy
              </span>
              .
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;