import React, { useContext, useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus, User, FileText, X, LogOut } from 'lucide-react';
import { DocumentContext } from '../context/DocumentContext';

const Header = ({ currentView, onOpenForm, user, onLogout }) => {
  const { getNewCount, markAsRead, documents, userRole, toggleRole } = useContext(DocumentContext);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Người dùng';
  const userEmail = user?.email || '';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const [showNoti, setShowNoti] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notiRef = useRef(null);
  const userMenuRef = useRef(null);
  
  const newCount = getNewCount();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setShowNoti(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotiClick = () => {
    setShowNoti(!showNoti);
    setShowUserMenu(false);
    if (!showNoti && newCount > 0) {
      markAsRead();
    }
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
    setShowNoti(false);
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '500px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm tài liệu, dự án..." 
            className="input-field"
            style={{ paddingLeft: '36px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-surface-hover)', border: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {userRole === 'Admin' && currentView === 'dashboard' && (
          <button className="btn btn-primary" onClick={onOpenForm}>
            <Plus size={18} />
            <span>Tải lên tài liệu</span>
          </button>
        )}

        <div style={{ position: 'relative' }} ref={notiRef}>
          <button className="btn-icon" onClick={handleNotiClick} style={{ position: 'relative' }}>
            <Bell size={22} />
            {newCount > 0 && (
              <span style={{
                position: 'absolute', top: '4px', right: '4px', 
                width: '10px', height: '10px', backgroundColor: 'var(--color-danger)', 
                borderRadius: '50%', border: '2px solid var(--color-bg-surface)'
              }}></span>
            )}
          </button>
          
          {showNoti && (
            <div style={{
              position: 'absolute', top: '100%', right: '0', marginTop: '10px',
              width: '320px', backgroundColor: 'var(--color-bg-surface)', 
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)', zIndex: 100,
              padding: '1rem'
            }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>Thông báo</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                {documents.slice(0, 5).map(doc => (
                  <div key={doc.id} style={{ display: 'flex', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--color-bg-surface-hover)' }}>
                    <div style={{ 
                      width: '36px', height: '36px', borderRadius: '50%', 
                      backgroundColor: 'var(--color-primary-light)', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 
                    }}>
                      <FileText size={16} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', margin: '0', color: 'var(--color-text-main)' }}>
                        <span style={{ fontWeight: '600' }}>{doc.uploader}</span> vừa tải lên tài liệu: <strong>{doc.documentNumber}</strong>
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Mã: {doc.documentCode}</span>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Chưa có thông báo nào.</p>}
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <div 
            onClick={handleUserMenuClick}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--color-border)', paddingLeft: '1.5rem', cursor: 'pointer' }}
          >
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '50%', 
              backgroundColor: 'var(--color-bg-surface-hover)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' 
            }}>
              <User size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{displayName}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{userEmail}</span>
            </div>
          </div>
          
          {showUserMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: '0', marginTop: '10px',
              width: '340px', backgroundColor: 'var(--color-bg-surface)', 
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px', boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)', zIndex: 100,
              overflow: 'hidden'
            }}>
              {/* Top Bar */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 16px 8px', position: 'relative' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', fontWeight: '500' }}>
                  {userEmail}
                </span>
                <button onClick={() => setShowUserMenu(false)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Big Avatar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 20px 20px' }}>
                <div style={{ position: 'relative' }}>
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={displayName}
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                  ) : (
                    <div style={{ 
                      width: '80px', height: '80px', borderRadius: '50%', 
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '2rem', fontWeight: '700',
                      border: '1px solid var(--color-border)'
                    }}>
                      {avatarLetter}
                    </div>
                  )}
                </div>
                <h3 style={{ margin: '16px 0 8px', fontSize: '1.25rem', fontWeight: '400', color: 'var(--color-text-main)' }}>
                  Xin chào, {displayName}!
                </h3>
                <button style={{ 
                  background: 'transparent', border: '1px solid var(--color-border)', 
                  borderRadius: '100px', padding: '8px 16px', fontSize: '0.875rem', 
                  color: 'var(--color-text-main)', cursor: 'pointer', fontWeight: '500'
                }}>
                  Quản lý tài khoản
                </button>
              </div>

              {/* Actions */}
              <div style={{ backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: '24px 24px 0 0', padding: '8px 0 0' }}>
                <div 
                  onClick={() => { toggleRole(); setShowUserMenu(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ea4335', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {userRole === 'Admin' ? 'U' : 'A'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-main)' }}>Chuyển sang {userRole === 'Admin' ? 'Người Dùng' : 'Admin'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Demo tính năng</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px', cursor: 'pointer', color: 'var(--color-text-main)' }}>
                  <Plus size={20} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Thêm tài khoản khác</span>
                </div>
                
                <div
                  onClick={onLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px', cursor: 'pointer', color: '#f87171', borderTop: '1px solid var(--color-border)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={20} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Đăng xuất</span>
                </div>
              </div>
              
              <div style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-surface)' }}>
                <span style={{ cursor: 'pointer' }}>Chính sách bảo mật</span>
                <span>•</span>
                <span style={{ cursor: 'pointer' }}>Điều khoản dịch vụ</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
