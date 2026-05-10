import React from 'react';
import { X, Calendar, Building, Download, Lock, Check } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const DocumentDetailModal = ({ document, onClose }) => {
  if (!document) return null;
  const { 
    documentCode, documentNumber, documentType, issuingAgency, effectiveDate, 
    summary, relatedProjects, attachmentLink, attachments, accessLevels, quickViewImage, isNew 
  } = document;

  const formattedDate = format(new Date(effectiveDate), 'dd/MM/yyyy', { locale: vi });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', maxWidth: '800px', height: '85vh' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-surface-hover)', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Chi tiết tài liệu: {documentCode}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <img src={quickViewImage} alt="Preview" style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
            </div>
            
            <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  {documentType && <span className="badge badge-yellow">{documentType}</span>}
                  {isNew && <span className="badge badge-pink">Mới</span>}
                  {accessLevels && accessLevels.length > 0 && (
                    <span className="badge" style={{ backgroundColor: 'rgba(240, 173, 78, 0.15)', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} /> Cấp {accessLevels.join(', ')}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Số: {documentNumber}</h3>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <p style={{ margin: 0, fontWeight: '500', color: 'var(--color-text-main)' }}>Trích yếu:</p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>{summary}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                 <div>
                   <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Cơ quan ban hành</p>
                   <p style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building size={16} color="var(--color-primary)" /> {issuingAgency}</p>
                 </div>
                 <div>
                   <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Ngày hiệu lực</p>
                   <p style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} color="var(--color-primary)" /> {formattedDate}</p>
                 </div>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

          <div>
             <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Dự án liên quan</h4>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {relatedProjects && relatedProjects.map((p, idx) => (
                  <span key={idx} className="badge badge-green" style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}><Check size={14} style={{ marginRight: '0.25rem' }} /> {p}</span>
                ))}
             </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

          <div>
             <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Tệp đính kèm</h4>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {(attachments && attachments.length > 0) ? (
                  attachments.map((file, idx) => (
                    <a key={idx} href={file.url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Download size={16} /> {file.name}
                    </a>
                  ))
                ) : attachmentLink ? (
                  <a href={attachmentLink} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={16} /> Tải xuống tệp
                  </a>
                ) : (
                  <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Không có tệp đính kèm nào.</p>
                )}
             </div>
          </div>

        </div>
        
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--color-bg-surface-hover)', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
          <button className="btn btn-primary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailModal;
