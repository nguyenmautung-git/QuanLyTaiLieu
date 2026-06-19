import React, { useState, useContext } from 'react';
import { DocumentContext } from '../context/DocumentContext';
import { Calendar, Building, Link as LinkIcon, Download, Lock, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import DocumentForm from './DocumentForm';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getPastelColor } from '../data';

const DocumentCard = ({ document, viewMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const { userRole, deleteDocument, projects } = useContext(DocumentContext);
  const { 
    id, documentCode, documentNumber, documentType, issuingAgency, effectiveDate, 
    summary, relatedProjects, attachmentLink, attachments, accessLevels, quickViewImage, isNew 
  } = document;

  const formattedDate = format(new Date(effectiveDate), 'dd/MM/yyyy', { locale: vi });

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      deleteDocument(id);
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <div className="card" style={{ display: 'flex', padding: '1rem', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ width: '120px', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
          <img src={quickViewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-blue">{documentCode}</span>
            {documentType && <span className="badge badge-yellow">{documentType}</span>}
            {isNew && <span className="badge badge-pink">Mới</span>}
            {accessLevels && accessLevels.length > 0 && (
              <span className="badge" style={{ backgroundColor: 'rgba(240, 173, 78, 0.15)', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={12} /> Cấp {accessLevels.join(', ')}
              </span>
            )}
            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>Số: {documentNumber}</h3>
          </div>
          <p style={{ color: 'var(--color-text-main)', fontSize: '0.875rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {summary}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={14} /> {issuingAgency}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> Hiệu lực: {formattedDate}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
          {(attachments && attachments.length > 0) ? (
            <div style={{ display: 'flex', gap: '0.25rem', flexDirection: 'column' }}>
              {attachments.map((file, idx) => (
                <a key={idx} href={file.url} target="_blank" rel="noreferrer" className="badge" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.5rem' }} title={file.name}>
                  <Download size={12} /> <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                </a>
              ))}
            </div>
          ) : attachmentLink && (
            <a href={attachmentLink} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '0.5rem' }} title="Tải xuống">
              <Download size={16} />
            </a>
          )}
          {userRole === 'Admin' && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <button 
                className="btn-icon" 
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', width: '32px', height: '32px' }} 
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                title="Sửa thông tin"
              >
                <Edit size={16} />
              </button>
              <button 
                className="btn-icon" 
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid var(--color-border)', color: 'var(--color-danger)', width: '32px', height: '32px' }} 
                onClick={handleDelete}
                title="Xóa tài liệu"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      {isEditing && <DocumentForm initialData={document} onClose={() => setIsEditing(false)} />}
    </>
    );
  }

  return (
    <>
      <div 
        className="card" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          cursor: 'pointer', 
          transition: 'transform 0.2s ease, box-shadow 0.2s ease', 
          padding: 0, 
          overflow: 'hidden'
        }}
        onClick={() => setIsPreview(true)}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'; }}
      >
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {isNew && <span className="badge badge-pink" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>Mới</span>}
              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600' }}>{documentCode}</span>
              {documentType && <span className="badge badge-yellow" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>{documentType}</span>}
              {accessLevels && accessLevels.length > 0 && (
                <span className="badge" style={{ backgroundColor: 'rgba(240, 173, 78, 0.15)', color: '#d97706', fontSize: '0.65rem', padding: '0.15rem 0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={10} /> Cấp {accessLevels.join(', ')}
                </span>
              )}
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginTop: '0.25rem', marginBottom: '0' }}>Số: {documentNumber}</h3>
          </div>
          {userRole === 'Admin' && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                className="btn-icon" 
                style={{ backgroundColor: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', width: '32px', height: '32px' }} 
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                title="Sửa thông tin"
              >
                <Edit size={16} />
              </button>
              <button 
                className="btn-icon" 
                style={{ backgroundColor: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border)', color: 'var(--color-danger)', width: '32px', height: '32px' }} 
                onClick={handleDelete}
                title="Xóa tài liệu"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        <div 
          style={{ 
            color: 'var(--color-text-main)', 
            fontSize: '0.875rem', 
            marginBottom: '1rem', 
            flex: 1, 
            display: '-webkit-box', 
            WebkitLineClamp: 6, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden'
          }}
        >
          {summary}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
            <Building size={16} />
            <span style={{ fontWeight: '500', color: 'var(--color-text-main)' }}>{issuingAgency}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
            <Calendar size={16} />
            <span>Ngày hiệu lực: {formattedDate}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
            {(attachments && attachments.length > 0) ? (
              attachments.map((file, idx) => (
                <a key={idx} href={file.url} target="_blank" rel="noreferrer" className="badge" style={{ backgroundColor: 'var(--color-bg-body)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.5rem' }} title={file.name}>
                  <LinkIcon size={12} /> <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                </a>
              ))
            ) : attachmentLink && (
              <a href={attachmentLink} target="_blank" rel="noreferrer" className="badge" style={{ backgroundColor: 'var(--color-bg-body)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.5rem' }}>
                <LinkIcon size={12} /> Tải xuống tệp
              </a>
            )}
          </div>
        </div>
      </div>
      </div>
      {isEditing && <DocumentForm initialData={document} onClose={() => setIsEditing(false)} />}
      {isPreview && <DocumentForm initialData={document} previewMode={true} onClose={() => setIsPreview(false)} />}
    </>
  );
};

export default DocumentCard;
