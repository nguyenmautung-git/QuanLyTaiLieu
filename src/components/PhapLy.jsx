import React, { useState, useContext, useRef } from 'react';
import { DocumentContext } from '../context/DocumentContext';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Edit2, Trash2, X, Check, Clock, Circle, ChevronDown, ChevronUp, AlertCircle, Save, Paperclip, FileText, Download, Loader, ArrowUp, ArrowDown } from 'lucide-react';

// Danh sách các bước pháp lý mặc định cho dự án xây dựng VN
const DEFAULT_STEPS = [
  'Phê duyệt chủ trương đầu tư',
  'Phê duyệt dự án đầu tư (Quyết định đầu tư)',
  'Chấp thuận địa điểm xây dựng',
  'Phê duyệt quy hoạch chi tiết 1/500',
  'Cấp phép xây dựng',
  'Thẩm duyệt thiết kế PCCC',
  'Phê duyệt thiết kế bản vẽ thi công',
  'Nghiệm thu hoàn thành công trình',
  'Bàn giao đưa vào sử dụng',
];

const STATUS_CONFIG = {
  done:       { label: 'Hoàn thành', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', icon: Check },
  inprogress: { label: 'Đang thực hiện', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock },
  pending:    { label: 'Chưa thực hiện', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', icon: Circle },
};

/* ─── Step Badge ─── */
const StepBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '20px', backgroundColor: cfg.bg, color: cfg.color, fontSize: '0.7rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
};

/* ─── Workflow Step Row ─── */
const StepRow = ({ step, index, total, onEdit, onDelete, onMoveUp, onMoveDown, isAdmin, partners }) => {
  const cfg = STATUS_CONFIG[step.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const attachments = step.attachments || [];

  return (
    <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
      {/* Up/Down buttons - chỉ Admin mới thấy */}
      {isAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '2px', flexShrink: 0, paddingTop: '4px' }}>
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            title="Di chuyển lên"
            style={{
              width: '20px', height: '20px', borderRadius: '4px', border: 'none', cursor: isFirst ? 'not-allowed' : 'pointer',
              backgroundColor: isFirst ? 'transparent' : 'var(--color-bg-surface-hover)',
              color: isFirst ? 'var(--color-border)' : 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { if (!isFirst) { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.color = 'white'; }}}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = isFirst ? 'transparent' : 'var(--color-bg-surface-hover)'; e.currentTarget.style.color = isFirst ? 'var(--color-border)' : 'var(--color-text-muted)'; }}
          >
            <ArrowUp size={11} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            title="Di chuyển xuống"
            style={{
              width: '20px', height: '20px', borderRadius: '4px', border: 'none', cursor: isLast ? 'not-allowed' : 'pointer',
              backgroundColor: isLast ? 'transparent' : 'var(--color-bg-surface-hover)',
              color: isLast ? 'var(--color-border)' : 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { if (!isLast) { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.color = 'white'; }}}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = isLast ? 'transparent' : 'var(--color-bg-surface-hover)'; e.currentTarget.style.color = isLast ? 'var(--color-border)' : 'var(--color-text-muted)'; }}
          >
            <ArrowDown size={11} />
          </button>
        </div>
      )}

      {/* Connector line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '28px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: cfg.bg, border: `2px solid ${cfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
          <Icon size={13} color={cfg.color} />
        </div>
        {!isLast && <div style={{ width: '2px', flex: 1, backgroundColor: step.status === 'done' ? 'var(--color-success)' : 'var(--color-border)', minHeight: '20px', marginTop: '2px' }} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : '1rem' }}>
        {/* Row 1: Tên bước — full width */}
        <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--color-text-main)', marginBottom: '6px' }}>
          {step.name}
        </div>

        {/* Row 2: Ngày mục tiêu, Ngày hiệu lực | Trạng thái + Sửa/Xóa */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            {step.targetDate && <div>🎯 Mục tiêu: {step.targetDate}</div>}
            {step.effectiveDate && <div>📅 Hiệu lực: {step.effectiveDate}</div>}
            {step.implementingUnit && <div>🏢 ĐVTH: {partners?.find(p => p.id === step.implementingUnit)?.name || step.implementingUnit}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <StepBadge status={step.status} />
            {isAdmin && (
              <>
                <button className="btn-icon" onClick={() => onEdit(step)} style={{ color: 'var(--color-primary)', padding: '3px' }} title="Sửa"><Edit2 size={13} /></button>
                <button className="btn-icon" onClick={() => onDelete(step.id)} style={{ color: 'var(--color-danger)', padding: '3px' }} title="Xóa"><Trash2 size={13} /></button>
              </>
            )}
          </div>
        </div>

        {/* Row 3: Attachments */}
        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
            {attachments.map((att, i) => (
              <a key={i} href={att.url} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', fontSize: '0.7rem', textDecoration: 'none', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <Paperclip size={10} /> {att.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Project Legal Card ─── */
const ProjectLegalCard = ({ project, steps, isAdmin, onAddStep, onEditStep, onDeleteStep, onMoveStep, partners }) => {
  const [expanded, setExpanded] = useState(false);
  const done = steps.filter(s => s.status === 'done').length;
  const progress = steps.length > 0 ? Math.round((done / steps.length) * 100) : 0;
  const sorted = [...steps].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="card" style={{ overflow: 'hidden' }}>

      {/* Header image */}
      <div style={{ position: 'relative', height: '140px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' }}>
        {project.image
          ? <img src={project.image} alt={project.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', fontSize: '2rem' }}>🏗️</div>
        }
        <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.55)', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', backdropFilter: 'blur(4px)' }}>
          {project.code || 'N/A'}
        </div>
        <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: progress === 100 ? '#10b981' : 'rgba(0,0,0,0.55)', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', backdropFilter: 'blur(4px)' }}>
          {progress}% hoàn thành
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1rem' }}>
        <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-text-main)', marginBottom: '0.5rem', lineHeight: '1.3' }}>{project.name}</h3>
        <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--color-bg-surface-hover)', marginBottom: '0.75rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, borderRadius: '3px', background: progress === 100 ? 'var(--color-success)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)', transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
          {done}/{steps.length} bước pháp lý • {steps.filter(s => s.status === 'inprogress').length} đang thực hiện
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isAdmin && (
            <button className="btn btn-outline" onClick={() => onAddStep(project)} style={{ fontSize: '0.78rem', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
              <Plus size={13} /> Thêm bước
            </button>
          )}
          <button onClick={() => setExpanded(v => !v)} style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
            {expanded ? <><ChevronUp size={14} /> Thu gọn</> : <><ChevronDown size={14} /> Xem workflow</>}
          </button>
        </div>

        {expanded && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            {sorted.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', padding: '1rem 0' }}>Chưa có bước pháp lý nào. {isAdmin && 'Nhấn "+ Thêm bước" để bắt đầu.'}</div>
              : sorted.map((step, i) => (
                <StepRow
                  key={step.id}
                  step={step}
                  index={i}
                  total={sorted.length}
                  isAdmin={isAdmin}
                  onEdit={onEditStep}
                  onDelete={onDeleteStep}
                  onMoveUp={() => onMoveStep(sorted, i, i - 1)}
                  onMoveDown={() => onMoveStep(sorted, i, i + 1)}
                  partners={partners}
                />
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Step Form Modal ─── */
const StepFormModal = ({ project, editingStep, onClose, onSave, savedCount, partners }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [savedMsg, setSavedMsg] = useState(false);

  const blankForm = {
    name: '',
    status: 'pending',
    effectiveDate: '',
    targetDate: '',
    implementingUnit: '',
    summary: '',
    order: 0,
    attachments: [],
  };

  const [form, setForm] = useState(
    editingStep
      ? {
          name: editingStep.name || '',
          status: editingStep.status || 'pending',
          effectiveDate: editingStep.effectiveDate || editingStep.completedDate || '',
          targetDate: editingStep.targetDate || '',
          implementingUnit: editingStep.implementingUnit || '',
          summary: editingStep.summary || editingStep.note || '',
          order: editingStep.order ?? 0,
          attachments: editingStep.attachments || [],
        }
      : blankForm
  );

  // Reset form khi savedCount tăng (chỉ khi đang thêm mới, không phải edit)
  React.useEffect(() => {
    if (!editingStep && savedCount > 0) {
      setForm(blankForm);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    }
  }, [savedCount]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setUploadError('');

    const withTimeout = (promise, ms) =>
      Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), ms)
        ),
      ]);

    try {
      const newAtts = await Promise.all(
        files.map(async (file) => {
          const storageRef = ref(storage, `legalSteps/${Date.now()}_${file.name}`);
          const snapshot = await withTimeout(uploadBytes(storageRef, file), 20000);
          const url = await getDownloadURL(snapshot.ref);
          return { name: file.name, url };
        })
      );
      setForm(f => ({ ...f, attachments: [...f.attachments, ...newAtts], status: 'done' }));
    } catch (err) {
      console.error('Upload error:', err);
      if (err.message === 'TIMEOUT' || err.code === 'storage/unauthorized') {
        setUploadError('Firebase Storage chưa cho phép upload. Vào Firebase Console → Storage → Rules → đổi thành: allow read, write: if true;');
      } else {
        setUploadError(`Lỗi tải lên: ${err.message || 'Vui lòng thử lại'}`);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (idx) => {
    setForm(f => ({ ...f, attachments: f.attachments.filter((_, i) => i !== idx) }));
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await onSave(form);
    } catch (error) {
      // Error is already alerted in parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontWeight: '700', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="var(--color-primary)" />
            {editingStep ? 'Sửa bước pháp lý' : 'Thêm bước pháp lý mới'}
          </h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '1rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: '8px' }}>
          📁 Dự án: <strong>{project.name}</strong>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tên bước pháp lý <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <input list="step-suggestions" className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Cấp phép xây dựng..." />
            <datalist id="step-suggestions">
              {DEFAULT_STEPS.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ngày mục tiêu</label>
              <input type="date" className="input-field" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ngày hiệu lực</label>
              <input type="date" className="input-field" value={form.effectiveDate} onChange={e => setForm({ ...form, effectiveDate: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Trạng thái</label>
              <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="pending">⚪ Chưa thực hiện</option>
                <option value="inprogress">🟡 Đang thực hiện</option>
                <option value="done">🟢 Hoàn thành</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Đơn vị thực hiện</label>
              <select className="input-field" value={form.implementingUnit} onChange={e => setForm({ ...form, implementingUnit: e.target.value })}>
                <option value="">-- Chọn đối tác --</option>
                {partners?.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Trích yếu</label>
            <textarea rows={3} className="input-field" value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} placeholder="Nội dung trích yếu của bước pháp lý này..." style={{ resize: 'vertical' }} />
          </div>

          {savedMsg && (
            <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ✅ Đã lưu! Nhập tiếp bước pháp lý mới...
            </div>
          )}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tệp đính kèm</label>
            <div style={{ border: '1px dashed var(--color-border)', borderRadius: '8px', padding: '0.75rem', backgroundColor: 'var(--color-bg-surface)' }}>
              <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
              <button type="button" className="btn btn-outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' }}>
                {uploading ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Đang tải lên...</> : <><Paperclip size={14} /> Chọn tệp đính kèm</>}
              </button>
              {uploadError && (
                <div style={{ marginTop: '0.5rem', padding: '6px 10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: '6px', fontSize: '0.75rem', color: '#f87171' }}>
                  ⚠️ {uploadError}
                </div>
              )}
              {form.attachments.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {form.attachments.map((att, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', backgroundColor: 'rgba(59, 130, 246, 0.15)', borderRadius: '6px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#93c5fd', overflow: 'hidden' }}>
                        <FileText size={12} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <a href={att.url} target="_blank" rel="noreferrer" style={{ color: '#93c5fd' }} title="Tải xuống"><Download size={12} /></a>
                        <button type="button" onClick={() => removeAttachment(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 0 }} title="Xóa"><X size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-outline" onClick={onClose} disabled={isSaving}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSaveClick} style={{ display: 'flex', alignItems: 'center', gap: '6px' }} disabled={!form.name.trim() || uploading || isSaving}>
            {isSaving ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
            {editingStep ? 'Cập nhật' : 'Lưu bước'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
const PhapLy = () => {
  const { projects, legalSteps, addLegalStep, updateLegalStep, deleteLegalStep, userRole, partners } = useContext(DocumentContext);
  const isAdmin = userRole === 'Admin';
  const [addingToProject, setAddingToProject] = useState(null);
  const [editingStep, setEditingStep] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  const [savedCount, setSavedCount] = useState(0);

  const handleSave = async (form) => {
    try {
      if (editingStep) {
        await updateLegalStep(editingStep.id, form);
        setEditingStep(null);
        setEditingProject(null);
      } else {
        const projectSteps = legalSteps.filter(s => s.projectId === addingToProject.id || s.projectId === addingToProject.id?.toString());
        const maxOrder = projectSteps.reduce((max, s) => Math.max(max, s.order ?? 0), -1);
        await addLegalStep(addingToProject.id, { ...form, order: maxOrder + 1 });
        setSavedCount(c => c + 1); // reset form, giữ modal mở
      }
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      alert("Đã có lỗi xảy ra khi lưu: " + err.message + "\n(Vui lòng kiểm tra quyền ghi của Firebase Firestore hoặc kết nối mạng)");
      throw err;
    }
  };

  const handleEdit = (project, step) => {
    setEditingProject(project);
    setEditingStep(step);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bước pháp lý này?')) {
      await deleteLegalStep(id);
    }
  };

  // Di chuyển vị trí và cập nhật lại order cho tất cả các item nếu cần để sửa lỗi trùng order
  const handleMoveStep = async (sortedSteps, fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= sortedSteps.length) return;
    const newSteps = [...sortedSteps];
    const [moved] = newSteps.splice(fromIdx, 1);
    newSteps.splice(toIdx, 0, moved);

    const promises = [];
    newSteps.forEach((step, index) => {
      if (step.order !== index) {
        promises.push(updateLegalStep(step.id, { ...step, order: index }));
      }
    });
    await Promise.all(promises);
  };

  return (
    <div className="fade-in" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>⚖️ Pháp lý dự án</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Theo dõi tiến trình pháp lý của {projects.length} dự án — {legalSteps.filter(s => s.status === 'done').length} bước đã hoàn thành / {legalSteps.length} tổng số bước
        </p>
      </div>

      {/* Cards grid */}
      {projects.length === 0
        ? <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>Chưa có dự án nào. Vui lòng tạo dự án ở trang "Dự án".</div>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            {projects.map(project => {
              const steps = legalSteps.filter(s => s.projectId === project.id || s.projectId === project.id?.toString());
              return (
                <ProjectLegalCard
                  key={project.id}
                  project={project}
                  steps={steps}
                  isAdmin={isAdmin}
                  onAddStep={(p) => setAddingToProject(p)}
                  onEditStep={(step) => handleEdit(project, step)}
                  onDeleteStep={handleDelete}
                  onMoveStep={handleMoveStep}
                  partners={partners}
                />
              );
            })}
          </div>
        )
      }

      {/* Modal */}
      {(addingToProject || editingStep) && (
        <StepFormModal
          project={editingProject || addingToProject}
          editingStep={editingStep}
          onClose={() => { setAddingToProject(null); setEditingStep(null); setEditingProject(null); setSavedCount(0); }}
          onSave={handleSave}
          savedCount={savedCount}
          partners={partners}
        />
      )}
    </div>
  );
};

export default PhapLy;
