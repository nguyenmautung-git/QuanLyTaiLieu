import React, { useState, useContext } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { DocumentContext } from '../context/DocumentContext';
import { ALL_PROJECTS, ALL_AGENCIES } from '../data';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

const DocumentForm = ({ onClose }) => {
  const { addDocument, documents, documentTypes } = useContext(DocumentContext);
  
  // Tự động tạo mã tài liệu
  const today = new Date();
  const dateStr = format(today, 'yyyy.MM.dd');
  const seqNumber = String(documents.length + 1).padStart(3, '0');
  const autoCode = `${dateStr}_${seqNumber}`;

  const [formData, setFormData] = useState({
    documentCode: autoCode,
    documentNumber: '',
    documentType: '',
    issuingAgency: '',
    effectiveDate: '',
    summary: '',
    relatedProjects: [],
    attachmentLink: '',
    quickViewImage: 'https://images.unsplash.com/photo-1568225367111-44052445b410?q=80&w=600&auto=format&fit=crop'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProjectToggle = (project) => {
    setFormData(prev => {
      const projects = [...prev.relatedProjects];
      if (projects.includes(project)) {
        return { ...prev, relatedProjects: projects.filter(p => p !== project) };
      } else {
        projects.push(project);
        return { ...prev, relatedProjects: projects };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDoc = {
      ...formData,
      id: uuidv4(),
      uploader: 'Quản Trị Viên',
      createdAt: new Date().toISOString(),
      isNew: true
    };
    addDocument(newDoc);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-surface-hover)', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={20} color="var(--color-primary)" />
            Tải lên tài liệu mới
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Mã lưu tài liệu (Tự động)</label>
              <input readOnly type="text" name="documentCode" value={formData.documentCode} className="input-field" style={{ backgroundColor: 'var(--color-bg-surface-hover)', color: 'var(--color-text-muted)' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Số tài liệu, văn bản</label>
              <input required type="text" name="documentNumber" value={formData.documentNumber} onChange={handleChange} className="input-field" placeholder="VD: 125/QĐ-BXD" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Phân loại tài liệu</label>
              <input required list="doc-types" name="documentType" value={formData.documentType} onChange={handleChange} className="input-field" placeholder="VD: Hồ sơ thiết kế, Công văn đi..." />
              <datalist id="doc-types">
                {documentTypes.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div className="form-group">
              <label className="form-label">Cơ quan ban hành</label>
              <input required list="agencies" name="issuingAgency" value={formData.issuingAgency} onChange={handleChange} className="input-field" placeholder="Chọn hoặc nhập mới" />
              <datalist id="agencies">
                {ALL_AGENCIES.map(a => <option key={a} value={a} />)}
              </datalist>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Ngày hiệu lực</label>
              <input required type="date" name="effectiveDate" value={formData.effectiveDate} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Trích yếu / Tóm tắt nội dung</label>
            <textarea required name="summary" value={formData.summary} onChange={handleChange} className="input-field" rows="3" placeholder="Nhập tóm tắt nội dung tài liệu..."></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Dự án liên quan (Có thể chọn nhiều)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface-hover)' }}>
              {ALL_PROJECTS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleProjectToggle(p)}
                  className={`badge ${formData.relatedProjects.includes(p) ? 'badge-blue' : ''}`}
                  style={{ 
                    border: formData.relatedProjects.includes(p) ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: formData.relatedProjects.includes(p) ? 'rgba(130, 168, 209, 0.15)' : 'white',
                    color: formData.relatedProjects.includes(p) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    cursor: 'pointer', padding: '0.375rem 0.75rem'
                  }}
                >
                  {formData.relatedProjects.includes(p) && <Check size={12} style={{ marginRight: '4px' }} />}
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Đường dẫn đính kèm (URL)</label>
            <input required type="url" name="attachmentLink" value={formData.attachmentLink} onChange={handleChange} className="input-field" placeholder="https://..." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy bỏ</button>
            <button type="submit" className="btn btn-primary"><Check size={18} /> Lưu tài liệu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentForm;
