import React, { useState, useContext } from 'react';
import { DocumentContext } from '../context/DocumentContext';
import { getPastelColor } from '../data';
import { ChevronDown, ChevronUp, Plus, Trash2, ArrowUp, ArrowDown, Briefcase, Star, X } from 'lucide-react';
import Select, { components } from 'react-select';

const STATUS_OPTIONS = ['Chưa mời thầu', 'Đã mời thầu', 'Đang làm thầu', 'Đã nộp thầu'];

// Styles
const cell = (w) => ({ padding: '6px 8px', borderBottom: '1px solid var(--color-border)', fontSize: '0.78rem', width: w ? `${w}px` : 'auto' });
const thStyle = (w) => ({ padding: '10px 8px', borderBottom: '2px solid var(--color-border)', textAlign: 'left', fontWeight: '700', color: 'var(--color-text-main)', fontSize: '0.8rem', backgroundColor: '#f8fafc', width: w ? `${w}px` : 'auto' });
const btn = { background: 'none', border: 'none', cursor: 'pointer', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' };
const inputBase = { width: '100%', border: 'none', outline: 'none', padding: '5px 8px', fontSize: '0.78rem', backgroundColor: 'transparent', color: 'var(--color-text-main)', fontFamily: 'inherit' };

const filterPartnersByPackage = (partners, pkg) => {
  if (!pkg) return partners;

  let requiredKeywords = [];
  const natureL = (pkg.nature || '').toLowerCase();

  if (natureL) {
    if (natureL.includes('xây lắp')) requiredKeywords.push('thi công', 'xây dựng');
    if (natureL.includes('tư vấn')) requiredKeywords.push('tư vấn', 'giám sát');
    if (natureL.includes('mua sắm')) requiredKeywords.push('cung cấp', 'vật tư', 'thiết bị');
  } else if (pkg.name) {
    const nameL = pkg.name.toLowerCase();
    if (nameL.includes('thi công') || nameL.includes('xây dựng') || nameL.includes('cọc')) requiredKeywords.push('thi công', 'xây dựng');
    if (nameL.includes('tư vấn') || nameL.includes('thiết kế') || nameL.includes('báo cáo') || nameL.includes('kiểm toán')) requiredKeywords.push('tư vấn');
    if (nameL.includes('giám sát')) requiredKeywords.push('giám sát', 'tư vấn');
    if (nameL.includes('cung cấp') || nameL.includes('mua sắm') || nameL.includes('thiết bị') || nameL.includes('hàng hóa')) requiredKeywords.push('cung cấp', 'vật tư');
  }

  if (requiredKeywords.length === 0) return partners;

  const filtered = partners.filter(p => {
    const pTypes = Array.isArray(p.type) ? p.type : (p.type ? [p.type] : []);
    const pTypeStr = pTypes.join(' ').toLowerCase();
    return requiredKeywords.some(kw => pTypeStr.includes(kw));
  });

  return filtered.length > 0 ? filtered : partners;
};

const PartnerOption = (props) => {
  return (
    <components.Option {...props}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={12} fill={i <= (props.data.rating || 0) ? '#f59e0b' : 'transparent'} color={i <= (props.data.rating || 0) ? '#f59e0b' : '#d1d5db'} />
          ))}
        </div>
        <span style={{ fontWeight: '500' }}>{props.data.label}</span>
      </div>
    </components.Option>
  );
};

const PartnerSingleValue = (props) => (
  <components.SingleValue {...props}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={12} fill={i <= (props.data.rating || 0) ? '#f59e0b' : 'transparent'} color={i <= (props.data.rating || 0) ? '#f59e0b' : '#d1d5db'} />
        ))}
      </div>
      <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{props.data.label}</span>
    </div>
  </components.SingleValue>
);

// ─── Cell Input ─────────────────────────────────────────────────────────────
const CellInput = ({ value, onChange, type, partners, pkg, statusOptions }) => {
  if (type === 'partner') {
    const filteredPartners = filterPartnersByPackage(partners, pkg);
    const options = filteredPartners.map(p => ({ value: p.id, label: p.name, rating: p.rating || 0 }));
    const selectedOption = options.find(o => o.value === value) || null;

    return (
      <Select
        value={selectedOption}
        onChange={opt => onChange(opt ? opt.value : '')}
        options={options}
        placeholder="— Chọn nhà thầu —"
        components={{ Option: PartnerOption, SingleValue: PartnerSingleValue }}
        menuPortalTarget={document.body}
        styles={{
          control: (base) => ({ ...base, minHeight: '32px', border: 'none', boxShadow: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '0.78rem' }),
          valueContainer: (base) => ({ ...base, padding: '0 8px' }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          menu: (base) => ({ ...base, fontSize: '0.78rem' })
        }}
      />
    );
  }
  if (type === 'status') {
    const options = statusOptions || STATUS_OPTIONS;
    const getBg = (s) => {
      const lowerS = (s || '').toLowerCase();
      if (lowerS.includes('nộp') || lowerS.includes('trúng')) return '#dcfce7'; // green
      if (lowerS.includes('đang làm')) return '#dbeafe'; // blue
      if (lowerS.includes('mời thầu')) return '#fef08a'; // yellow
      if (lowerS.includes('chấm')) return '#f3e8ff'; // purple
      if (lowerS.includes('rút') || lowerS.includes('trượt') || lowerS.includes('không')) return '#fee2e2'; // red
      return '#f1f5f9'; // gray
    };
    const getColor = (s) => {
      const lowerS = (s || '').toLowerCase();
      if (lowerS.includes('nộp') || lowerS.includes('trúng')) return '#166534';
      if (lowerS.includes('đang làm')) return '#1e40af';
      if (lowerS.includes('mời thầu')) return '#854d0e';
      if (lowerS.includes('chấm')) return '#6b21a8';
      if (lowerS.includes('rút') || lowerS.includes('trượt') || lowerS.includes('không')) return '#991b1b';
      return '#475569';
    };
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
        <select value={value || options[0]} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', border: 'none', background: getBg(value || options[0]), color: getColor(value || options[0]), borderRadius: '12px', padding: '2px 8px', outline: 'none', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', appearance: 'none', textAlign: 'center' }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  return null;
};

// ─── DataRow ─────────────────────────────────────────────────────────────────
const DataRow = ({ bidder, idx, total, isAdmin, onUpdate, onDelete, onMoveUp, onMoveDown, partners, pkg, onEmailPreview, statusOptions }) => {
  const bg = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(248, 250, 252, 0.3)';

  return (
    <tr style={{ backgroundColor: bg, transition: 'background-color 0.15s' }}>
      {isAdmin && (
        <td style={{ ...cell(72), padding: '3px 4px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
            <button onClick={onMoveUp} disabled={idx === 0}
              style={{ ...btn, color: idx === 0 ? '#cbd5e1' : 'var(--color-primary)', cursor: idx === 0 ? 'default' : 'pointer' }}>
              <ArrowUp size={13} />
            </button>
            <button onClick={onMoveDown} disabled={idx === total - 1}
              style={{ ...btn, color: idx === total - 1 ? '#cbd5e1' : 'var(--color-primary)', cursor: idx === total - 1 ? 'default' : 'pointer' }}>
              <ArrowDown size={13} />
            </button>
          </div>
        </td>
      )}

      <td style={{ ...cell(50), textAlign: 'center', color: 'var(--color-text-muted)' }}>{idx + 1}</td>

      <td style={{ ...cell() }}>
        <CellInput type="partner" value={bidder.partnerId} onChange={v => onUpdate('partnerId', v)} partners={partners} pkg={pkg} />
      </td>

      <td style={{ ...cell(160) }}>
        <CellInput
          type="status"
          value={bidder.status}
          statusOptions={statusOptions}
          onChange={v => {
            onUpdate('status', v);
            if (v === 'Đã mời thầu') {
              const partner = partners.find(p => String(p.id) === String(bidder.partnerId));
              if (partner) {
                if (onEmailPreview) onEmailPreview({ partner, pkg });
              }
            }
          }}
        />
      </td>

      {isAdmin && (
        <td style={{ ...cell(46), textAlign: 'center' }}>
          <button onClick={onDelete} style={{ ...btn, color: 'var(--color-danger)', margin: '0 auto' }}>
            <Trash2 size={14} />
          </button>
        </td>
      )}
    </tr>
  );
};

// ─── NewRow ──────────────────────────────────────────────────────────────────
const NewRow = ({ onAdd, isAdmin, partners, pkg, statusOptions }) => {
  const defaultStatus = statusOptions && statusOptions.length > 0 ? statusOptions[0] : 'Chưa mời thầu';
  const [data, setData] = useState({ partnerId: '', status: defaultStatus });

  const handleAdd = () => {
    if (!data.partnerId) return;
    onAdd({ id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() });
    setData({ partnerId: '', status: defaultStatus });
  };

  return (
    <tr style={{ backgroundColor: '#f8fafc' }}>
      {isAdmin && <td style={{ ...cell(72), borderRight: '1px solid var(--color-border)' }} />}
      <td style={{ ...cell(50), textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem' }}>+</td>

      <td style={{ ...cell() }}>
        <CellInput type="partner" value={data.partnerId} onChange={v => setData({ ...data, partnerId: v })} partners={partners} pkg={pkg} />
      </td>

      <td style={{ ...cell(160) }}>
        <CellInput type="status" value={data.status} onChange={v => setData({ ...data, status: v })} statusOptions={statusOptions} />
      </td>

      {isAdmin && (
        <td style={{ ...cell(46), textAlign: 'center' }}>
          <button onClick={handleAdd} disabled={!data.partnerId}
            style={{ ...btn, color: '#fff', background: data.partnerId ? 'var(--color-primary)' : '#cbd5e1', cursor: data.partnerId ? 'pointer' : 'not-allowed', padding: '4px', margin: '0 auto' }}>
            <Plus size={14} />
          </button>
        </td>
      )}
    </tr>
  );
};

// ─── Package Datasheet ───────────────────────────────────────────────────────
const PackageDatasheet = ({ pkg, project, isAdmin, onSave, partners, onEmailPreview, statusOptions }) => {
  const [expanded, setExpanded] = useState(true);
  const bgColor = getPastelColor(pkg.id || pkg.name);
  const bidders = pkg.bidders || [];

  const handleAdd = (newBidder) => {
    const newBidders = [...bidders, { ...newBidder, order: bidders.length }];
    onSave({ ...pkg, bidders: newBidders });
  };

  const handleUpdate = (idx, key, val) => {
    const newBidders = [...bidders];
    newBidders[idx] = { ...newBidders[idx], [key]: val };
    onSave({ ...pkg, bidders: newBidders });
  };

  const handleDelete = (id) => {
    const newBidders = bidders.filter(b => b.id !== id);
    onSave({ ...pkg, bidders: newBidders });
  };

  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    const newBidders = [...bidders];
    [newBidders[idx - 1], newBidders[idx]] = [newBidders[idx], newBidders[idx - 1]];
    // Cập nhật lại order
    newBidders.forEach((b, i) => b.order = i);
    onSave({ ...pkg, bidders: newBidders });
  };

  const handleMoveDown = (idx) => {
    if (idx === bidders.length - 1) return;
    const newBidders = [...bidders];
    [newBidders[idx + 1], newBidders[idx]] = [newBidders[idx], newBidders[idx + 1]];
    newBidders.forEach((b, i) => b.order = i);
    onSave({ ...pkg, bidders: newBidders });
  };

  return (
    <div className="card fade-in" style={{ 
      padding: 0, 
      overflow: 'hidden', 
      background: 'rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.7)', 
      borderRadius: '16px',
      boxShadow: '0 15px 45px -5px rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)' 
    }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', background: `linear-gradient(135deg, ${bgColor}CC 0%, ${bgColor}66 100%)`, borderBottom: expanded ? '1px solid rgba(255, 255, 255, 0.4)' : 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '3px 8px', backgroundColor: 'var(--color-bg-surface-hover)', color: 'var(--color-text-muted)', borderRadius: '6px', flexShrink: 0, marginTop: '2px' }}>
                {pkg.code || 'Chưa có mã'}
              </span>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-main)', fontWeight: '700', lineHeight: '1.3' }}>{pkg.name}</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                <div style={{ color: 'var(--color-text-muted)' }}>{bidders.length} nhà thầu tham dự</div>
              </div>
              <button onClick={() => setExpanded(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
                {expanded ? <><ChevronUp size={14} /> Thu gọn</> : <><ChevronDown size={14} /> Mở datasheet</>}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', color: 'var(--color-text-muted)', fontSize: '0.8rem', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
              <Briefcase size={14} style={{ flexShrink: 0 }} /> 
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dự án: {project.name}</span>
            </div>
            {pkg.nature && (
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: '600', backgroundColor: '#eff6ff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid #bfdbfe' }}>{pkg.nature}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Datasheet */}
      {expanded && (
        <div style={{ overflowX: 'auto', borderTop: '2px solid var(--color-border)' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.78rem', tableLayout: 'fixed', minWidth: '100%' }}>
            <thead>
              <tr>
                {isAdmin && <th style={{ ...thStyle(72) }}>Di chuyển</th>}
                <th style={{ ...thStyle(50), textAlign: 'center' }}>STT</th>
                <th style={{ ...thStyle() }}>Danh sách nhà thầu tham dự</th>
                <th style={{ ...thStyle(160) }}>Trạng thái</th>
                {isAdmin && <th style={{ ...thStyle(46), textAlign: 'center' }}>Xóa</th>}
              </tr>
            </thead>
            <tbody>
              {bidders.length === 0 && !isAdmin && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.82rem' }}>
                    Chưa có nhà thầu nào tham dự.
                  </td>
                </tr>
              )}
              {bidders.sort((a, b) => a.order - b.order).map((bidder, idx) => (
                <DataRow key={bidder.id} bidder={bidder} idx={idx} total={bidders.length} isAdmin={isAdmin} partners={partners} pkg={pkg}
                  statusOptions={statusOptions}
                  onUpdate={(k, v) => handleUpdate(idx, k, v)}
                  onDelete={() => handleDelete(bidder.id)}
                  onMoveUp={() => handleMoveUp(idx)}
                  onMoveDown={() => handleMoveDown(idx)}
                  onEmailPreview={onEmailPreview}
                />
              ))}

              {/* New row */}
              {isAdmin && (
                <NewRow onAdd={handleAdd} isAdmin={isAdmin} partners={partners} pkg={pkg} statusOptions={statusOptions} />
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const ContractorSelection = () => {
  const { projects, userRole, biddingPackages = [], editBiddingPackage, partners = [], globalLists } = useContext(DocumentContext);
  const isAdmin = userRole === 'Admin';
  
  const statusOptions = globalLists?.bidderStatuses?.map(s => s.name) || STATUS_OPTIONS;

  const [filters, setFilters] = useState({ keyword: '', project: '', nature: '' });
  const [emailPreview, setEmailPreview] = useState(null);

  // Lấy các package có dự án hợp lệ và đã được phê duyệt
  let validPackages = biddingPackages.filter(p =>
    projects.some(proj => String(proj.id) === String(p.projectId)) &&
    (p.status === 'Đã phê duyệt' || p.status === '✅ Đã phê duyệt')
  );

  // Áp dụng bộ lọc
  validPackages = validPackages.filter(pkg => {
    const project = projects.find(proj => String(proj.id) === String(pkg.projectId));

    if (filters.project && project?.name !== filters.project) {
      return false;
    }

    if (filters.nature && pkg.nature !== filters.nature) {
      return false;
    }

    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const codeMatch = (pkg.code || '').toLowerCase().includes(kw);
      const nameMatch = (pkg.name || '').toLowerCase().includes(kw);
      if (!codeMatch && !nameMatch) return false;
    }

    return true;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ keyword: '', project: '', nature: '' });
  };

  const hasFilter = filters.keyword || filters.project || filters.nature;

  const handleSavePackage = (updatedPkg) => {
    editBiddingPackage(updatedPkg.projectId, updatedPkg.id, updatedPkg);
  };

  return (
    <div className="fade-in" style={{ padding: '1.5rem', position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 60px)' }}>
      {/* Background blobs for Glassmorphism */}
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(147,197,253,0.35) 0%, rgba(255,255,255,0) 70%)', zIndex: -1, pointerEvents: 'none' }}></div>
      <div style={{ position: 'fixed', bottom: '10%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,168,212,0.25) 0%, rgba(255,255,255,0) 70%)', zIndex: -1, pointerEvents: 'none' }}></div>
      <div style={{ position: 'fixed', top: '30%', left: '30%', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,243,208,0.25) 0%, rgba(255,255,255,0) 70%)', zIndex: -1, pointerEvents: 'none' }}></div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
          🤝 Lựa chọn nhà thầu
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          {validPackages.length} gói thầu • Quản lý danh sách nhà thầu tham dự cho từng gói thầu
        </p>
      </div>

      <div className="card" style={{ 
        padding: '1.25rem', marginBottom: '1.5rem', 
        background: 'rgba(255, 255, 255, 0.4)', 
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.7)', borderRadius: '16px',
        boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.12)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 250px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Từ khóa (Mã, Tên gói thầu)</label>
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              className="input-field"
              placeholder="Nhập mã hoặc tên gói thầu..."
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Dự án liên quan</label>
            <select name="project" value={filters.project} onChange={handleFilterChange} className="input-field">
              <option value="">Tất cả dự án</option>
              {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Tính chất gói thầu</label>
              <select name="nature" value={filters.nature} onChange={handleFilterChange} className="input-field">
                <option value="">Tất cả tính chất</option>
                {(globalLists?.packageNatures || []).map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
              </select>
            </div>
            {hasFilter && (
              <button
                onClick={handleClearFilters}
                title="Bỏ lọc"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5',
                  width: '35px', height: '35px', borderRadius: '4px', cursor: 'pointer',
                  flexShrink: 0
                }}>
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {validPackages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          Chưa có gói thầu nào. Vui lòng tạo gói thầu ở trang "Kế hoạch LCNT".
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
          {validPackages.map(pkg => {
            const project = projects.find(proj => String(proj.id) === String(pkg.projectId));
            return (
              <PackageDatasheet
                key={pkg.id}
                pkg={pkg}
                project={project}
                isAdmin={isAdmin}
                onSave={handleSavePackage}
                partners={partners}
                onEmailPreview={setEmailPreview}
                statusOptions={statusOptions}
              />
            );
          })}
        </div>
      )}

      {/* Email Preview Modal */}
      {emailPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card fade-in" style={{ width: '640px', maxWidth: '95%', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text-main)' }}>Nội dung thư mời thầu</h3>
              <button onClick={() => setEmailPreview(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
              <div style={{ marginBottom: '1rem', display: 'flex' }}>
                <span style={{ fontWeight: '600', color: 'var(--color-text-muted)', fontSize: '0.85rem', width: '80px' }}>Gửi đến: </span>
                <span style={{ fontWeight: '600', color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{emailPreview.partner.name} &lt;{emailPreview.partner.email || 'Chưa cập nhật email'}&gt;</span>
              </div>
              <div style={{ marginBottom: '1.5rem', display: 'flex' }}>
                <span style={{ fontWeight: '600', color: 'var(--color-text-muted)', fontSize: '0.85rem', width: '80px' }}>Chủ đề: </span>
                <span style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '0.9rem' }}>
                  Thư mời thầu - [{emailPreview.pkg.code || 'Mã GT'}]: {emailPreview.pkg.name || 'Tên gói thầu'}
                </span>
              </div>

              <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#fdfdfd', fontSize: '0.9rem', lineHeight: '1.6' }}>
                <p>Kính gửi Ban Giám đốc <strong>{emailPreview.partner.name}</strong>,</p>
                <p>Ban Quản lý dự án trân trọng kính mời Quý công ty tham gia đấu thầu:</p>
                <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li><strong>Mã gói thầu:</strong> {emailPreview.pkg.code || 'Chưa cập nhật'}</li>
                  <li><strong>Tên gói thầu:</strong> {emailPreview.pkg.name || 'Chưa cập nhật'}</li>
                </ul>
                <p>Để thuận tiện cho công tác chuẩn bị, Quý công ty vui lòng phản hồi lại bằng cách click vào một trong hai nút dưới đây:</p>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                  <a href={`mailto:banquanly@duan.vn?subject=${encodeURIComponent('Xác nhận tham gia gói thầu ' + (emailPreview.pkg.code || ''))}&body=${encodeURIComponent('Chúng tôi xác nhận sẽ tham gia gói thầu này.')}`}
                    style={{ display: 'inline-block', backgroundColor: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem', boxShadow: '0 2px 4px rgba(16,185,129,0.2)' }}>
                    ✓ XÁC NHẬN THAM GIA
                  </a>
                  <a href={`mailto:banquanly@duan.vn?subject=${encodeURIComponent('Từ chối tham gia gói thầu ' + (emailPreview.pkg.code || ''))}&body=${encodeURIComponent('Chúng tôi rất tiếc không thể tham gia gói thầu này.')}`}
                    style={{ display: 'inline-block', backgroundColor: '#ef4444', color: 'white', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem', boxShadow: '0 2px 4px rgba(239,68,68,0.2)' }}>
                    ✕ TỪ CHỐI THAM GIA
                  </a>
                </div>

                <p style={{ margin: 0 }}>Rất mong nhận được sự hợp tác từ Quý công ty.<br />Trân trọng,<br /><strong>Ban Quản lý dự án.</strong></p>
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#f59e0b', fontStyle: 'italic', display: 'flex', gap: '6px' }}>
                * Lưu ý: Khi gửi qua Mail Client, các nút bấm sẽ tự động được chuyển đổi thành định dạng phù hợp.
              </div>
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: '#f8fafc' }}>
              <button onClick={() => setEmailPreview(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', color: 'var(--color-text-main)' }}>Đóng</button>
              <button
                onClick={() => {
                  const pCode = emailPreview.pkg.code || 'Mã GT';
                  const pName = emailPreview.pkg.name || 'Tên gói thầu';
                  const subject = encodeURIComponent(`Thư mời thầu - [${pCode}]: ${pName}`);
                  const bodyText = `Kính gửi Ban Giám đốc ${emailPreview.partner.name},

Ban Quản lý dự án trân trọng kính mời Quý công ty tham gia đấu thầu:
- Mã gói thầu: ${pCode}
- Tên gói thầu: ${pName}

Để thuận tiện cho công tác chuẩn bị, Quý công ty vui lòng phản hồi lại bằng cách trả lời "Xác nhận tham gia" hoặc "Từ chối tham gia" vào email này.

Rất mong nhận được sự hợp tác từ Quý công ty.
Trân trọng,
Ban Quản lý dự án.`;
                  window.open(`mailto:${emailPreview.partner.email || ''}?subject=${subject}&body=${encodeURIComponent(bodyText)}`, '_blank');
                  setEmailPreview(null);
                }}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
                Soạn & Gửi ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorSelection;
