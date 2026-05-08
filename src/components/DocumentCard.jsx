import React from 'react';
import { Calendar, Building, Link as LinkIcon, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const DocumentCard = ({ document, viewMode }) => {
  const { 
    documentCode, documentNumber, documentType, issuingAgency, effectiveDate, 
    summary, relatedProjects, attachmentLink, quickViewImage, isNew 
  } = document;

  const formattedDate = format(new Date(effectiveDate), 'dd/MM/yyyy', { locale: vi });

  if (viewMode === 'list') {
    return (
      <div className="card" style={{ display: 'flex', padding: '1rem', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ width: '120px', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
          <img src={quickViewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-blue">{documentCode}</span>
            {documentType && <span className="badge badge-yellow">{documentType}</span>}
            {isNew && <span className="badge badge-pink">Mới</span>}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '150px' }}>
          {relatedProjects.slice(0, 2).map((p, idx) => (
            <span key={idx} className="badge badge-green" style={{ fontSize: '0.7rem' }}>{p}</span>
          ))}
          {relatedProjects.length > 2 && <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>+{relatedProjects.length - 2} dự án khác</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href={attachmentLink} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '0.5rem' }} title="Tải xuống">
            <Download size={16} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ height: '160px', width: '100%', overflow: 'hidden', position: 'relative', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}>
        <img src={quickViewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {isNew && (
          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <span className="badge badge-pink" style={{ boxShadow: 'var(--shadow-sm)' }}>Mới cập nhật</span>
          </div>
        )}
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {relatedProjects.slice(0, 2).map((p, idx) => (
            <span key={idx} className="badge badge-green" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(168, 213, 186, 0.8)' }}>
              {p}
            </span>
          ))}
        </div>
      </div>
      
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600' }}>{documentCode}</span>
              {documentType && <span className="badge badge-yellow" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>{documentType}</span>}
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginTop: '0.25rem', marginBottom: '0' }}>Số: {documentNumber}</h3>
          </div>
        </div>

        <p style={{ color: 'var(--color-text-main)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {summary}
        </p>

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

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <button className="btn btn-primary" style={{ flex: 1 }}>
            <Eye size={16} /> Xem nhanh
          </button>
          <a href={attachmentLink} target="_blank" rel="noreferrer" className="btn btn-outline" title="Tải xuống tài liệu đính kèm">
            <LinkIcon size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
