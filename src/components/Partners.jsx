import React, { useState, useContext } from 'react';
import Select from 'react-select';
import { Building2, Mail, Phone, Globe, MapPin, Briefcase, CreditCard, Star } from 'lucide-react';
import { DocumentContext } from '../context/DocumentContext';

const RatingStars = ({ rating, setRating, readOnly = false }) => {
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          fill={star <= (rating || 0) ? '#f59e0b' : 'transparent'}
          color={star <= (rating || 0) ? '#f59e0b' : '#d1d5db'}
          style={{ cursor: readOnly ? 'default' : 'pointer' }}
          onClick={() => !readOnly && setRating(star)}
        />
      ))}
    </div>
  );
};

const Partners = () => {
  const { partners, addPartner, editPartner, deletePartner, userRole, globalLists } = useContext(DocumentContext);
  const [isAdding, setIsAdding] = useState(false);
  const [newPartner, setNewPartner] = useState({ 
    name: '', shortName: '', taxCode: '', type: [], representative: '', 
    phone: '', email: '', address: '', website: '', logo: '',
    bankAccount: '', bankName: '', rating: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const partnerTypes = globalLists.partnerTypes || [];

  const handleAdd = async () => {
    if (newPartner.name && newPartner.taxCode) {
      await addPartner({ 
        ...newPartner, 
        logo: newPartner.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(newPartner.name)}&background=random&color=fff`,
        locked: false
      });
      setIsAdding(false);
      setNewPartner({ 
        name: '', shortName: '', taxCode: '', type: [], representative: '', 
        phone: '', email: '', address: '', website: '', logo: '',
        bankAccount: '', bankName: '', rating: 0
      });
    } else {
      alert("Vui lòng nhập Tên công ty và Mã số thuế.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đối tác này?')) {
      await deletePartner(id);
    }
  };

  const handleToggleLock = async (id) => {
    const partner = partners.find(p => p.id === id);
    if (partner) {
      await editPartner(id, { ...partner, locked: !partner.locked });
    }
  };

  const handleLogoUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditFormData(prev => ({ ...prev, logo: reader.result }));
        } else {
          setNewPartner(prev => ({ ...prev, logo: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = (partner) => {
    setEditingId(partner.id);
    setEditFormData(partner);
  };

  const handleUpdate = async () => {
    await editPartner(editingId, editFormData);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="card" style={{ padding: '1.5rem', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Quản lý Đối tác</h2>
        {userRole === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} /> {isAdding ? 'Hủy' : 'Thêm đối tác'}
          </button>
        )}
      </div>

      {isAdding && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-surface-hover)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Thêm đối tác mới</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tên công ty (*)</label>
              <input type="text" className="input-field" value={newPartner.name} onChange={(e) => setNewPartner({...newPartner, name: e.target.value})} placeholder="Công ty CP..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tên viết tắt</label>
              <input type="text" className="input-field" value={newPartner.shortName} onChange={(e) => setNewPartner({...newPartner, shortName: e.target.value})} placeholder="FPT, Coteccons..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Mã số thuế (*)</label>
              <input type="text" className="input-field" value={newPartner.taxCode} onChange={(e) => setNewPartner({...newPartner, taxCode: e.target.value})} placeholder="0123456789" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Loại hình đối tác</label>
              <Select
                isMulti
                options={partnerTypes.map(t => ({ value: t.name, label: t.name }))}
                placeholder="-- Chọn loại hình --"
                value={(Array.isArray(newPartner.type) ? newPartner.type : (newPartner.type ? [newPartner.type] : [])).map(t => ({ value: t, label: t }))}
                onChange={(selected) => setNewPartner({...newPartner, type: selected ? selected.map(s => s.value) : []})}
                styles={{ control: (base) => ({ ...base, minHeight: '38px', borderRadius: '6px', borderColor: 'var(--color-border)', fontSize: '0.875rem' }) }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Người đại diện</label>
              <input type="text" className="input-field" value={newPartner.representative} onChange={(e) => setNewPartner({...newPartner, representative: e.target.value})} placeholder="Nguyễn Văn A" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Số điện thoại</label>
              <input type="text" className="input-field" value={newPartner.phone} onChange={(e) => setNewPartner({...newPartner, phone: e.target.value})} placeholder="09..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email</label>
              <input type="email" className="input-field" value={newPartner.email} onChange={(e) => setNewPartner({...newPartner, email: e.target.value})} placeholder="contact@company.com" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Website</label>
              <input type="text" className="input-field" value={newPartner.website} onChange={(e) => setNewPartner({...newPartner, website: e.target.value})} placeholder="https://..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Địa chỉ</label>
              <input type="text" className="input-field" value={newPartner.address} onChange={(e) => setNewPartner({...newPartner, address: e.target.value})} placeholder="Số nhà, đường, phường, quận..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Số tài khoản</label>
              <input type="text" className="input-field" value={newPartner.bankAccount} onChange={(e) => setNewPartner({...newPartner, bankAccount: e.target.value})} placeholder="123456789" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ngân hàng</label>
              <input type="text" className="input-field" value={newPartner.bankName} onChange={(e) => setNewPartner({...newPartner, bankName: e.target.value})} placeholder="Vietcombank, MB Bank..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Logo công ty</label>
              <input type="file" accept="image/*" className="input-field" onChange={(e) => handleLogoUpload(e, false)} style={{ padding: '0.5rem' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Đánh giá tín nhiệm</label>
              <div style={{ height: '38px', display: 'flex', alignItems: 'center' }}>
                <RatingStars rating={newPartner.rating} setRating={(r) => setNewPartner({...newPartner, rating: r})} />
              </div>
            </div>
            <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={handleAdd}>Lưu đối tác</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {partners.map(partner => (
          <div key={partner.id} style={{ 
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', 
            display: 'flex', flexDirection: 'column', 
            backgroundColor: partner.locked ? '#f9f9f9' : 'var(--color-bg-surface)', 
            opacity: partner.locked ? 0.7 : 1,
            transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
            boxShadow: 'var(--shadow-sm)'
          }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
            
            {editingId === partner.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Sửa thông tin</h3>
                <input type="text" className="input-field" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} placeholder="Tên công ty" />
                <input type="text" className="input-field" value={editFormData.shortName} onChange={(e) => setEditFormData({...editFormData, shortName: e.target.value})} placeholder="Tên viết tắt" />
                <input type="text" className="input-field" value={editFormData.taxCode} onChange={(e) => setEditFormData({...editFormData, taxCode: e.target.value})} placeholder="MST" />
                <Select
                  isMulti
                  options={partnerTypes.map(t => ({ value: t.name, label: t.name }))}
                  placeholder="-- Loại hình đối tác --"
                  value={(Array.isArray(editFormData.type) ? editFormData.type : (editFormData.type ? [editFormData.type] : [])).map(t => ({ value: t, label: t }))}
                  onChange={(selected) => setEditFormData({...editFormData, type: selected ? selected.map(s => s.value) : []})}
                  styles={{ control: (base) => ({ ...base, minHeight: '38px', borderRadius: '6px', borderColor: 'var(--color-border)', marginBottom: '0.5rem', fontSize: '0.875rem' }) }}
                />
                <input type="text" className="input-field" value={editFormData.representative} onChange={(e) => setEditFormData({...editFormData, representative: e.target.value})} placeholder="Người đại diện" />
                <input type="text" className="input-field" value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} placeholder="Số ĐT" />
                <input type="email" className="input-field" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} placeholder="Email" />
                <input type="text" className="input-field" value={editFormData.website} onChange={(e) => setEditFormData({...editFormData, website: e.target.value})} placeholder="Website" />
                <input type="text" className="input-field" value={editFormData.address} onChange={(e) => setEditFormData({...editFormData, address: e.target.value})} placeholder="Địa chỉ" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="text" className="input-field" value={editFormData.bankAccount} onChange={(e) => setEditFormData({...editFormData, bankAccount: e.target.value})} placeholder="Số tài khoản" />
                  <input type="text" className="input-field" value={editFormData.bankName} onChange={(e) => setEditFormData({...editFormData, bankName: e.target.value})} placeholder="Ngân hàng" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Đánh giá:</span>
                  <RatingStars rating={editFormData.rating} setRating={(r) => setEditFormData({...editFormData, rating: r})} />
                </div>
                <input type="file" accept="image/*" className="input-field" onChange={(e) => handleLogoUpload(e, true)} style={{ padding: '0.5rem' }} />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleUpdate}>Lưu</button>
                  <button className="btn" style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#333' }} onClick={handleCancelEdit}>Hủy</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  <img src={partner.logo} alt={partner.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'contain', backgroundColor: 'white', border: '1px solid var(--color-border)' }} />
                  <div style={{ flex: 1 }}>
                    {partner.locked && <div style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>ĐÃ KHÓA</div>}
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: 'var(--color-text-main)', lineHeight: 1.3 }}>
                      {partner.name}
                    </h3>
                    {partner.shortName && <span style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: '600' }}>({partner.shortName})</span>}
                    <div style={{ marginTop: '0.25rem' }}>
                      <RatingStars rating={partner.rating} readOnly={true} />
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: 'rgba(115, 169, 130, 0.15)', color: 'var(--color-success)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                    MST: {partner.taxCode}
                  </span>
                  {partner.type && (partner.type.length > 0) && (
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {(Array.isArray(partner.type) ? partner.type : [partner.type]).map(t => (
                        <span key={t} style={{ backgroundColor: 'rgba(130, 168, 209, 0.15)', color: 'var(--color-primary)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  {partner.representative && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={14} style={{ color: 'var(--color-primary)' }}/> {partner.representative}</div>}
                  {partner.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} style={{ color: 'var(--color-success)' }}/> {partner.phone}</div>}
                  {partner.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} style={{ color: '#f59e0b' }}/> {partner.email}</div>}
                  {partner.website && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Globe size={14} style={{ color: '#8b5cf6' }}/> <a href={partner.website} target="_blank" rel="noreferrer" style={{ color: '#8b5cf6', textDecoration: 'none' }}>{partner.website.replace('https://', '').replace('http://', '')}</a></div>}
                  {(partner.bankAccount || partner.bankName) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CreditCard size={14} style={{ color: 'var(--color-info)' }}/> 
                      <span>{partner.bankAccount} {partner.bankName ? `- ${partner.bankName}` : ''}</span>
                    </div>
                  )}
                  {partner.address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <MapPin size={16} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '2px' }}/> 
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partner.address)}`} target="_blank" rel="noreferrer" style={{ lineHeight: 1.4, color: 'inherit', textDecoration: 'none' }}>
                        <span style={{ borderBottom: '1px dashed var(--color-border)' }}>{partner.address}</span>
                      </a>
                    </div>
                  )}
                </div>

                {userRole === 'Admin' && (
                  <div style={{ width: '100%', marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button onClick={() => handleEditClick(partner)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem' }}>
                      Sửa
                    </button>
                    <button onClick={() => handleToggleLock(partner.id)} style={{ background: 'none', border: 'none', color: partner.locked ? 'var(--color-success)' : 'var(--color-warning)', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem' }}>
                      {partner.locked ? 'Mở khóa' : 'Khóa'}
                    </button>
                    <button onClick={() => handleDelete(partner.id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem' }}>
                      Xóa
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Partners;
