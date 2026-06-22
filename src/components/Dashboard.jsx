import React, { useContext, useState, useMemo, useCallback } from 'react';
import { DocumentContext } from '../context/DocumentContext';
import { useToast } from '../context/UIContext';
import FilterPanel from './FilterPanel';
import DocumentCard from './DocumentCard';
import { LayoutGrid, List, Download, X, CheckSquare } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { ref as storageRef, getBlob } from 'firebase/storage';
import { storage } from '../firebase';


const EMPTY_FILTERS = { keyword: '', project: [], agency: '', documentType: '', dateFrom: '', dateTo: '' };
const safeName = (s) => (s || 'TaiLieu').replace(/[/\\:*?"<>|]/g, '_').trim();

const Dashboard = () => {
  const { allDocuments: documents } = useContext(DocumentContext);
  const toast = useToast();
  const [viewMode, setViewMode]       = useState('grid');
  const [filters, setFilters]         = useState(EMPTY_FILTERS);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // ── Lọc tài liệu ────────────────────────────────────────────────────────
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      // Filter "Tài liệu đã chọn"
      if (showSelectedOnly && !selectedIds.has(doc.id)) return false;

      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        const match =
          (doc.documentCode || '').toLowerCase().includes(kw) ||
          (doc.documentNumber || '').toLowerCase().includes(kw) ||
          (doc.summary || '').toLowerCase().includes(kw);
        if (!match) return false;
      }
      if (filters.project && filters.project.length > 0) {
        const docProjects = doc.relatedProjects || [];
        const hasMatch = filters.project.some(pName => docProjects.includes(pName));
        if (!hasMatch) return false;
      }
      if (filters.agency && doc.issuingAgency !== filters.agency) return false;
      if (filters.documentType && doc.documentType !== filters.documentType) return false;
      if (filters.dateFrom && new Date(doc.effectiveDate) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo   && new Date(doc.effectiveDate) > new Date(filters.dateTo))   return false;
      return true;
    });
  }, [documents, filters, showSelectedOnly, selectedIds]);

  // ── Toggle chọn / bỏ chọn ──────────────────────────────────────────────
  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const clearSelection = () => {
    setSelectedIds(new Set());
    setShowSelectedOnly(false);
  };

  // ── Lấy blob từ Firebase Storage SDK (không cần CORS) ──────────────────
  const fetchBlobFromFirebase = async (url) => {
    // Trích xuất storage path từ URL dạng:
    // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encoded_path}?alt=media&token=...
    const match = url.match(/\/o\/(.+?)(\?|$)/);
    if (!match) {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Không thể tải tệp trực tiếp.');
      return await res.blob();
    }
    const path = decodeURIComponent(match[1]);
    const fileRef = storageRef(storage, path);
    return await getBlob(fileRef);
  };

  // ── Tải xuống ZIP ───────────────────────────────────────────────────────
  const handleDownload = async () => {
    const selected = documents.filter(d => selectedIds.has(d.id));
    const withFiles = selected.filter(d => d.attachments?.length > 0);

    if (withFiles.length === 0) {
      toast.warning('Các tài liệu đã chọn không có tệp đính kèm nào để tải xuống.');
      return;
    }

    setDownloading(true);
    const zip = new JSZip();
    const errs = [];
    const downloadPromises = [];

    for (const doc of withFiles) {
      const folder = zip.folder(safeName(doc.documentNumber || doc.documentCode || doc.id));
      for (const file of (doc.attachments || [])) {
        const downloadTask = (async () => {
          try {
            // Chạy tải xuống song song
            const blob = await fetchBlobFromFirebase(file.url);
            folder.file(file.name || 'file', blob);
          } catch (e) {
            errs.push(`${doc.documentNumber} / ${file.name}: ${e.message}`);
            // Fallback: Tạo file txt hướng dẫn tải trực tiếp
            const fallbackText = `HỆ THỐNG QUẢN LÝ DỰ ÁN - THÔNG BÁO TẢI TỆP\n--------------------------------------------------\nTệp tin: ${file.name || 'Không rõ tên'}\nThuộc tài liệu số: ${doc.documentNumber || 'Không rõ số'}\nMã tài liệu: ${doc.documentCode || 'Không rõ mã'}\n\nKhông thể tải xuống tệp tin này tự động vào tệp ZIP do:\n- Giới hạn bảo mật trình duyệt (CORS / Mixed Content).\n- Hoặc lỗi kết nối đường truyền mạng.\n\nBạn có thể tải xuống thủ công bằng cách sao chép liên kết dưới đây và dán vào thanh địa chỉ của trình duyệt:\n👉 Link tải trực tiếp: ${file.url}\n\nChi tiết lỗi: ${e.message}\n\nTrân trọng!`;
            folder.file(`${file.name || 'file'}_link_tai_truc_tiep.txt`, fallbackText);
          }
        })();
        downloadPromises.push(downloadTask);
      }
    }

    await Promise.all(downloadPromises);

    try {
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `TaiLieu_${format(new Date(), 'yyyyMMdd_HHmm')}.zip`);
      if (errs.length > 0) {
        const totalAttachments = withFiles.reduce((s, d) => s + (d.attachments?.length || 0), 0);
        if (errs.length === totalAttachments) {
          toast.warning('Đã tạo ZIP nhưng tất cả các tệp đều được đính kèm dưới dạng Link tải do lỗi bảo mật trình duyệt.');
        } else {
          toast.warning(`Đã tải xuống ZIP. Một số tệp (${errs.length} tệp) được chuyển thành Link tải do lỗi kết nối.`);
        }
      } else {
        toast.success(`Đã tải xuống ${withFiles.length} tài liệu thành công!`);
      }
    } catch (e) {
      toast.error('Lỗi tạo file ZIP: ' + e.message);
    }

    setDownloading(false);
  };

  const selectedCount = selectedIds.size;
  const hasFilters = Object.entries(filters).some(([k, v]) => {
    if (k === 'project') return Array.isArray(v) && v.length > 0;
    return v !== '';
  });

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>

      {/* ── Tiêu đề + View toggle ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
            Tài liệu
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Quản lý và tra cứu {documents.length} tài liệu trong hệ thống
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--color-bg-surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <button onClick={() => setViewMode('grid')}
            style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)', backgroundColor: viewMode === 'grid' ? 'var(--color-bg-surface-hover)' : 'transparent', color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-muted)', border: 'none', cursor: 'pointer' }}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setViewMode('list')}
            style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)', backgroundColor: viewMode === 'list' ? 'var(--color-bg-surface-hover)' : 'transparent', color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-muted)', border: 'none', cursor: 'pointer' }}>
            <List size={18} />
          </button>
        </div>
      </div>

      {/* ── Bộ lọc (truyền thêm showSelectedOnly) ── */}
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        selectedCount={selectedCount}
        showSelectedOnly={showSelectedOnly}
        onToggleShowSelected={() => setShowSelectedOnly(p => !p)}
      />

      {/* ── Thanh hành động khi có tài liệu được chọn ── */}
      {selectedCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: 'var(--radius-md)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: '600' }}>
            <CheckSquare size={18} />
            Đã chọn <strong>{selectedCount}</strong> tài liệu
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button onClick={clearSelection}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.875rem', background: 'none', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', color: 'var(--color-primary)', fontSize: '0.8rem', cursor: 'pointer' }}>
              <X size={14} /> Bỏ chọn tất cả
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.45rem 1rem',
                background: downloading ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                border: 'none', borderRadius: '8px',
                color: 'white', fontSize: '0.82rem', fontWeight: '700',
                cursor: downloading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
              }}>
              {downloading
                ? <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />Đang tạo ZIP...</>
                : <><Download size={15} />Tải xuống tài liệu đã chọn</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Danh sách tài liệu ── */}
      <div style={{ flex: 1 }}>
        {filteredDocs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
              {showSelectedOnly ? 'Chưa có tài liệu nào được chọn.' : 'Không tìm thấy tài liệu nào phù hợp với bộ lọc.'}
            </p>
            <button className="btn btn-outline" style={{ marginTop: '1rem' }}
              onClick={() => { setFilters(EMPTY_FILTERS); setShowSelectedOnly(false); }}>
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
            gap: '1.5rem', paddingBottom: '2rem',
          }}>
            {filteredDocs.map(doc => (
              <DocumentCard
                key={doc.id}
                document={doc}
                viewMode={viewMode}
                isSelected={selectedIds.has(doc.id)}
                onToggleSelect={() => toggleSelect(doc.id)}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  </>);
};

export default Dashboard;
