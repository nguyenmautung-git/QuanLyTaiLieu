import React, { useState, useContext } from 'react';
import { DocumentContext } from '../context/DocumentContext';
import { getPastelColor } from '../data';
import { ChevronDown, ChevronUp, Plus, Trash2, ArrowUp, ArrowDown, Briefcase } from 'lucide-react';

const STATUS_OPTIONS = ['Chưa mời thầu', 'Đã mời thầu', 'Đang làm thầu', 'Đã nộp thầu'];

// Styles
const cell = (w) => ({ padding: '6px 8px', borderBottom: '1px solid var(--color-border)', fontSize: '0.78rem', width: w ? `${w}px` : 'auto' });
const thStyle = (w) => ({ padding: '10px 8px', borderBottom: '2px solid var(--color-border)', textAlign: 'left', fontWeight: '700', color: 'var(--color-text-main)', fontSize: '0.8rem', backgroundColor: '#f8fafc', width: w ? `${w}px` : 'auto' });
const btn = { background: 'none', border: 'none', cursor: 'pointer', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' };
const inputBase = { width: '100%', border: 'none', outline: 'none', padding: '5px 8px', fontSize: '0.78rem', backgroundColor: 'transparent', color: 'var(--color-text-main)', fontFamily: 'inherit' };

// ─── Cell Input ─────────────────────────────────────────────────────────────
const CellInput = ({ value, onChange, type, partners }) => {
  if (type === 'partner') {
    return (
      <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputBase, cursor: 'pointer' }}>
        <option value="">— Chọn nhà thầu —</option>
        {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    );
  }
  if (type === 'status') {
    const getBg = (s) => {
      if (s === 'Đã nộp thầu') return '#dcfce7'; // green
      if (s === 'Đang làm thầu') return '#dbeafe'; // blue
      if (s === 'Đã mời thầu') return '#fef08a'; // yellow
      return '#f1f5f9'; // gray
    };
    const getColor = (s) => {
      if (s === 'Đã nộp thầu') return '#166534';
      if (s === 'Đang làm thầu') return '#1e40af';
      if (s === 'Đã mời thầu') return '#854d0e';
      return '#475569';
    };
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
        <select value={value} onChange={e => onChange(e.target.value)} 
          style={{ width: '100%', border: 'none', background: getBg(value), color: getColor(value), borderRadius: '12px', padding: '2px 8px', outline: 'none', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', appearance: 'none', textAlign: 'center' }}>
          {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  return null;
};

// ─── DataRow ─────────────────────────────────────────────────────────────────
const DataRow = ({ bidder, idx, total, isAdmin, onUpdate, onDelete, onMoveUp, onMoveDown, partners }) => {
  const bg = idx % 2 === 0 ? '#ffffff' : 'var(--color-bg-surface)';
  
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
        <CellInput type="partner" value={bidder.partnerId} onChange={v => onUpdate('partnerId', v)} partners={partners} />
      </td>
      
      <td style={{ ...cell(160) }}>
        <CellInput type="status" value={bidder.status} onChange={v => onUpdate('status', v)} />
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
const NewRow = ({ onAdd, isAdmin, partners }) => {
  const [data, setData] = useState({ partnerId: '', status: 'Chưa mời thầu' });

  const handleAdd = () => {
    if (!data.partnerId) return;
    onAdd({ id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() });
    setData({ partnerId: '', status: 'Chưa mời thầu' });
  };

  return (
    <tr style={{ backgroundColor: '#f8fafc' }}>
      {isAdmin && <td style={{ ...cell(72), borderRight: '1px solid var(--color-border)' }} />}
      <td style={{ ...cell(50), textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem' }}>+</td>
      
      <td style={{ ...cell() }}>
        <CellInput type="partner" value={data.partnerId} onChange={v => setData({ ...data, partnerId: v })} partners={partners} />
      </td>
      
      <td style={{ ...cell(160) }}>
        <CellInput type="status" value={data.status} onChange={v => setData({ ...data, status: v })} />
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
const PackageDatasheet = ({ pkg, project, isAdmin, onSave, partners }) => {
  const [expanded, setExpanded] = useState(true);
  const color = getPastelColor(project.name);
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
    <div className="card fade-in" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#fdfdfd', borderBottom: expanded ? '1px solid var(--color-border)' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
            {/* Avatar Dự án */}
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: color.bg, color: color.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}>
              {project.name.charAt(0).toUpperCase()}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', backgroundColor: 'var(--color-bg-surface-hover)', color: 'var(--color-text-muted)', borderRadius: '12px' }}>
                  {pkg.code || 'Chưa có mã'}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-main)', fontWeight: '700' }}>{pkg.name}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Briefcase size={14} /> Dự án: {project.name}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
              <div style={{ color: 'var(--color-text-muted)' }}>{bidders.length} nhà thầu tham dự</div>
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
                <DataRow key={bidder.id} bidder={bidder} idx={idx} total={bidders.length} isAdmin={isAdmin} partners={partners}
                  onUpdate={(k, v) => handleUpdate(idx, k, v)}
                  onDelete={() => handleDelete(bidder.id)}
                  onMoveUp={() => handleMoveUp(idx)}
                  onMoveDown={() => handleMoveDown(idx)}
                />
              ))}
              
              {/* New row */}
              {isAdmin && (
                <NewRow onAdd={handleAdd} isAdmin={isAdmin} partners={partners} />
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
  const { projects, userRole, biddingPackages = [], editBiddingPackage, partners = [] } = useContext(DocumentContext);
  const isAdmin = userRole === 'Admin';

  // Lấy các package có dự án hợp lệ
  const validPackages = biddingPackages.filter(p => projects.some(proj => String(proj.id) === String(p.projectId)));

  const handleSavePackage = (updatedPkg) => {
    editBiddingPackage(updatedPkg.projectId, updatedPkg.id, updatedPkg);
  };

  return (
    <div className="fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
          🤝 Lựa chọn nhà thầu
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          {validPackages.length} gói thầu • Quản lý danh sách nhà thầu tham dự cho từng gói thầu
        </p>
      </div>

      {validPackages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          Chưa có gói thầu nào. Vui lòng tạo gói thầu ở trang "Kế hoạch LCNT".
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
          {validPackages.map(pkg => {
            const project = projects.find(proj => String(proj.id) === String(pkg.projectId));
            return (
              <PackageDatasheet
                key={pkg.id}
                pkg={pkg}
                project={project}
                isAdmin={isAdmin}
                partners={partners}
                onSave={handleSavePackage}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContractorSelection;
