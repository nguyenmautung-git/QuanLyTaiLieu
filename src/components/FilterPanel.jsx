import React, { useContext } from 'react';
import { ALL_PROJECTS, ALL_AGENCIES } from '../data';
import { DocumentContext } from '../context/DocumentContext';

const FilterPanel = ({ filters, setFilters }) => {
  const { documentTypes } = useContext(DocumentContext);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        
        <div className="form-group" style={{ marginBottom: 0, flex: '1 1 180px' }}>
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Từ khóa (Mã, Số, Trích yếu)</label>
          <input 
            type="text" 
            name="keyword" 
            value={filters.keyword} 
            onChange={handleChange} 
            className="input-field" 
            placeholder="Nhập từ khóa..." 
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0, flex: '1 1 160px' }}>
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Dự án liên quan</label>
          <select name="project" value={filters.project} onChange={handleChange} className="input-field">
            <option value="">Tất cả dự án</option>
            {ALL_PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0, flex: '1 1 160px' }}>
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Cơ quan ban hành</label>
          <select name="agency" value={filters.agency} onChange={handleChange} className="input-field">
            <option value="">Tất cả cơ quan</option>
            {ALL_AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0, flex: '1 1 160px' }}>
          <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Loại tài liệu</label>
          <select name="documentType" value={filters.documentType} onChange={handleChange} className="input-field">
            <option value="">Tất cả phân loại</option>
            {documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flex: '1 1 260px' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Từ ngày</label>
            <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange} className="input-field" />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Đến ngày</label>
            <input type="date" name="dateTo" value={filters.dateTo} onChange={handleChange} className="input-field" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default FilterPanel;
