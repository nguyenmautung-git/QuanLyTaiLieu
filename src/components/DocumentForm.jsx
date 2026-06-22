import React, { useState, useContext } from 'react';
import { X, Upload, Check, Calendar, ChevronDown } from 'lucide-react';
import { DocumentContext } from '../context/DocumentContext';
import { useToast } from '../context/UIContext';
import { ALL_AGENCIES, EMPLOYEE_LEVELS } from '../data';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, isValid } from 'date-fns';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const displayDate = (isoDateStr) => {
  if (!isoDateStr) return '';
  const parsed = parseISO(isoDateStr);
  return isValid(parsed) ? format(parsed, 'dd/MM/yyyy') : '';
};

const DocumentForm = ({ onClose, initialData, previewMode = false }) => {
  const { addDocument, editDocument, allDocuments: documents, documentTypes, allProjects: projects, legalSteps = [], checkPermission } = useContext(DocumentContext);
  const toast = useToast();
  
  const uniqueAgencies = Array.from(new Set([
    ...ALL_AGENCIES,
    ...(documents || []).map(d => d.issuingAgency).filter(Boolean)
  ])).sort();

  // Tự động tạo mã tài liệu theo ngày mới nhất và reset số thứ tự
  const today = new Date();
  const dateStr = format(today, 'dd.MM.yyyy');
  
  const todaysDocs = documents.filter(doc => doc.documentCode && doc.documentCode.startsWith(dateStr));
  let maxSeq = 0;
  todaysDocs.forEach(doc => {
    const parts = doc.documentCode.split('_');
    if (parts.length > 1) {
      const seq = parseInt(parts[1], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  });
  
  const seqNumber = String(maxSeq + 1).padStart(3, '0');
  const autoCode = `${dateStr}_${seqNumber}`;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dateInputText, setDateInputText] = useState(displayDate(initialData ? initialData.effectiveDate : ''));
  const [showAgencyDropdown, setShowAgencyDropdown] = useState(false);
  
  const [formData, setFormData] = useState(initialData || {
    documentCode: autoCode,
    documentNumber: '',
    documentType: '',
    issuingAgency: '',
    effectiveDate: '',
    summary: '',
    relatedProjects: [],
    accessLevels: [],
    attachmentLink: '',
    quickViewImage: 'https://images.unsplash.com/photo-1568225367111-44052445b410?q=80&w=600&auto=format&fit=crop',
    attachments: [],
    legalStepId: ''
  });
  
  const isEdit = !!(initialData && initialData.id);
  const permissionKey = isEdit ? 'edit_docs' : 'add_docs';
  const visibleProjects = projects.filter(p => 
    previewMode || 
    checkPermission(p.id, permissionKey) || 
    formData.relatedProjects.includes(p.name)
  );

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

  const handleAccessLevelToggle = (levelId) => {
    setFormData(prev => {
      let levels = [...prev.accessLevels];
      if (levels.includes(levelId)) {
        levels = levels.filter(l => l !== levelId);
      } else {
        levels.push(levelId);
        EMPLOYEE_LEVELS.forEach(lvl => {
          if (lvl.id > levelId && !levels.includes(lvl.id)) {
            levels.push(lvl.id);
          }
        });
      }
      return { ...prev, accessLevels: levels };
    });
  };

  const removeOldAttachment = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const hasOldAttachments = formData.attachments && formData.attachments.length > 0;
    if (selectedFiles.length === 0 && !formData.attachmentLink && !hasOldAttachments) {
      toast.warning('Vui lòng chọn file đính kèm!');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let attachmentsData = formData.attachments || [];
      
      // Hỗ trợ lưu link đơn cho tương thích ngược nếu nhập tay (mặc dù hiện tại đã đổi sang form file)
      if (formData.attachmentLink && !initialData) {
        attachmentsData.push({ name: 'Link liên kết', url: formData.attachmentLink });
      }

      // Upload tất cả các file đã chọn lên Firebase Storage
      if (selectedFiles.length > 0) {
        const withTimeout = (promise, ms) =>
          Promise.race([
            promise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('TIMEOUT')), ms)
            ),
          ]);

        const uploadedFiles = await Promise.all(
          selectedFiles.map(async (file) => {
            const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`);
            const snapshot = await withTimeout(uploadBytes(storageRef, file), 20000);
            const url = await getDownloadURL(snapshot.ref);
            return { name: file.name, url };
          })
        );
        
        attachmentsData = [...attachmentsData, ...uploadedFiles];
      }

      const newDoc = {
        ...formData,
        attachments: attachmentsData, // Lưu dưới dạng mảng
        uploader: initialData ? initialData.uploader : 'Quản Trị Viên',
        createdAt: initialData ? initialData.createdAt : new Date().toISOString(),
        isNew: initialData ? initialData.isNew : true
      };
      
      // Xóa attachmentLink cũ khỏi db để tránh nhầm lẫn
      delete newDoc.attachmentLink;
      
      if (initialData) {
        await editDocument(initialData.id, newDoc);
      } else {
        newDoc.id = uuidv4();
        await addDocument(newDoc);
      }
      onClose();
    } catch (error) {
      toast.error('Lỗi khi lưu tài liệu: ' + (error.message || 'Vui lòng thử lại!'));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-surface-hover)', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={20} color="var(--color-primary)" />
            {previewMode ? 'Xem thông tin tài liệu' : (initialData ? 'Sửa thông tin tài liệu' : 'Tải lên tài liệu mới')}
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
              <label className="form-label">Số tài liệu, văn bản {(!previewMode) && <span style={{ color: 'var(--color-danger)' }}>*</span>}</label>
              <input disabled={previewMode} required type="text" name="documentNumber" value={formData.documentNumber} onChange={handleChange} className="input-field" placeholder="VD: 125/QĐ-BXD" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Phân loại tài liệu {(!previewMode) && <span style={{ color: 'var(--color-danger)' }}>*</span>}</label>
              <select disabled={previewMode} required name="documentType" value={formData.documentType} onChange={handleChange} className="input-field">
                <option value="">-- Chọn phân loại --</option>
                {documentTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cơ quan ban hành {(!previewMode) && <span style={{ color: 'var(--color-danger)' }}>*</span>}</label>
              <div style={{ position: 'relative' }}>
                <input 
                  disabled={previewMode} 
                  required 
                  name="issuingAgency" 
                  value={formData.issuingAgency} 
                  onChange={handleChange} 
                  onFocus={() => setShowAgencyDropdown(true)}
                  onBlur={() => setShowAgencyDropdown(false)}
                  className="input-field" 
                  placeholder="Chọn hoặc nhập mới" 
                  style={{ paddingRight: !previewMode ? '2rem' : undefined }}
                  autoComplete="off"
                />
                {!previewMode && (
                  <button 
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowAgencyDropdown(!showAgencyDropdown);
                    }}
                    style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: '4px' }}
                  >
                    <ChevronDown size={18} />
                  </button>
                )}
                {showAgencyDropdown && !previewMode && uniqueAgencies.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--color-bg-surface)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', marginTop: '4px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}>
                    {uniqueAgencies.map((agency, idx) => (
                      <div 
                        key={idx}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setFormData(prev => ({ ...prev, issuingAgency: agency }));
                          setShowAgencyDropdown(false);
                        }}
                        style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: idx < uniqueAgencies.length - 1 ? '1px solid var(--color-bg-surface-hover)' : 'none', color: 'var(--color-text-main)' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {agency}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
            <div className="form-group" style={{ position: 'relative', marginBottom: 0 }}>
              <label className="form-label">Ngày hiệu lực {(!previewMode) && <span style={{ color: 'var(--color-danger)' }}>*</span>}</label>
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <input 
                  disabled={previewMode} 
                  type="text" 
                  className="input-field" 
                  value={dateInputText} 
                  onChange={(e) => {
                    const text = e.target.value;
                    setDateInputText(text);
                    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
                    const match = text.match(regex);
                    if (match) {
                      const d = parseInt(match[1], 10);
                      const m = parseInt(match[2], 10);
                      const y = parseInt(match[3], 10);
                      if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1000) {
                        const isoStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        setFormData(prev => ({ ...prev, effectiveDate: isoStr }));
                      }
                    }
                  }}
                  onBlur={() => {
                    if (formData.effectiveDate) {
                      setDateInputText(displayDate(formData.effectiveDate));
                    } else {
                      setDateInputText('');
                    }
                  }}
                  placeholder="dd/mm/yyyy" 
                  style={{ paddingRight: !previewMode ? '2.5rem' : '1rem' }}
                />
                {!previewMode && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      const dateInput = e.currentTarget.nextElementSibling;
                      if (dateInput && dateInput.showPicker) {
                        try { dateInput.showPicker(); } catch (err) {}
                      }
                    }}
                    style={{ position: 'absolute', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', padding: '4px' }}
                  >
                    <Calendar size={18} />
                  </button>
                )}
                {!previewMode && (
                  <input 
                    required 
                    type="date" 
                    name="effectiveDate" 
                    value={formData.effectiveDate} 
                    onChange={(e) => {
                      handleChange(e);
                      setDateInputText(displayDate(e.target.value));
                    }}
                    style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0, pointerEvents: 'none', width: '10px', height: '10px', padding: 0, margin: 0, border: 0 }} 
                  />
                )}
              </div>
            </div>

            {/* Bước pháp lý */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Bước pháp lý liên quan</label>
              <select
                disabled={previewMode}
                name="legalStepId"
                value={formData.legalStepId || ''}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">-- Chọn bước pháp lý --</option>
                {projects
                  .filter(p => (formData.relatedProjects || []).includes(p.name))
                  .map(p => {
                    const stepsOfProject = legalSteps
                      .filter(s => s.projectId === p.id || s.projectId === p.id?.toString())
                      .sort((a, b) => (a.order || 0) - (b.order || 0));
                    if (!stepsOfProject.length) return null;
                    return (
                      <optgroup key={p.id} label={`📁 ${p.name}`}>
                        {stepsOfProject.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.order != null ? `${s.order + 1}. ` : ''}{s.name}
                            {s.status === 'done' ? ' ✅' : s.status === 'inprogress' ? ' 🟡' : ' ⚪'}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })
                }
                {(formData.relatedProjects || []).length === 0 && legalSteps.map(s => {
                  const proj = projects.find(p => p.id === s.projectId || p.id?.toString() === s.projectId);
                  return (
                    <option key={s.id} value={s.id}>
                      [{proj?.code || 'N/A'}] {s.name}
                    </option>
                  );
                })}
              </select>
              {formData.legalStepId && (() => {
                const step = legalSteps.find(s => s.id === formData.legalStepId);
                if (!step) return null;
                const statusLabel = step.status === 'done' ? '✅ Hoàn thành' : step.status === 'inprogress' ? '🟡 Đang thực hiện' : '⚪ Chưa thực hiện';
                return (
                  <div style={{ marginTop: '0.4rem', padding: '4px 8px', backgroundColor: '#eff6ff', borderRadius: '6px', fontSize: '0.72rem', color: '#2563eb' }}>
                    📌 {step.name} · {statusLabel}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Trích yếu / Tóm tắt nội dung {(!previewMode) && <span style={{ color: 'var(--color-danger)' }}>*</span>}</label>
            {previewMode ? (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', lineHeight: '1.5' }}>
                {formData.summary}
              </div>
            ) : (
              <textarea required name="summary" value={formData.summary} onChange={handleChange} className="input-field" rows="3" placeholder="Nhập tóm tắt nội dung tài liệu..."></textarea>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Dự án liên quan (Có thể chọn nhiều)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface-hover)' }}>
              {visibleProjects.map(p => (
                <button
                  disabled={previewMode}
                  key={p.id}
                  type="button"
                  onClick={() => handleProjectToggle(p.name)}
                  className={`badge ${formData.relatedProjects.includes(p.name) ? 'badge-blue' : ''}`}
                  style={{ 
                    border: formData.relatedProjects.includes(p.name) ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: formData.relatedProjects.includes(p.name) ? 'rgba(130, 168, 209, 0.15)' : 'white',
                    color: formData.relatedProjects.includes(p.name) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    cursor: previewMode ? 'default' : 'pointer', padding: '0.375rem 0.75rem'
                  }}
                >
                  {formData.relatedProjects.includes(p.name) && <Check size={12} style={{ marginRight: '4px' }} />}
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quyền truy cập tài liệu (Tùy chọn: Chọn cấp bậc để giới hạn)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface-hover)' }}>
              {EMPLOYEE_LEVELS.map(lvl => (
                <button
                  disabled={previewMode}
                  key={lvl.id}
                  type="button"
                  onClick={() => handleAccessLevelToggle(lvl.id)}
                  title={lvl.fullName}
                  className={`badge ${formData.accessLevels.includes(lvl.id) ? 'badge-yellow' : ''}`}
                  style={{ 
                    border: formData.accessLevels.includes(lvl.id) ? '1px solid #d97706' : '1px solid var(--color-border)',
                    backgroundColor: formData.accessLevels.includes(lvl.id) ? 'rgba(240, 173, 78, 0.15)' : 'white',
                    color: formData.accessLevels.includes(lvl.id) ? '#d97706' : 'var(--color-text-muted)',
                    cursor: previewMode ? 'default' : 'pointer', padding: '0.375rem 0.75rem'
                  }}
                >
                  {formData.accessLevels.includes(lvl.id) && <Check size={12} style={{ marginRight: '4px' }} />}
                  {lvl.shortName}
                </button>
              ))}
            </div>
            {formData.accessLevels.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>* Để trống: Tất cả mọi người đều có thể xem.</span>}
          </div>

          {!previewMode && (
            <div className="form-group">
              <label className="form-label">Tài liệu đính kèm mới (Tuỳ chọn nếu đã có) <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input 
                required={(!formData.attachments || formData.attachments.length === 0) && selectedFiles.length === 0} 
                type="file" 
                multiple
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))} 
                className="input-field" 
                style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-surface-hover)' }}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              />
              {formData.attachments && formData.attachments.length > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  <div style={{ marginBottom: '0.25rem' }}>Tệp cũ đã lưu:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {formData.attachments.map((f, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ wordBreak: 'break-all' }}>{f.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeOldAttachment(idx)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.125rem' }}
                          title="Xóa tệp này"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedFiles.length > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  Đã chọn {selectedFiles.length} tệp mới:
                  <ul style={{ paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                    {selectedFiles.map((file, i) => (
                      <li key={i}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {previewMode && formData.attachments && formData.attachments.length > 0 && (
            <div className="form-group">
              <label className="form-label">Tài liệu đính kèm</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {formData.attachments.map((file, idx) => (
                  <a key={idx} href={file.url} target="_blank" rel="noreferrer" className="badge" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem', width: 'fit-content' }} title={file.name}>
                    {file.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            {previewMode ? (
              <button type="button" className="btn btn-primary" onClick={onClose}>Đóng</button>
            ) : (
              <>
                <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>Hủy bỏ</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  <Check size={18} /> {isSubmitting ? 'Đang lưu...' : 'Lưu tài liệu'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentForm;
