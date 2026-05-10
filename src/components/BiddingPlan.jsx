import React, { useState, useContext, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DocumentContext } from '../context/DocumentContext';
import { getPastelColor } from '../data';
import { MapPin, Building, Plus, Trash2, Check, ChevronDown, ChevronUp, Briefcase, Save, ArrowUp, ArrowDown, Settings, Upload } from 'lucide-react';

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
const STATUS_OPTIONS = ['📝 Đang soạn thảo', '⏳ Đang chờ duyệt', '✅ Đã phê duyệt'];

const formatPrice = (val) => {
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('vi-VN');
};
const unformatPrice = (val) => String(val).replace(/\./g, '').replace(/,/g, '');

const EMPTY_ROW = () => ({
  _new: true,
  code: '', name: '', summary: '', nature: '', price: '',
  fundSource: 'Vốn tư nhân',
  selectionMethod: 'Đấu thầu hạn chế',
  procurementMethod: 'Một giai đoạn hai túi hồ sơ',
  startTime: '', closingTime: '', openingTime: '',
  contractType: 'Hợp đồng trọn gói',
  optionToBuy: false,
  status: '📝 Đang soạn thảo',
  attachment: [],
});

// ─── Column definitions ──────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'code',               label: 'Mã gói thầu',           width: 140, type: 'code' },
  { key: 'status',             label: 'Trạng thái',            width: 130, type: 'status', options: STATUS_OPTIONS },
  { key: 'name',               label: 'Tên gói thầu',          width: 180, required: true },
  { key: 'nature',             label: 'Tính chất gói thầu',    width: 160, type: 'nature_select' },
  { key: 'summary',            label: 'Tóm tắt CV chính',       width: 180, type: 'textarea' },
  { key: 'price',              label: 'Giá gói thầu (VNĐ)',     width: 150, type: 'price' },
  { key: 'fundSource',         label: 'Nguồn vốn',              width: 180, type: 'select', options: FUND_SOURCE_OPTIONS },
  { key: 'selectionMethod',    label: 'Hình thức LCNT',         width: 160, type: 'select', options: METHOD_OPTIONS },
  { key: 'procurementMethod',  label: 'Phương thức LCNT',       width: 160, type: 'select', options: PROCUREMENT_OPTIONS },
  { key: 'startTime',          label: 'Ngày mời thầu',          width: 140, type: 'date' },
  { key: 'closingTime',        label: 'Ngày đóng thầu',         width: 140, type: 'date' },
  { key: 'openingTime',        label: 'Ngày mở thầu',           width: 140, type: 'date' },
  { key: 'contractType',       label: 'Loại hợp đồng',          width: 180, type: 'select', options: CONTRACT_OPTIONS },
  { key: 'optionToBuy',        label: 'Tùy chọn mua thêm',     width: 90,  type: 'checkbox' },
  { key: 'attachment',         label: 'Tệp đính kèm',           width: 180, type: 'file' },
];


// ─── Custom Combobox ─────────────────────────────────────────────────────────
const NameCombobox = ({ value, onChange, isNew }) => {
  const { globalLists, deleteListItem } = useContext(DocumentContext);
  const packageNames = globalLists?.packageNames || [];
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        const dropdownElement = document.getElementById('name-combobox-dropdown');
        if (dropdownElement && dropdownElement.contains(e.target)) return;
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const maxH = 220; // Maximum desired height

      let style = {
        position: 'fixed',
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 999999,
      };

      if (spaceBelow < maxH && spaceAbove > spaceBelow) {
        // Drop upwards
        style.bottom = `${window.innerHeight - rect.top + 2}px`;
        style.maxHeight = `${Math.min(spaceAbove - 10, maxH)}px`;
        style.boxShadow = '0 -4px 12px rgba(0,0,0,0.15)'; // Shadow upwards
      } else {
        // Drop downwards
        style.top = `${rect.bottom + 2}px`;
        style.maxHeight = `${Math.min(spaceBelow - 10, maxH)}px`;
        style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; // Shadow downwards
      }

      setDropdownStyle(style);
    }
  }, [isOpen, value, packageNames.length]);

  const filtered = packageNames.filter(o => o.name.toLowerCase().includes((value || '').toLowerCase()));
  const base = { width: '100%', border: 'none', outline: 'none', padding: '5px 8px', fontSize: '0.78rem', backgroundColor: 'transparent', color: 'var(--color-text-main)', fontFamily: 'inherit' };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        placeholder={isNew ? 'Bắt buộc *' : '...'}
        style={base}
      />
      {isOpen && filtered.length > 0 && createPortal(
        <div id="name-combobox-dropdown" style={{ ...dropdownStyle, background: '#fff', border: '1px solid var(--color-border)', borderRadius: '4px', overflowY: 'auto' }}>
          {filtered.map(opt => (
            <div key={opt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                onChange(opt.name);
                setIsOpen(false);
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-main)', fontWeight: '500' }}>{opt.name}</span>
              <button
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); deleteListItem('packageNames', opt.id); }}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '4px' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Xóa gợi ý này"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

// ─── Custom File Upload ──────────────────────────────────────────────────────
const FileUploadCell = ({ value, onChange }) => {
  const fileList = Array.isArray(value) ? value : [];
  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newFiles = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    onChange([...fileList, ...newFiles]);
  };
  const handleRemove = (idx) => {
    const next = [...fileList];
    next.splice(idx, 1);
    onChange(next);
  };
  return (
    <div style={{ padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {fileList.map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', backgroundColor: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>
          <a href={f.url} target="_blank" rel="noreferrer" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px', color: 'var(--color-primary)', textDecoration: 'none' }} title={f.name}>{f.name}</a>
          <button onClick={() => handleRemove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, display: 'flex', alignItems: 'center' }} title="Xóa file"><Trash2 size={12} /></button>
        </div>
      ))}
      <label style={{ cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 6px', backgroundColor: '#f0f9ff', borderRadius: '4px', alignSelf: 'flex-start', border: '1px dashed var(--color-primary)' }}>
        <Upload size={12} /> Tải file
        <input type="file" multiple style={{ display: 'none' }} onChange={handleUpload} />
      </label>
    </div>
  );
};

// ─── Cell renderer ───────────────────────────────────────────────────────────
const CellInput = ({ col, value, onChange, isNew, projectCode }) => {
  const base = { width: '100%', border: 'none', outline: 'none', padding: '5px 8px', fontSize: '0.78rem', backgroundColor: 'transparent', color: 'var(--color-text-main)', fontFamily: 'inherit' };
  if (col.type === 'checkbox') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
      <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)}
        style={{ width: '15px', height: '15px', accentColor: 'var(--color-primary)', cursor: 'pointer' }} />
    </div>
  );
  if (col.type === 'code') return <input type="text" value={value} disabled
    placeholder={isNew && projectCode ? `${projectCode}.GT.01` : ''}
    style={{ ...base, color: '#64748b', backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} />;
  if (col.type === 'nature_select') {
    const { globalLists } = useContext(DocumentContext);
    const options = globalLists?.packageNatures || [];
    return (
      <select value={value} onChange={e => onChange(e.target.value)} style={{ ...base, cursor: 'pointer' }}>
        <option value="">— Chọn tính chất —</option>
        {options.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
      </select>
    );
  }
  if (col.type === 'select') return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...base, cursor: 'pointer' }}>
      <option value="">—</option>
      {col.options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  if (col.type === 'status') {
    const getBg = (s) => {
      if (s === '✅ Đã phê duyệt') return '#dcfce7'; // green
      if (s === '⏳ Đang chờ duyệt') return '#fef08a'; // yellow
      return '#f1f5f9'; // gray
    };
    const getColor = (s) => {
      if (s === '✅ Đã phê duyệt') return '#166534';
      if (s === '⏳ Đang chờ duyệt') return '#854d0e';
      return '#475569';
    };
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
        <select value={value} onChange={e => onChange(e.target.value)} 
          style={{ width: '100%', border: 'none', background: getBg(value), color: getColor(value), borderRadius: '12px', padding: '2px 8px', outline: 'none', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', appearance: 'none', textAlign: 'center' }}>
          {col.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  if (col.type === 'price') return <input type="text" value={formatPrice(value)} onChange={e => onChange(unformatPrice(e.target.value))} placeholder={isNew ? 'Nhập số tiền' : ''} style={{ ...base, textAlign: 'right' }} />;
  if (col.type === 'number') return <input type="number" min="0" value={value} onChange={e => onChange(e.target.value)} placeholder={isNew ? '0' : ''} style={{ ...base, textAlign: 'center' }} />;
  if (col.type === 'date') return <input type="date" value={value} onChange={e => onChange(e.target.value)} style={{ ...base }} />;
  if (col.type === 'textarea') return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={isNew ? '...' : ''} style={{ ...base, resize: 'vertical', minHeight: '80px', lineHeight: '1.4' }} />;
  if (col.type === 'file') return <FileUploadCell value={value} onChange={onChange} />;
  if (col.key === 'name') return <NameCombobox value={value} onChange={onChange} isNew={isNew && col.required} />;
  return <input type="text" value={value} onChange={e => onChange(e.target.value)}
    placeholder={isNew && col.required ? 'Bắt buộc *' : (isNew ? '...' : '')} style={{ ...base }} />;
};

const validateDates = (data) => {
  const { startTime, closingTime, openingTime } = data;
  if (startTime && closingTime) {
    if (new Date(closingTime) <= new Date(startTime)) return 'Ngày đóng thầu phải diễn ra sau Ngày mời thầu.';
  }
  if (openingTime) {
    if (startTime && new Date(openingTime) < new Date(startTime)) return 'Ngày mở thầu không được diễn ra trước Ngày mời thầu.';
    if (closingTime && new Date(openingTime) < new Date(closingTime)) return 'Ngày mở thầu không được diễn ra trước Ngày đóng thầu.';
  }
  return null;
};

// ─── Edit Modal ────────────────────────────────────────────────────────────────
const EditPackageModal = ({ pkg, onSave, onClose, projectCode, projectName }) => {
  const [formData, setFormData] = useState({ ...pkg });
  const [error, setError] = useState('');
  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleSave = () => {
    const err = validateDates(formData);
    if (err) {
      setError(err);
      return;
    }
    if(formData.name.trim()) onSave(formData);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card fade-in" style={{ width: '600px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--color-bg-surface)', padding: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#f8fafc' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-main)', fontWeight: '700' }}>Chỉnh sửa gói thầu</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px', fontWeight: '500' }}>Dự án: {projectName}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}>&times;</button>
        </div>
        {error && (
          <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '0.85rem', fontWeight: '500', borderBottom: '1px solid #fecaca' }}>
            ⚠️ {error}
          </div>
        )}
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {COLUMNS.map(col => (
            <div key={col.key} style={{ gridColumn: col.key === 'summary' ? '1 / -1' : 'auto' }}>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-main)' }}>{col.label} {col.required && <span style={{color:'red'}}>*</span>}</label>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: '#fff' }}>
                <CellInput col={col} value={formData[col.key] ?? ''} onChange={v => handleChange(col.key, v)} projectCode={projectCode} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: '#f8fafc' }}>
          <button onClick={onClose} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Hủy</button>
          <button onClick={handleSave} disabled={!formData.name.trim()} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: formData.name.trim() ? 'pointer' : 'not-allowed', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Save size={14}/> Lưu thay đổi</button>
        </div>
      </div>
    </div>
  );
};

// ─── Datasheet row (existing package) ────────────────────────────────────────
const DataRow = ({ pkg, idx, total, isAdmin, onEdit, onDelete, onMoveUp, onMoveDown, visibleCols, colWidths }) => {
  const bg = idx % 2 === 0 ? '#ffffff' : 'var(--color-bg-surface)';
  const cell = (w) => ({
    padding: 0, minWidth: w, maxWidth: w,
    borderRight: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
    overflow: 'hidden', backgroundColor: bg, transition: 'background-color 0.15s',
  });
  const btn = { background: 'none', border: 'none', cursor: 'pointer', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' };

  return (
    <tr onDoubleClick={() => isAdmin && onEdit(pkg)}
      style={{ cursor: isAdmin ? 'pointer' : 'default' }}>

      {/* LEFT: Up/Down */}
      {isAdmin && (
        <td style={{ ...cell(72), padding: '3px 4px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
            <button onClick={e => { e.stopPropagation(); onMoveUp(); }} disabled={idx === 0}
              style={{ ...btn, color: idx === 0 ? '#cbd5e1' : 'var(--color-primary)', cursor: idx === 0 ? 'default' : 'pointer' }}
              title="Di chuyển lên">
              <ArrowUp size={13} />
            </button>
            <button onClick={e => { e.stopPropagation(); onMoveDown(); }} disabled={idx === total - 1}
              style={{ ...btn, color: idx === total - 1 ? '#cbd5e1' : 'var(--color-primary)', cursor: idx === total - 1 ? 'default' : 'pointer' }}
              title="Di chuyển xuống">
              <ArrowDown size={13} />
            </button>
          </div>
        </td>
      )}

      {/* Data cells */}
      {visibleCols.map(col => {
        const w = colWidths[col.key] || col.width;
        const align = col.type === 'price' || col.type === 'date' ? 'right'
                    : col.type === 'number' || col.type === 'checkbox' ? 'center' : 'left';
        return (
          <td key={col.key} style={{ ...cell(w), minWidth: w, maxWidth: w }}>
            {col.type === 'checkbox' ? (
              <div style={{ textAlign: 'center', padding: '4px' }}>
                <input type="checkbox" checked={!!pkg[col.key]} readOnly
                  style={{ width: '14px', height: '14px', accentColor: 'var(--color-primary)', cursor: 'default' }} />
              </div>
            ) : col.type === 'file' ? (
              <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden' }}>
                {Array.isArray(pkg[col.key]) && pkg[col.key].length > 0 ? (
                  pkg[col.key].map((f, i) => (
                    <a key={i} href={f.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: 'var(--color-primary)', textDecoration: 'none', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'block' }} title={f.name}>📎 {f.name}</a>
                  ))
                ) : pkg[col.key] && typeof pkg[col.key] === 'string' ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'block' }}>{pkg[col.key]}</span>
                ) : (
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', display: 'block', padding: '2px 4px' }}>—</span>
                )}
              </div>
            ) : (
              <div style={{ padding: '6px 8px', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: align, color: pkg[col.key] ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>
                {col.type === 'price' ? formatPrice(pkg[col.key]) || '—' : (pkg[col.key] || '—')}
              </div>
            )}
          </td>
        );
      })}

      {/* RIGHT: Delete */}
      {isAdmin && (
        <td style={{ ...cell(46), textAlign: 'center', padding: '3px' }}>
          <button onClick={e => { e.stopPropagation(); onDelete(pkg.id); }}
            style={{ ...btn, color: 'var(--color-danger)', margin: '0 auto' }} title="Xóa gói thầu này">
            <Trash2 size={14} />
          </button>
        </td>
      )}
    </tr>
  );
};

// ─── New row at the bottom ────────────────────────────────────────────────────
const NewRow = ({ onAdd, isAdmin, visibleCols, colWidths, projectCode, nextIdx }) => {
  const getDefaultCode = (idx) => projectCode ? `${projectCode}.GT.${String(idx).padStart(2, '0')}` : '';
  const [row, setRow] = useState({ ...EMPTY_ROW(), code: getDefaultCode(nextIdx) });
  
  useEffect(() => {
    if (!row.code || row.code === getDefaultCode(nextIdx - 1)) {
      setRow(r => ({ ...r, code: getDefaultCode(nextIdx) }));
    }
  }, [nextIdx, projectCode]);

  const setField = (k, v) => setRow(r => ({ ...r, [k]: v }));
  const handleAdd = () => { 
    if (!row.name.trim()) return; 
    const err = validateDates(row);
    if (err) {
      window.alert(err);
      return;
    }
    onAdd({ ...row }); 
    setRow({ ...EMPTY_ROW(), code: getDefaultCode(nextIdx + 1) }); 
  };
  const cell = (w) => ({ padding: 0, minWidth: w, maxWidth: w, borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f0f9ff', overflow: 'hidden' });

  return (
    <tr>
      {isAdmin && (
        <td style={{ ...cell(72), textAlign: 'center', padding: '4px' }}>
          <button onClick={handleAdd} disabled={!row.name.trim()}
            style={{ background: row.name.trim() ? 'var(--color-primary)' : '#e2e8f0', color: row.name.trim() ? '#fff' : '#94a3b8', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: row.name.trim() ? 'pointer' : 'not-allowed', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '2px', margin: '0 auto' }}>
            <Plus size={10} /> Thêm
          </button>
        </td>
      )}
      {visibleCols.map(col => {
        const w = colWidths[col.key] || col.width;
        return (
          <td key={col.key} style={cell(w)}>
            <CellInput col={col} value={row[col.key] ?? ''} onChange={v => setField(col.key, v)} isNew projectCode={projectCode} />
          </td>
        );
      })}
      {isAdmin && <td style={cell(46)} />}
    </tr>
  );
};

// ─── Template List Modal ─────────────────────────────────────────────────────
const TemplateListModal = ({ onClose, onConfirm }) => {
  const { globalLists } = useContext(DocumentContext);
  const packageNames = globalLists?.packageNames || [];
  const [selected, setSelected] = useState(new Set());

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleConfirm = () => {
    const selectedNames = packageNames.filter(p => selected.has(p.id)).map(p => p.name);
    onConfirm(selectedNames);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card fade-in" style={{ width: '600px', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-surface)', padding: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-main)', fontWeight: '700' }}>Danh sách gói thầu mẫu</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}>&times;</button>
        </div>
        
        <div style={{ padding: 0, overflowY: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f1f5f9', zIndex: 1 }}>
              <tr>
                <th style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', width: '60px', textAlign: 'center' }}>STT</th>
                <th style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>Tên gói thầu</th>
                <th style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', width: '90px', textAlign: 'center' }}>Lựa chọn</th>
              </tr>
            </thead>
            <tbody>
              {packageNames.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Chưa có gói thầu mẫu nào.</td></tr>
              ) : (
                packageNames.map((pkg, idx) => (
                  <tr key={pkg.id} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: selected.has(pkg.id) ? '#f0f9ff' : 'transparent', cursor: 'pointer', transition: 'background-color 0.15s' }} onClick={() => toggleSelect(pkg.id)}>
                    <td style={{ padding: '10px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>{idx + 1}</td>
                    <td style={{ padding: '10px 16px', fontWeight: '500', color: 'var(--color-text-main)' }}>{pkg.name}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <input type="checkbox" checked={selected.has(pkg.id)} readOnly style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)', cursor: 'pointer' }} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: '#f8fafc' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--color-border)', background: '#fff', cursor: 'pointer', fontWeight: '600' }}>Hủy</button>
          <button onClick={handleConfirm} disabled={selected.size === 0} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: selected.size > 0 ? 'pointer' : 'not-allowed', fontWeight: '600' }}>
            <Check size={16} /> Đồng ý ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Datasheet Card ──────────────────────────────────────────────────────────
const ProjectDatasheet = ({ project, packages, isAdmin, onAdd, onOpenTemplateModal, onSave, onDelete, onMoveUp, onMoveDown, projects, onEdit }) => {
  const [hiddenCols, setHiddenCols] = useState(new Set([
    'optionToBuy', 
    'fundSource', 
    'selectionMethod', 
    'procurementMethod', 
    'organizationTime', 
    'startTime', 
    'contractType', 
    'implementationTime'
  ]));
  const [colWidths, setColWidths] = useState(() => Object.fromEntries(COLUMNS.map(c => [c.key, c.width])));
  const [showColPanel, setShowColPanel] = useState(false);
  const panelRef = useRef(null);
  const visibleCols = COLUMNS.filter(c => !hiddenCols.has(c.key));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowColPanel(false);
      }
    };
    if (showColPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColPanel]);

  const toggleCol = (key) => setHiddenCols(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const startResize = (key, e) => {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX, startW = colWidths[key];
    const onMove = (me) => setColWidths(prev => ({ ...prev, [key]: Math.max(60, startW + me.clientX - startX) }));
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };
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
            {isAdmin && (
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenTemplateModal(project.id); }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fff', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
                <Plus size={14} /> Tạo gói thầu từ mẫu
              </button>
            )}
            {expanded && (
              <div style={{ position: 'relative' }} ref={panelRef}>
                <button onClick={() => setShowColPanel(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.78rem' }}
                  title="Ẩn/hiện cột">
                  <Settings size={13} /> Cột
                </button>
                {showColPanel && (
                  <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 100, background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '0.75rem', minWidth: '200px', maxHeight: '300px', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Hiển thị cột</div>
                    {COLUMNS.map(col => (
                      <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={!hiddenCols.has(col.key)} onChange={() => toggleCol(col.key)}
                          style={{ accentColor: 'var(--color-primary)', width: '14px', height: '14px' }} />
                        {col.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button onClick={() => { setExpanded(v => !v); setShowColPanel(false); }}
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
                {isAdmin && <th style={{ ...thStyle({ width: 72 }), minWidth: 72 }}>Di chuyển</th>}
                {visibleCols.map(col => {
                  const w = colWidths[col.key] || col.width;
                  const align = col.type === 'price' || col.type === 'date' ? 'right'
                              : col.type === 'number' ? 'center' : 'left';
                  return (
                    <th key={col.key} style={{ ...thStyle({ width: w }), minWidth: w, maxWidth: w, position: 'relative', userSelect: 'none', textAlign: align }}>
                      {col.label}
                      <div onMouseDown={e => startResize(col.key, e)}
                        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '5px', cursor: 'col-resize', backgroundColor: 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      />
                    </th>
                  );
                })}
                {isAdmin && <th style={{ ...thStyle({ width: 46 }), minWidth: 46 }}>Xóa</th>}
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
              {packages.map((p, idx) => {
                const computedCode = `${project.code}.GT.${String(idx + 1).padStart(2, '0')}`;
                const pkg = { ...p, code: computedCode };
                return (
                  <DataRow key={pkg.id} pkg={pkg} idx={idx} total={packages.length} isAdmin={isAdmin}
                    visibleCols={visibleCols} colWidths={colWidths}
                    onEdit={(pkg) => onEdit(project, pkg)}
                    onDelete={(id) => onDelete(project, id)}
                    onMoveUp={() => onMoveUp(project, packages, idx)}
                    onMoveDown={() => onMoveDown(project, packages, idx)} />
                );
              })}
              {/* Tổng giá — căn dưới cột "Giá gói thầu" */}
              {packages.length > 0 && (() => {
                // Đếm số cột trước cột "price" trong visibleCols
                const priceIdx = visibleCols.findIndex(c => c.key === 'price');
                const colsAfterPrice = priceIdx >= 0 ? visibleCols.length - priceIdx - 1 : 0;
                // Cột cố định trái: Di chuyển(1) + các cột trước price
                const fixedLeft = (isAdmin ? 1 : 0) + (priceIdx >= 0 ? priceIdx : visibleCols.length);
                const bdr = '1px solid var(--color-border)';
                const bdrTop = '2px solid var(--color-border)';
                const baseTd = { padding: '7px 10px', fontSize: '0.78rem', borderTop: bdrTop, backgroundColor: 'var(--color-bg-surface-hover)', fontWeight: '700' };
                return (
                  <tr>
                    <td colSpan={fixedLeft} style={{ ...baseTd, textAlign: 'right', borderRight: bdr }}>
                      Tổng giá gói thầu:
                    </td>
                    {priceIdx >= 0 && (
                      <td style={{ ...baseTd, color: 'var(--color-primary)', textAlign: 'right', borderRight: bdr }}>
                        {totalPrice > 0 ? totalPrice.toLocaleString('vi-VN') + ' đ' : '—'}
                      </td>
                    )}
                    <td colSpan={colsAfterPrice + (isAdmin ? 1 : 0)} style={{ ...baseTd }} />
                  </tr>
                );
              })()}
              {/* New row */}
              {isAdmin && (
                <NewRow onAdd={(row) => onAdd(project.id, row)} isAdmin={isAdmin} visibleCols={visibleCols} colWidths={colWidths} projectCode={project.code} nextIdx={packages.length + 1} />
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
  const { projects, userRole, biddingPackages = [], addBiddingPackage, editBiddingPackage, deleteBiddingPackage, reorderBiddingPackages, addListItem, globalLists } = useContext(DocumentContext);
  const isAdmin = userRole === 'Admin';
  const didFixCodes = useRef(false);
  const [editingData, setEditingData] = useState(null);
  const [templateModalProjectId, setTemplateModalProjectId] = useState(null);

  const getPackages = (projectId) =>
    [...biddingPackages.filter(p => String(p.projectId) === String(projectId))]
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || (a.createdAt || '').localeCompare(b.createdAt || ''))
      .map(p => {
        let st = p.status || '📝 Đang soạn thảo';
        if (st === 'Đang soạn thảo') st = '📝 Đang soạn thảo';
        if (st === 'Đang chờ duyệt') st = '⏳ Đang chờ duyệt';
        if (st === 'Đã phê duyệt') st = '✅ Đã phê duyệt';
        return { ...p, status: st };
      });

  // Migration script to populate packageNames from existing packages if empty
  useEffect(() => {
    if (biddingPackages.length > 0 && globalLists && globalLists.packageNames?.length === 0 && isAdmin) {
      const uniqueNames = [...new Set(biddingPackages.map(p => p.name).filter(Boolean))];
      uniqueNames.forEach(name => {
        addListItem('packageNames', name).catch(e => console.error(e));
      });
    }
  }, [biddingPackages, globalLists, isAdmin, addListItem]);

  // Migration script to fix missing/wrong codes
  useEffect(() => {
    if (!didFixCodes.current && projects.length > 0 && biddingPackages.length > 0) {
      didFixCodes.current = true;
      projects.forEach(p => {
        const pkgs = getPackages(p.id);
        const needsUpdate = pkgs.some((pkg, idx) => pkg.code !== `${p.code}.GT.${String(idx + 1).padStart(2, '0')}`);
        if (needsUpdate && pkgs.length > 0 && isAdmin) {
          reorderBiddingPackages(pkgs, p.code).catch(e => console.error(e));
        }
      });
    }
  }, [projects, biddingPackages, isAdmin, reorderBiddingPackages]);

  const handleAdd = async (projectId, row) => {
    const { _new, ...data } = row;
    const pkgs = getPackages(projectId);
    await addBiddingPackage(projectId, { ...data, order: pkgs.length });
    if (data.name) await addListItem('packageNames', data.name);
  };

  const handleAddMultiple = async (projectId, names) => {
    const pkgs = getPackages(projectId);
    let startOrder = pkgs.length;
    for (const name of names) {
      const { _new, ...data } = { ...EMPTY_ROW(), name };
      await addBiddingPackage(projectId, { ...data, order: startOrder++ });
      await addListItem('packageNames', name);
    }
  };

  const handleSave = async (projectId, pkgId, updated) => {
    await editBiddingPackage(projectId, pkgId, updated);
    if (updated.name) await addListItem('packageNames', updated.name);
  };

  const handleDelete = async (project, pkgId) => {
    if (window.confirm('Xóa gói thầu này?')) {
      await deleteBiddingPackage(project.id, pkgId);
      // Wait for deletion to propagate to state, then migration effect or next action will fix codes.
      // To be strictly correct, we reorder remaining manually:
      const remaining = getPackages(project.id).filter(p => p.id !== pkgId);
      if (remaining.length > 0) await reorderBiddingPackages(remaining, project.code);
    }
  };

  // Reassign all order values after swap using batch
  const handleMoveUp = async (project, pkgs, idx) => {
    if (idx === 0) return;
    const reordered = [...pkgs];
    [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
    await reorderBiddingPackages(reordered, project.code);
  };

  const handleMoveDown = async (project, pkgs, idx) => {
    if (idx >= pkgs.length - 1) return;
    const reordered = [...pkgs];
    [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
    await reorderBiddingPackages(reordered, project.code);
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
              onAddMultiple={handleAddMultiple}
              onSave={handleSave}
              onDelete={handleDelete}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onEdit={(project, pkg) => setEditingData({ project, pkg })}
            />
          ))}
        </div>
      )}

      {/* Edit Modal Overlay (Rendered at Root) */}
      {editingData && (
        <EditPackageModal
          pkg={editingData.pkg}
          projectCode={editingData.project.code}
          projectName={editingData.project.name}
          onClose={() => setEditingData(null)}
          onSave={(updated) => {
            handleSave(editingData.project.id, editingData.pkg.id, updated);
            setEditingData(null);
          }}
        />
      )}
    </div>
  );
};

export default BiddingPlan;
