import React, { useState, useContext } from 'react';
import { DocumentContext } from '../context/DocumentContext';
import { getPastelColor } from '../data';
import {
  MapPin, Building, Plus, Edit2, Trash2, X, Save,
  ChevronDown, ChevronUp, Briefcase
} from 'lucide-react';

// ─── Cột bảng KHLCNT ───────────────────────────────────────────────────────
const EMPTY_PACKAGE = () => ({
  id: Date.now() + Math.random(),
  investor: '',
  name: '',
  summary: '',
  price: '',
  fundSource: '',
  selectionMethod: '',
  procurementMethod: '',
  organizationTime: '',
  startTime: '',
  contractType: '',
  implementationTime: '',
  optionToBuy: '',
});

const METHOD_OPTIONS = ['Đấu thầu rộng rãi', 'Đấu thầu hạn chế', 'Chỉ định thầu', 'Mua sắm trực tiếp', 'Chào hàng cạnh tranh', 'Tự thực hiện'];
const PROCUREMENT_OPTIONS = ['Một giai đoạn một túi hồ sơ', 'Một giai đoạn hai túi hồ sơ', 'Hai giai đoạn'];
const CONTRACT_OPTIONS = ['Hợp đồng trọn gói', 'Hợp đồng theo đơn giá cố định', 'Hợp đồng theo đơn giá điều chỉnh', 'Hợp đồng theo thời gian', 'Hợp đồng theo chi phí cộng phí'];

// Theo Luật Đầu tư công và Luật Đấu thầu hiện hành
const FUND_SOURCE_OPTIONS = [
  'Vốn ngân sách nhà nước',
  'Vốn trái phiếu Chính phủ',
  'Vốn ODA và vốn vay ưu đãi của nhà tài trợ nước ngoài',
  'Vốn tín dụng đầu tư phát triển của Nhà nước',
  'Vốn đầu tư từ nguồn thu để lại chưa đưa vào cân đối NSNN',
  'Vốn của doanh nghiệp nhà nước',
  'Vốn hỗn hợp (NSNN + vốn doanh nghiệp)',
  'Vốn hợp tác công tư (PPP)',
  'Vốn tư nhân',
  'Nguồn vốn hợp pháp khác',
];

// ─── Helpers ───────────────────────────────────────────────────────────────
const formatPrice = (val) => {
  // Only format digits
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('vi-VN'); // uses dots as thousands sep
};
const unformatPrice = (val) => String(val).replace(/\./g, '').replace(/,/g, '');

// ─── Modal thêm/sửa gói thầu ───────────────────────────────────────────────
const PackageModal = ({ pkg, project, onClose, onSave }) => {
  const [form, setForm] = useState(pkg || EMPTY_PACKAGE());
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', padding: '2rem', overflowY: 'auto', maxHeight: '90vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontWeight: '700', fontSize: '1.1rem' }}>
            {pkg ? '✏️ Sửa gói thầu' : '➕ Thêm gói thầu mới'}
          </h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Banner tên dự án */}
        {project && (
          <div style={{ padding: '0.5rem 0.75rem', marginBottom: '1rem', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📁 Dự án: <strong style={{ color: 'var(--color-text-main)' }}>{project.name}</strong>
            {project.code && <span className="badge badge-blue" style={{ fontSize: '0.7rem', marginLeft: '4px' }}>{project.code}</span>}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Tên gói thầu */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tên gói thầu <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nhập tên gói thầu..." />
          </div>

          {/* Tóm tắt công việc */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tóm tắt công việc chính của gói thầu</label>
            <textarea className="input-field" rows={2} value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="Mô tả ngắn gọn..." style={{ resize: 'vertical' }} />
          </div>

          {/* Giá & Nguồn vốn */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Giá gói thầu (VNĐ)</label>
              <input
                className="input-field"
                value={formatPrice(form.price)}
                onChange={e => set('price', unformatPrice(e.target.value))}
                placeholder="VD: 5.000.000.000"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nguồn vốn</label>
              <select className="input-field" value={form.fundSource} onChange={e => set('fundSource', e.target.value)}>
                <option value="">-- Chọn --</option>
                {FUND_SOURCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Hình thức & Phương thức */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Hình thức lựa chọn nhà thầu</label>
              <select className="input-field" value={form.selectionMethod} onChange={e => set('selectionMethod', e.target.value)}>
                <option value="">-- Chọn --</option>
                {METHOD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phương thức lựa chọn nhà thầu</label>
              <select className="input-field" value={form.procurementMethod} onChange={e => set('procurementMethod', e.target.value)}>
                <option value="">-- Chọn --</option>
                {PROCUREMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Thời gian tổ chức & Ngày bắt đầu */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Thời gian tổ chức LCNT <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(ngày)</span></label>
              <input type="number" min="0" className="input-field" value={form.organizationTime} onChange={e => set('organizationTime', e.target.value)} placeholder="VD: 30" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ngày bắt đầu tổ chức LCNT</label>
              <input type="date" className="input-field" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
            </div>
          </div>

          {/* Loại HĐ & Thời gian thực hiện */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Loại hợp đồng</label>
              <select className="input-field" value={form.contractType} onChange={e => set('contractType', e.target.value)}>
                <option value="">-- Chọn --</option>
                {CONTRACT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Thời gian thực hiện gói thầu <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(ngày)</span></label>
              <input type="number" min="0" className="input-field" value={form.implementationTime} onChange={e => set('implementationTime', e.target.value)} placeholder="VD: 180" />
            </div>
          </div>

          {/* Tùy chọn mua thêm */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tùy chọn mua thêm</label>
            <input className="input-field" value={form.optionToBuy} onChange={e => set('optionToBuy', e.target.value)} placeholder="VD: Có / Không" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button
            className="btn btn-primary"
            onClick={() => onSave(form)}
            disabled={!form.name.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={15} /> Lưu gói thầu
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Project Bidding Card ───────────────────────────────────────────────────
const ProjectBiddingCard = ({ project, packages, isAdmin, onAdd, onEdit, onDelete, projects }) => {
  const [expanded, setExpanded] = useState(false);
  const total = packages.reduce((sum, p) => {
    const n = parseFloat((p.price || '').replace(/[^0-9.]/g, ''));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  return (
    <div
      className="card"
      style={{ padding: 0, overflow: 'hidden', cursor: 'default', backgroundColor: getPastelColor(project.id) }}
    >
      {/* Header ảnh */}
      {project.image && (
        <div style={{ height: '120px', width: '100%', backgroundImage: `url(${project.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}

      {/* Body thẻ */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>{project.code || 'N/A'}</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{project.name}</h3>
          </div>
          {isAdmin && (
            <button
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)', flexShrink: 0 }}
              onClick={() => onAdd(project)}
            >
              <Plus size={13} /> Thêm gói thầu
            </button>
          )}
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{project.location || 'Chưa cập nhật địa điểm'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={14} />
            <span>CĐT: {project.investor}</span>
          </div>
          {project.parentId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={14} />
              <span>Dự án cha: {projects.find(p => p.id?.toString() === project.parentId)?.name || '—'}</span>
            </div>
          )}
        </div>

        {/* Summary bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>
            {packages.length} gói thầu
            {total > 0 && ` • Tổng: ${total.toLocaleString('vi-VN')} đ`}
          </span>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
          >
            {expanded ? <><ChevronUp size={14} /> Thu gọn</> : <><ChevronDown size={14} /> Xem kế hoạch</>}
          </button>
        </div>

        {/* Expanded: bảng KHLCNT */}
        {expanded && (
          <div style={{ marginTop: '0.5rem', overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            {packages.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                Chưa có gói thầu nào. {isAdmin && 'Nhấn "+ Thêm gói thầu" để bắt đầu.'}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', minWidth: '900px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg-surface-hover)' }}>
                    {['STT', 'Tên gói thầu', 'Tóm tắt CV chính', 'Giá gói thầu', 'Nguồn vốn', 'Hình thức LCNT', 'Phương thức LCNT', 'TG tổ chức', 'Ngày bắt đầu', 'Loại HĐ', 'TG thực hiện', 'Tùy chọn mua thêm', ...(isAdmin ? [''] : [])].map((h, i) => (
                      <th key={i} style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '2px solid var(--color-border)', fontWeight: '700', whiteSpace: 'nowrap', color: 'var(--color-text-main)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg, idx) => (
                    <tr key={pkg.id} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: idx % 2 === 0 ? 'white' : 'var(--color-bg-surface)' }}>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: '600' }}>{idx + 1}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '600', minWidth: '140px' }}>{pkg.name}</td>
                      <td style={{ padding: '8px 10px', color: 'var(--color-text-muted)', minWidth: '160px' }}>{pkg.summary || '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>{pkg.price || '—'}</td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{pkg.fundSource || '—'}</td>
                      <td style={{ padding: '8px 10px', minWidth: '120px' }}>{pkg.selectionMethod || '—'}</td>
                      <td style={{ padding: '8px 10px', minWidth: '120px' }}>{pkg.procurementMethod || '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>{pkg.organizationTime || '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>{pkg.startTime || '—'}</td>
                      <td style={{ padding: '8px 10px', minWidth: '120px' }}>{pkg.contractType || '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>{pkg.implementationTime || '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>{pkg.optionToBuy || '—'}</td>
                      {isAdmin && (
                        <td style={{ padding: '8px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button className="btn-icon" onClick={() => onEdit(project, pkg)} style={{ color: 'var(--color-primary)' }} title="Sửa"><Edit2 size={13} /></button>
                          <button className="btn-icon" onClick={() => onDelete(project, pkg.id)} style={{ color: 'var(--color-danger)' }} title="Xóa"><Trash2 size={13} /></button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                {packages.length > 0 && (
                  <tfoot>
                    <tr style={{ backgroundColor: 'var(--color-bg-surface-hover)', fontWeight: '700' }}>
                      <td colSpan={3} style={{ padding: '8px 10px', textAlign: 'right' }}>Tổng giá gói thầu:</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--color-primary)' }}>
                        {total > 0 ? total.toLocaleString('vi-VN') + ' đ' : '—'}
                      </td>
                      <td colSpan={isAdmin ? 9 : 8} />
                    </tr>
                  </tfoot>
                )}
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────
const BiddingPlan = () => {
  const { projects, userRole, biddingPackages = [], addBiddingPackage, editBiddingPackage, deleteBiddingPackage } = useContext(DocumentContext);
  const isAdmin = userRole === 'Admin';

  const [addingToProject, setAddingToProject] = useState(null);
  const [editingPkg, setEditingPkg] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  const handleSave = async (form) => {
    if (editingPkg) {
      await editBiddingPackage(editingProject.id, editingPkg.id, form);
      setEditingPkg(null);
      setEditingProject(null);
    } else {
      await addBiddingPackage(addingToProject.id, form);
      setAddingToProject(null);
    }
  };

  const handleDelete = async (project, pkgId) => {
    if (window.confirm('Bạn có chắc muốn xóa gói thầu này?')) {
      await deleteBiddingPackage(project.id, pkgId);
    }
  };

  const getPackages = (projectId) =>
    biddingPackages.filter(p => p.projectId === projectId || p.projectId === projectId?.toString());

  return (
    <div className="fade-in" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
          📋 Kế hoạch lựa chọn nhà thầu
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Quản lý kế hoạch LCNT cho {projects.length} dự án — {biddingPackages.length} gói thầu
        </p>
      </div>

      {/* Cards grid */}
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          Chưa có dự án nào. Vui lòng tạo dự án ở trang "Dự án".
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {projects.map(project => (
            <ProjectBiddingCard
              key={project.id}
              project={project}
              projects={projects}
              packages={getPackages(project.id)}
              isAdmin={isAdmin}
              onAdd={(p) => setAddingToProject(p)}
              onEdit={(p, pkg) => { setEditingProject(p); setEditingPkg(pkg); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {(addingToProject || editingPkg) && (
        <PackageModal
          pkg={editingPkg}
          project={editingProject || addingToProject}
          onClose={() => { setAddingToProject(null); setEditingPkg(null); setEditingProject(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default BiddingPlan;
