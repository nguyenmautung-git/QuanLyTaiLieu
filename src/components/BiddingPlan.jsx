import React, { useState, useContext, useRef } from 'react';
import { DocumentContext } from '../context/DocumentContext';
import { getPastelColor } from '../data';
import { MapPin, Building, Plus, Trash2, Check, ChevronDown, ChevronUp, Briefcase, Save } from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────
const METHOD_OPTIONS = ['Đấu thầu rộng rãi', 'Đấu thầu hạn chế', 'Chỉ định thầu', 'Mua sắm trực tiếp', 'Chào hàng cạnh tranh', 'Tự thực hiện'];
const PROCUREMENT_OPTIONS = ['Một giai đoạn một túi hồ sơ', 'Một giai đoạn hai túi hồ sơ', 'Hai giai đoạn'];
const CONTRACT_OPTIONS = ['Hợp đồng trọn gói', 'Hợp đồng theo đơn giá cố định', 'Hợp đồng theo đơn giá điều chỉnh', 'Hợp đồng theo thời gian', 'Hợp đồng theo chi phí cộng phí'];
const FUND_SOURCE_OPTIONS = [
  'Vốn ngân sách nhà nước', 'Vốn trái phiếu Chính phủ',
  'Vốn ODA và vốn vay ưu đãi của nhà tài trợ nước ngoài',
  'Vốn tín dụng đầu tư phát triển của Nhà nước',
  'Vốn đầu tư từ nguồn thu để lại chưa đưa vào cân đối NSNN',
  'Vốn của doanh nghiệp nhà nước', 'Vốn hỗn hợp (NSNN + vốn doanh nghiệp)',
  'Vốn hợp tác công tư (PPP)', 'Vốn tư nhân', 'Nguồn vốn hợp pháp khác',
];

const formatPrice = (val) => {
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('vi-VN');
};
const unformatPrice = (val) => String(val).replace(/\./g, '').replace(/,/g, '');

const EMPTY_ROW = () => ({
  _new: true,
  name: '', summary: '', price: '', fundSource: '',
  selectionMethod: '', procurementMethod: '',
  organizationTime: '', startTime: '', contractType: '',
  implementationTime: '', optionToBuy: '',
});

// ─── Column definitions ──────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'name',               label: 'Tên gói thầu',          width: 180, required: true },
  { key: 'summary',            label: 'Tóm tắt CV chính',       width: 180 },
  { key: 'price',              label: 'Giá gói thầu (VNĐ)',     width: 150, type: 'price' },
  { key: 'fundSource',         label: 'Nguồn vốn',              width: 180, type: 'select', options: FUND_SOURCE_OPTIONS },
  { key: 'selectionMethod',    label: 'Hình thức LCNT',         width: 160, type: 'select', options: METHOD_OPTIONS },
  { key: 'procurementMethod',  label: 'Phương thức LCNT',       width: 160, type: 'select', options: PROCUREMENT_OPTIONS },
  { key: 'organizationTime',   label: 'TG tổ chức (ngày)',      width: 120, type: 'number' },
  { key: 'startTime',          label: 'Ngày bắt đầu LCNT',      width: 140, type: 'date' },
  { key: 'contractType',       label: 'Loại hợp đồng',          width: 180, type: 'select', options: CONTRACT_OPTIONS },
  { key: 'implementationTime', label: 'TG thực hiện (ngày)',    width: 130, type: 'number' },
  { key: 'optionToBuy',        label: 'Tùy chọn mua thêm',     width: 130 },
];

// ─── Cell renderer ───────────────────────────────────────────────────────────
const CellInput = ({ col, value, onChange, isNew }) => {
  const base = {
    width: '100%', border: 'none', outline: 'none',
    padding: '5px 8px', fontSize: '0.78rem',
    backgroundColor: 'transparent', color: 'var(--color-text-main)',
    fontFamily: 'inherit',
  };

  if (col.type === 'select') {
    return (
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...base, cursor: 'pointer' }}>
        <option value="">—</option>
        {col.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (col.type === 'price') {
    return (
      <input type="text" value={formatPrice(value)}
        onChange={e => onChange(unformatPrice(e.target.value))}
        placeholder={isNew ? 'Nhập số tiền' : ''}
        style={{ ...base, textAlign: 'right' }} />
    );
  }
  if (col.type === 'number') {
    return (
      <input type="number" min="0" value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={isNew ? '0' : ''}
        style={{ ...base, textAlign: 'center' }} />
    );
  }
  if (col.type === 'date') {
    return (
      <input type="date" value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...base }} />
    );
  }
  return (
    <input type="text" value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={isNew && col.required ? 'Bắt buộc *' : (isNew ? '...' : '')}
      style={{ ...base }} />
  );
};

// ─── Datasheet row (existing package) ────────────────────────────────────────
const DataRow = ({ pkg, idx, isAdmin, onSave, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [row, setRow] = useState({ ...pkg });
  const setField = (k, v) => setRow(r => ({ ...r, [k]: v }));

  const handleSave = () => { onSave(row); setEditing(false); };

  const cellStyle = (col) => ({
    padding: 0,
    minWidth: col.width,
    maxWidth: col.width,
    borderRight: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
    overflow: 'hidden',
    backgroundColor: editing ? '#fffbea' : (idx % 2 === 0 ? '#ffffff' : 'var(--color-bg-surface)'),
    transition: 'background-color 0.15s',
  });

  return (
    <tr onClick={() => isAdmin && setEditing(true)}
      style={{ cursor: isAdmin ? 'pointer' : 'default' }}>
      {/* STT */}
      <td style={{ ...cellStyle({ width: 44 }), textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600', padding: '6px 4px' }}>
        {idx + 1}
      </td>

      {COLUMNS.map(col => (
        <td key={col.key} style={cellStyle(col)}>
          {editing ? (
            <CellInput col={col} value={row[col.key] || ''} onChange={v => setField(col.key, v)} />
          ) : (
            <div style={{ padding: '6px 8px', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: row[col.key] ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>
              {col.type === 'price' ? formatPrice(row[col.key]) || '—' : (row[col.key] || '—')}
            </div>
          )}
        </td>
      ))}

      {/* Actions */}
      {isAdmin && (
        <td style={{ ...cellStyle({ width: 70 }), textAlign: 'center', padding: '4px' }}>
          {editing ? (
            <button onClick={e => { e.stopPropagation(); handleSave(); }}
              style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', margin: '0 auto' }}>
              <Check size={11} /> Lưu
            </button>
          ) : (
            <button onClick={e => { e.stopPropagation(); onDelete(pkg.id); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: '4px' }}>
              <Trash2 size={13} />
            </button>
          )}
        </td>
      )}
    </tr>
  );
};

// ─── New row at the bottom ────────────────────────────────────────────────────
const NewRow = ({ onAdd, colCount }) => {
  const [row, setRow] = useState(EMPTY_ROW());
  const setField = (k, v) => setRow(r => ({ ...r, [k]: v }));

  const handleAdd = () => {
    if (!row.name.trim()) return;
    onAdd({ ...row });
    setRow(EMPTY_ROW());
  };

  const cellStyle = (col) => ({
    padding: 0,
    minWidth: col.width,
    maxWidth: col.width,
    borderRight: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: '#f0f9ff',
    overflow: 'hidden',
  });

  return (
    <tr>
      <td style={{ ...cellStyle({ width: 44 }), textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: '700', padding: '4px 2px' }}>
        <Plus size={14} style={{ display: 'block', margin: '0 auto' }} />
      </td>
      {COLUMNS.map(col => (
        <td key={col.key} style={cellStyle(col)}>
          <CellInput col={col} value={row[col.key] || ''} onChange={v => setField(col.key, v)} isNew />
        </td>
      ))}
      <td style={{ ...cellStyle({ width: 70 }), textAlign: 'center', padding: '4px' }}>
        <button onClick={handleAdd} disabled={!row.name.trim()}
          style={{ background: row.name.trim() ? 'var(--color-primary)' : '#e2e8f0', color: row.name.trim() ? '#fff' : '#94a3b8', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: row.name.trim() ? 'pointer' : 'not-allowed', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', margin: '0 auto' }}>
          <Save size={11} /> Lưu
        </button>
      </td>
    </tr>
  );
};

// ─── Datasheet Card ──────────────────────────────────────────────────────────
const ProjectDatasheet = ({ project, packages, isAdmin, onAdd, onSave, onDelete, projects }) => {
  const [expanded, setExpanded] = useState(false);

  const totalPrice = packages.reduce((s, p) => {
    const n = parseFloat(String(p.price || '').replace(/\D/g, ''));
    return s + (isNaN(n) ? 0 : n);
  }, 0);

  const thStyle = (col) => ({
    padding: '8px 10px',
    minWidth: col.width,
    maxWidth: col.width,
    backgroundColor: 'var(--color-bg-surface-hover)',
    borderRight: '1px solid var(--color-border)',
    borderBottom: '2px solid var(--color-border)',
    fontWeight: '700',
    fontSize: '0.73rem',
    color: 'var(--color-text-main)',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  });

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: getPastelColor(project.id) }}>
      {/* Card Header */}
      {project.image && (
        <div style={{ height: '100px', backgroundImage: `url(${project.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <span className="badge badge-blue" style={{ marginBottom: '0.4rem' }}>{project.code || 'N/A'}</span>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>{project.name}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              <span><MapPin size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />{project.location || '—'}</span>
              <span><Building size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />CĐT: {project.investor}</span>
              {project.parentId && <span><Briefcase size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />DA cha: {projects.find(p => p.id?.toString() === project.parentId)?.name || '—'}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
              <div style={{ color: 'var(--color-text-muted)' }}>{packages.length} gói thầu</div>
              {totalPrice > 0 && <div style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{totalPrice.toLocaleString('vi-VN')} đ</div>}
            </div>
            <button onClick={() => setExpanded(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
              {expanded ? <><ChevronUp size={14} /> Thu gọn</> : <><ChevronDown size={14} /> Mở datasheet</>}
            </button>
          </div>
        </div>
      </div>

      {/* Datasheet */}
      {expanded && (
        <div style={{ overflowX: 'auto', borderTop: '2px solid var(--color-border)' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.78rem', tableLayout: 'fixed', minWidth: '100%' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle({ width: 44 }), minWidth: 44 }}>STT</th>
                {COLUMNS.map(col => (
                  <th key={col.key} style={thStyle(col)}>{col.label}</th>
                ))}
                {isAdmin && <th style={{ ...thStyle({ width: 70 }), minWidth: 70 }}>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {packages.length === 0 && !isAdmin && (
                <tr>
                  <td colSpan={COLUMNS.length + 2} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.82rem' }}>
                    Chưa có gói thầu nào.
                  </td>
                </tr>
              )}
              {packages.map((pkg, idx) => (
                <DataRow key={pkg.id} pkg={pkg} idx={idx} isAdmin={isAdmin}
                  onSave={(updated) => onSave(project.id, pkg.id, updated)}
                  onDelete={(id) => onDelete(project, id)} />
              ))}
              {/* Tổng giá */}
              {packages.length > 0 && (
                <tr style={{ backgroundColor: 'var(--color-bg-surface-hover)', fontWeight: '700' }}>
                  <td colSpan={3} style={{ padding: '7px 10px', fontSize: '0.78rem', textAlign: 'right', borderTop: '2px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
                    Tổng giá gói thầu:
                  </td>
                  <td style={{ padding: '7px 10px', fontSize: '0.78rem', color: 'var(--color-primary)', textAlign: 'right', borderTop: '2px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
                    {totalPrice > 0 ? totalPrice.toLocaleString('vi-VN') + ' đ' : '—'}
                  </td>
                  <td colSpan={COLUMNS.length - 2 + (isAdmin ? 1 : 0)} style={{ borderTop: '2px solid var(--color-border)' }} />
                </tr>
              )}
              {/* New row */}
              {isAdmin && (
                <NewRow onAdd={(row) => onAdd(project.id, row)} colCount={COLUMNS.length} />
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const BiddingPlan = () => {
  const { projects, userRole, biddingPackages = [], addBiddingPackage, editBiddingPackage, deleteBiddingPackage } = useContext(DocumentContext);
  const isAdmin = userRole === 'Admin';

  const getPackages = (projectId) =>
    [...biddingPackages.filter(p => String(p.projectId) === String(projectId))]
      .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

  const handleAdd = async (projectId, row) => {
    const { _new, ...data } = row;
    await addBiddingPackage(projectId, data);
  };

  const handleSave = async (projectId, pkgId, updated) => {
    await editBiddingPackage(projectId, pkgId, updated);
  };

  const handleDelete = async (project, pkgId) => {
    if (window.confirm('Xóa gói thầu này?')) {
      await deleteBiddingPackage(project.id, pkgId);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
          📋 Kế hoạch lựa chọn nhà thầu
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          {projects.length} dự án • {biddingPackages.length} gói thầu
          {isAdmin && ' — Nhấp vào hàng để chỉnh sửa, hàng cuối để thêm mới'}
        </p>
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          Chưa có dự án nào. Vui lòng tạo dự án ở trang "Dự án".
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {projects.map(project => (
            <ProjectDatasheet
              key={project.id}
              project={project}
              projects={projects}
              packages={getPackages(project.id)}
              isAdmin={isAdmin}
              onAdd={handleAdd}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BiddingPlan;
