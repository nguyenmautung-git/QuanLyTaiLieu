import React, { useContext, useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus, User } from 'lucide-react';
import { DocumentContext } from '../context/DocumentContext';

const Header = ({ currentView, onOpenForm }) => {
  const { getNewCount, markAsRead, documents, userRole, toggleRole } = useContext(DocumentContext);
  const [showNoti, setShowNoti] = useState(false);
  const notiRef = useRef(null);
  
  const newCount = getNewCount();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setShowNoti(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotiClick = () => {
    setShowNoti(!showNoti);
    if (!showNoti && newCount > 0) {
      markAsRead();
    }
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

        <div 
          onClick={toggleRole}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--color-border)', paddingLeft: '1.5rem', cursor: 'pointer' }}
          title="Nhấn để đổi quyền (Demo)"
        >
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '50%', 
            backgroundColor: 'var(--color-bg-surface-hover)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' 
          }}>
            <User size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{userRole === 'Admin' ? 'Quản Trị Viên' : 'Người Dùng'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{userRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// need import FileText for the notification
import { FileText } from 'lucide-react';

export default Header;
