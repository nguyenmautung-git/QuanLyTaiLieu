import React, { useState, useContext } from 'react';
import { Package, Plus, Edit, Trash2, Search, Filter, X } from 'lucide-react';
import { DocumentContext } from '../context/DocumentContext';

const BiddingPackages = () => {
  const { userRole, biddingPackages = [], addBiddingPackage, editBiddingPackage, deleteBiddingPackage, projects, partners } = useContext(DocumentContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const defaultFormData = {
    code: '',
    name: '',
    projectId: '',
    type: 'Tư vấn',
    selectionMethod: 'Đấu thầu rộng rãi',
    budget: '',
    status: 'Đang mời thầu',
    winnerId: ''
  };

  const [formData, setFormData] = useState(defaultFormData);

  const handleOpenForm = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData(pkg);
    } else {
      setEditingPackage(null);
      setFormData(defaultFormData);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPackage(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingPackage) {
      await editBiddingPackage?.(editingPackage.id, formData);
    } else {
      await addBiddingPackage?.(formData);
    }
    handleCloseForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa gói thầu này không?")) {
      await deleteBiddingPackage?.(id);
    }
  };

  const filteredPackages = (biddingPackages || []).filter(pkg => {
    const matchSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        pkg.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProject = filterProject === 'All' || pkg.projectId?.toString() === filterProject;
    const matchStatus = filterStatus === 'All' || pkg.status === filterStatus;
    return matchSearch && matchProject && matchStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Đang mời thầu': return <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--color-warning)', color: '#000', fontSize: '0.75rem', fontWeight: '500' }}>{status}</span>;
      case 'Đang chấm thầu': return <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--color-primary-light)', color: 'white', fontSize: '0.75rem', fontWeight: '500' }}>{status}</span>;
      case 'Đã có kết quả': return <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--color-success)', color: 'white', fontSize: '0.75rem', fontWeight: '500' }}>{status}</span>;
      case 'Đã hủy': return <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--color-danger)', color: 'white', fontSize: '0.75rem', fontWeight: '500' }}>{status}</span>;
      default: return <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--color-border)', fontSize: '0.75rem', fontWeight: '500' }}>{status}</span>;
    }
  };

  return (
    <div className="fade-in" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Danh sách Gói thầu</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Quản lý {(biddingPackages || []).length} gói thầu trên hệ thống</p>
        </div>
        {userRole === 'Admin' && (
          <button className="btn btn-primary" onClick={() => handleOpenForm()}>
            <Plus size={18} /> Thêm gói thầu
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
          <input 
            type="text" 
            placeholder="Tìm theo mã hoặc tên gói thầu..." 
            className="input-field"
            style={{ paddingLeft: '36px', margin: 0 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select className="input-field" style={{ width: 'auto', margin: 0 }} value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
            <option value="All">Tất cả dự án</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.code || p.name}</option>
            ))}
          </select>
          <select className="input-field" style={{ width: 'auto', margin: 0 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">Tất cả trạng thái</option>
            <option value="Đang mời thầu">Đang mời thầu</option>
            <option value="Đang chấm thầu">Đang chấm thầu</option>
            <option value="Đã có kết quả">Đã có kết quả</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead style={{ backgroundColor: 'var(--color-bg-surface-hover)', borderBottom: '2px solid var(--color-border)' }}>
              <tr>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)', width: '120px' }}>Mã gói thầu</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Tên gói thầu</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Dự án</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Dự toán (VNĐ)</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Trạng thái</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)', textAlign: 'center', width: '100px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Không tìm thấy gói thầu nào.
                  </td>
                </tr>
              ) : (
                filteredPackages.map(pkg => {
                  const project = projects.find(p => p.id.toString() === pkg.projectId?.toString());
                  return (
                    <tr key={pkg.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{pkg.code}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{pkg.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{pkg.type} • {pkg.selectionMethod}</div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{project ? project.name : 'N/A'}</td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{pkg.budget}</td>
                      <td style={{ padding: '1rem' }}>{getStatusBadge(pkg.status)}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {userRole === 'Admin' ? (
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <button className="btn-icon" onClick={() => handleOpenForm(pkg)} style={{ color: 'var(--color-primary)' }} title="Sửa">
                              <Edit size={16} />
                            </button>
                            <button className="btn-icon" onClick={() => handleDelete(pkg.id)} style={{ color: 'var(--color-danger)' }} title="Xóa">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-light)', fontSize: '0.8rem' }}>View</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={20} color="var(--color-primary)" />
                {editingPackage ? 'Sửa gói thầu' : 'Thêm gói thầu mới'}
              </h2>
              <button className="btn-icon" onClick={handleCloseForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2.5fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Mã gói thầu <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input required type="text" className="input-field" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="VD: CNS1-TVTK" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tên gói thầu <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Tên gói thầu..." />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Dự án thuộc về <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <select required className="input-field" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                  <option value="">-- Chọn dự án --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Loại gói thầu</label>
                  <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Tư vấn">Tư vấn</option>
                    <option value="Xây lắp">Xây lắp</option>
                    <option value="Mua sắm hàng hóa">Mua sắm hàng hóa</option>
                    <option value="Phi tư vấn">Phi tư vấn</option>
                    <option value="Hỗn hợp">Hỗn hợp</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Hình thức lựa chọn</label>
                  <select className="input-field" value={formData.selectionMethod} onChange={e => setFormData({...formData, selectionMethod: e.target.value})}>
                    <option value="Đấu thầu rộng rãi">Đấu thầu rộng rãi</option>
                    <option value="Đấu thầu hạn chế">Đấu thầu hạn chế</option>
                    <option value="Chỉ định thầu">Chỉ định thầu</option>
                    <option value="Chào hàng cạnh tranh">Chào hàng cạnh tranh</option>
                    <option value="Mua sắm trực tiếp">Mua sắm trực tiếp</option>
                    <option value="Tự thực hiện">Tự thực hiện</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Dự toán gói thầu (VNĐ)</label>
                  <input type="text" className="input-field" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} placeholder="VD: 5,000,000,000" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Trạng thái</label>
                  <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Chuẩn bị mời thầu">Chuẩn bị mời thầu</option>
                    <option value="Đang mời thầu">Đang mời thầu</option>
                    <option value="Đang chấm thầu">Đang chấm thầu</option>
                    <option value="Đã có kết quả">Đã có kết quả</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </div>
              </div>

              {formData.status === 'Đã có kết quả' && (
                <div className="form-group" style={{ marginBottom: 0, padding: '1rem', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <label className="form-label" style={{ color: 'var(--color-primary)' }}>Đơn vị trúng thầu</label>
                  <select className="input-field" style={{ backgroundColor: '#fff' }} value={formData.winnerId || ''} onChange={e => setFormData({...formData, winnerId: e.target.value})}>
                    <option value="">-- Chọn nhà thầu (Từ danh sách Đối tác) --</option>
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn btn-outline" onClick={handleCloseForm}>Hủy bỏ</button>
                <button type="submit" className="btn btn-primary">Lưu gói thầu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiddingPackages;
