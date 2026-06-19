import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Email hoặc mật khẩu không đúng.';
      case 'auth/invalid-email':
        return 'Định dạng email không hợp lệ.';
      case 'auth/too-many-requests':
        return 'Quá nhiều lần thử. Vui lòng thử lại sau.';
      case 'auth/user-disabled':
        return 'Tài khoản này đã bị vô hiệu hóa.';
      case 'auth/network-request-failed':
        return 'Lỗi kết nối mạng. Kiểm tra lại internet.';
      default:
        return 'Đã xảy ra lỗi. Vui lòng thử lại.';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in App.jsx will handle redirect
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      backgroundImage:
        'radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.2) 0px, transparent 50%),' +
        'radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.2) 0px, transparent 50%),' +
        'radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: '1rem',
    }}>

      {/* Background mesh */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0
      }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            borderRadius: '50%',
            background: i % 2 === 0
              ? 'rgba(59,130,246,0.06)'
              : 'rgba(139,92,246,0.06)',
            width: `${200 + i * 80}px`,
            height: `${200 + i * 80}px`,
            top: `${10 + i * 15}%`,
            left: `${5 + i * 12}%`,
            animation: `float ${6 + i}s ease-in-out infinite alternate`,
          }} />
        ))}
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '420px',
      }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
            marginBottom: '1.25rem',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: '700',
            background: 'linear-gradient(135deg, #f8fafc, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: '0 0 0.35rem',
          }}>
            Quản Lý Dự Án
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            FDI Projects Management System
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
        }}>
          <h2 style={{
            fontSize: '1.25rem', fontWeight: '600',
            color: '#f8fafc', margin: '0 0 0.35rem',
          }}>
            Đăng nhập
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1.75rem' }}>
            Nhập thông tin tài khoản của bạn để tiếp tục
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '500', color: '#94a3b8' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: '#475569',
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="ten@congty.vn"
                  autoComplete="email"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '0.7rem 0.875rem 0.7rem 2.5rem',
                    background: 'rgba(15,23,42,0.6)',
                    border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px', color: '#f8fafc',
                    fontSize: '0.9rem', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.6)'}
                  onBlur={e => e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '500', color: '#94a3b8' }}>
                Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: '#475569',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '0.7rem 2.75rem 0.7rem 2.5rem',
                    background: 'rgba(15,23,42,0.6)',
                    border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px', color: '#f8fafc',
                    fontSize: '0.9rem', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.6)'}
                  onBlur={e => e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', color: '#475569', cursor: 'pointer',
                    padding: '2px', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.65rem 0.875rem',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                color: '#fca5a5', fontSize: '0.82rem',
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.25rem',
                padding: '0.8rem',
                background: loading
                  ? 'rgba(59,130,246,0.5)'
                  : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none', borderRadius: '12px',
                color: 'white', fontSize: '0.95rem',
                fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.35)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', display: 'inline-block',
                  }} />
                  Đang đăng nhập...
                </>
              ) : 'Đăng nhập'}
            </button>

          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#334155', fontSize: '0.78rem', marginTop: '1.5rem' }}>
          © 2025 FDI Projects Management · Phiên bản nội bộ
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { from { transform: translateY(0px) scale(1); } to { transform: translateY(-20px) scale(1.05); } }
        input::placeholder { color: #334155; }
      `}</style>
    </div>
  );
};

export default LoginPage;
