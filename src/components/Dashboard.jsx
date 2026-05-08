import React, { useContext, useState, useMemo } from 'react';
import { DocumentContext } from '../context/DocumentContext';
import FilterPanel from './FilterPanel';
import DocumentCard from './DocumentCard';
import { LayoutGrid, List } from 'lucide-react';

const Dashboard = () => {
  const { documents } = useContext(DocumentContext);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    keyword: '',
    project: '',
    agency: '',
    documentType: '',
    dateFrom: '',
    dateTo: ''
  });

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      // Filter by keyword (code, number, summary)
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        const matchKeyword = 
          doc.documentCode.toLowerCase().includes(kw) || 
          doc.documentNumber.toLowerCase().includes(kw) || 
          doc.summary.toLowerCase().includes(kw);
        if (!matchKeyword) return false;
      }
      
      // Filter by project
      if (filters.project && !doc.relatedProjects.includes(filters.project)) {
        return false;
      }

      // Filter by agency
      if (filters.agency && doc.issuingAgency !== filters.agency) {
        return false;
      }

      // Filter by documentType
      if (filters.documentType && doc.documentType !== filters.documentType) {
        return false;
      }

      // Filter by date range
      if (filters.dateFrom && new Date(doc.effectiveDate) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(doc.effectiveDate) > new Date(filters.dateTo)) {
        return false;
      }

      return true;
    });
  }, [documents, filters]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
            Tài liệu dự án
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Quản lý và tra cứu {documents.length} tài liệu trong hệ thống
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--color-bg-surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <button 
            onClick={() => setViewMode('grid')}
            style={{ 
              padding: '0.375rem', borderRadius: 'var(--radius-sm)',
              backgroundColor: viewMode === 'grid' ? 'var(--color-bg-surface-hover)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-muted)'
            }}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            style={{ 
              padding: '0.375rem', borderRadius: 'var(--radius-sm)',
              backgroundColor: viewMode === 'list' ? 'var(--color-bg-surface-hover)' : 'transparent',
              color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-muted)'
            }}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <FilterPanel filters={filters} setFilters={setFilters} />

      <div style={{ flex: 1 }}>
        {filteredDocs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>Không tìm thấy tài liệu nào phù hợp với bộ lọc.</p>
            <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => setFilters({keyword: '', project: '', agency: '', documentType: '', dateFrom: '', dateTo: ''})}>
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr', 
            gap: '1.5rem',
            paddingBottom: '2rem'
          }}>
            {filteredDocs.map(doc => (
              <DocumentCard key={doc.id} document={doc} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
