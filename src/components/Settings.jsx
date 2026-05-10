import React, { useContext, useState } from 'react';
import { DocumentContext } from '../context/DocumentContext';
import { Plus, Trash2, Save, Edit2, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { LIST_CONFIGS } from '../data';

const ListSettingsSection = ({ config, listData, addListItem, editListItem, deleteListItem, userRole, initialExpanded = false }) => {
  const [newValue, setNewValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const handleAdd = () => {
    if (newValue.trim()) {
      addListItem(config.collectionName, newValue.trim());
      setNewValue('');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const saveEdit = () => {
    if (editName.trim() && editingId) {
      editListItem(config.collectionName, editingId, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <section style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
      <div 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '0.5rem' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
          {config.name}
        </h3>
        <button style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {isExpanded && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            {config.description}
          </p>
      
      {userRole === 'Admin' && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', maxWidth: '400px' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder={`Nhập ${config.name.toLowerCase()} mới...`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button className="btn btn-primary" onClick={handleAdd} style={{ padding: '0.5rem 1rem' }}>
            <Plus size={18} /> Thêm
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {listData && listData.map((item) => (
          <div key={item.id} style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            backgroundColor: 'var(--color-bg-surface-hover)', 
            padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            {editingId === item.id ? (
              <>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  style={{ border: '1px solid var(--color-border)', borderRadius: '4px', padding: '2px 4px' }}
                  autoFocus
                />
                <button onClick={saveEdit} style={{ background: 'none', border: 'none', color: 'var(--color-success)', cursor: 'pointer' }}><Check size={16} /></button>
                <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={16} /></button>
              </>
            ) : (
              <>
                <span style={{ fontWeight: '500' }}>{item.name}</span>
                {userRole === 'Admin' && (
                  <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
                    <button onClick={() => handleEdit(item)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteListItem(config.collectionName, item.id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '2px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {(!listData || listData.length === 0) && (
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Chưa có dữ liệu.</span>
        )}
      </div>
        </div>
      )}
    </section>
  );
};

const Settings = () => {
  const { globalLists, addListItem, editListItem, deleteListItem, userRole } = useContext(DocumentContext);
  const [displayExpanded, setDisplayExpanded] = useState(true);

  return (
    <div className="card" style={{ padding: '1.5rem', minHeight: '80vh', overflowY: 'auto' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '2rem' }}>Cài đặt hệ thống</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        
        {LIST_CONFIGS.map((config, index) => (
          <ListSettingsSection 
            key={config.key}
            config={config}
            listData={globalLists[config.key]}
            addListItem={addListItem}
            editListItem={editListItem}
            deleteListItem={deleteListItem}
            userRole={userRole}
            initialExpanded={index === 0}
          />
        ))}

        <section style={{ marginTop: '1rem' }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}
            onClick={() => setDisplayExpanded(!displayExpanded)}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
              Cài đặt Hiển thị
            </h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {displayExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          
          {displayExpanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Giao diện mặc định</label>
                <select className="input-field">
                  <option>Sáng (Mặc định)</option>
                  <option>Tối (Đang phát triển)</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Chế độ xem danh sách mặc định</label>
                <select className="input-field">
                  <option>Dạng Lưới (Grid)</option>
                  <option>Dạng Bảng (List)</option>
                </select>
              </div>
              <button className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}><Save size={18} style={{ marginRight: '0.5rem' }}/> Lưu Cài đặt</button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Settings;
