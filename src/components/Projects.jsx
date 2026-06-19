import React, { useState, useContext, useRef, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Building, Activity, FileText, Briefcase, Eye, Download, Users, X, Link, ChevronDown, ChevronUp, Search, Filter, Check } from 'lucide-react';
import { DocumentContext } from '../context/DocumentContext';
import html2pdf from 'html2pdf.js';
import { PROJECT_DETAILS_TEMPLATE, PROJECT_ROLES, getPastelColor } from '../data';


const PROJECT_STATUSES = ['Chưa bắt đầu', 'Đang thực hiện', 'Đã hoàn thành', 'Đã bị hủy'];
const getProjectStatusColor = (s) => {
  if (s === 'Đang thực hiện') return { bg: 'rgba(59, 130, 246, 0.2)', text: '#93c5fd' };
  if (s === 'Đã hoàn thành') return { bg: 'rgba(16, 185, 129, 0.2)', text: '#6ee7b7' };
  if (s === 'Đã bị hủy') return { bg: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5' };
  return { bg: 'rgba(148, 163, 184, 0.2)', text: '#cbd5e1' };
};

const Projects = () => {
  const { userRole, projects, addProject, editProject, deleteProject, members, documents } = useContext(DocumentContext);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const defaultFormData = {
    code: '',
    name: '',
    location: '',
    investor: 'Công ty TNHH Hạ tầng công nghệ số FPT',
    parentId: '',
    image: '',
    status: 'Chưa bắt đầu',
    details: [...PROJECT_DETAILS_TEMPLATE],
    projectMembers: [],
    tasks: []
  };
  
  const [formData, setFormData] = useState(defaultFormData);
  const [showMembersSection, setShowMembersSection] = useState(false);
  const [showDocsSection, setShowDocsSection] = useState(false);
  const [isPlanningSectionCollapsed, setIsPlanningSectionCollapsed] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusMenuRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('projectSearchTerm') || '');
  const [selectedStatuses, setSelectedStatuses] = useState(() => {
    const saved = localStorage.getItem('projectStatuses');
    return saved ? JSON.parse(saved) : PROJECT_STATUSES;
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('projectSearchTerm', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    localStorage.setItem('projectStatuses', JSON.stringify(selectedStatuses));
  }, [selectedStatuses]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenForm = (project = null, preview = false) => {
    if (project) {
      setEditingProject(project);
      setIsPreviewMode(preview);
      setFormData({
        ...project,
        details: project.details && project.details.length > 0 
          ? project.details 
          : [...PROJECT_DETAILS_TEMPLATE],
        projectMembers: project.projectMembers || [],
        tasks: project.tasks || []
      });
      setShowMembersSection(false);
      setShowDocsSection(false);
      setIsPlanningSectionCollapsed(true);
    } else {
      setEditingProject(null);
      setIsPreviewMode(false);
      setFormData(defaultFormData);
      setShowMembersSection(false);
      setShowDocsSection(false);
      setIsPlanningSectionCollapsed(true);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
    setIsPreviewMode(false);
    setFormData(defaultFormData);
    setShowMembersSection(false);
    setShowDocsSection(false);
    setIsPlanningSectionCollapsed(true);
  };

  const handleExportPDF = () => {
    const element = document.getElementById('project-printable-area');
    if (!element) return;

    const opt = {
      margin:       [5, 5, 5, 5],
      filename:     `ThongTinDuAn_${formData.code || 'KhongCoMa'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        onclone: (doc) => {
          const el = doc.getElementById('project-printable-area');
          if (el) {
            el.style.fontSize = '12px';
            const formGroups = el.querySelectorAll('.form-group');
            formGroups.forEach(fg => {
              fg.style.marginBottom = '0';
            });
            const grids = el.querySelectorAll('div[style*="grid"]');
            grids.forEach(g => {
              g.style.gap = '0.5rem';
            });
            const flexs = el.querySelectorAll('div[style*="flex"]');
            flexs.forEach(f => {
              if (f.style.gap === '1.5rem') f.style.gap = '0.75rem';
            });
            const inputs = el.querySelectorAll('.input-field');
            inputs.forEach(input => {
              input.style.padding = '0.25rem 0.5rem';
              input.style.minHeight = '1.5rem';
              input.style.fontSize = '11px';
            });
            const tds = el.querySelectorAll('td, th');
            tds.forEach(td => {
              td.style.padding = '0.25rem 0.5rem';
              td.style.fontSize = '11px';
            });
            const header = el.querySelector('#modal-header-banner');
            if (header) {
              header.style.padding = formData.image ? '4rem 1.5rem 1rem' : '1rem 1.5rem';
              const title = header.querySelector('h2');
              if (title) title.style.fontSize = '1.25rem';
            }
          }
        }
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validate duplicate project code
    if (formData.code) {
      const isDuplicateCode = projects.some(p => p.code === formData.code && (!editingProject || p.id !== editingProject.id));
      if (isDuplicateCode) {
        alert("Mã dự án này đã tồn tại! Vui lòng nhập mã khác để tránh trùng lặp.");
        return;
      }
    }

    if (editingProject) {
      await editProject(editingProject.id, { ...formData, id: editingProject.id });
    } else {
      await addProject({ ...formData });
    }
    handleCloseForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá dự án này?")) {
      await deleteProject(id);
    }
  };

  const handleDetailChange = (index, value) => {
    const newDetails = [...formData.details];
    newDetails[index].value = value;
    setFormData({ ...formData, details: newDetails });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_DIMENSION = 800; // Giới hạn kích thước tối đa
          
          if (width > height && width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Nén thành JPEG chất lượng 70% để tiết kiệm dung lượng
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
          
          setFormData(prev => ({ ...prev, image: dataUrl }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const pStatus = p.status || 'Chưa bắt đầu';
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(pStatus);
    return matchesSearch && matchesStatus;
  });

  const toggleStatusFilter = (status) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
            Dự án
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Quản lý {filteredProjects.length} dự án trong hệ thống
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '600px', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: 'var(--radius-md)', padding: '4px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, padding: '0 0.5rem' }}>
            <Search size={18} color="var(--color-text-muted)" />
            <input 
              type="text" 
              placeholder="Tìm kiếm dự án..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', color: 'var(--color-text-main)', outline: 'none', fontSize: '0.875rem', padding: '0.5rem 0' }}
            />
          </div>
          
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)' }}></div>

          <div style={{ position: 'relative' }} ref={filterMenuRef}>
             <button 
                type="button"
                onClick={() => setShowFilterMenu(!showFilterMenu)} 
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-main)', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
             >
                <Filter size={16} color="var(--color-text-muted)" />
                <span>Tình trạng {selectedStatuses.length < PROJECT_STATUSES.length ? `(${selectedStatuses.length})` : ''}</span>
                <ChevronDown size={14} color="var(--color-text-muted)" />
             </button>
             {showFilterMenu && (
               <div style={{ 
                 position: 'absolute', top: '100%', right: 0, marginTop: '8px', zIndex: 10,
                 backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid var(--color-border)',
                 borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', width: '220px', overflow: 'hidden'
               }}>
                 <div style={{ padding: '8px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Lọc theo tình trạng</span>
                    <button 
                      type="button" 
                      onClick={() => setSelectedStatuses(selectedStatuses.length === PROJECT_STATUSES.length ? [] : PROJECT_STATUSES)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      {selectedStatuses.length === PROJECT_STATUSES.length ? 'Bỏ chọn' : 'Chọn tất cả'}
                    </button>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 0' }}>
                   {PROJECT_STATUSES.map(status => (
                     <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-main)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                       <div style={{ 
                         width: '16px', height: '16px', borderRadius: '4px', border: `1px solid ${selectedStatuses.includes(status) ? 'var(--color-primary)' : 'var(--color-text-muted)'}`,
                         backgroundColor: selectedStatuses.includes(status) ? 'var(--color-primary)' : 'transparent',
                         display: 'flex', alignItems: 'center', justifyContent: 'center'
                       }}>
                         {selectedStatuses.includes(status) && <Check size={12} color="white" />}
                       </div>
                       <input 
                         type="checkbox" 
                         checked={selectedStatuses.includes(status)} 
                         onChange={() => toggleStatusFilter(status)}
                         style={{ display: 'none' }}
                       />
                       {status}
                     </label>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </div>
        
        {userRole === 'Admin' && (
          <button className="btn btn-primary" onClick={() => handleOpenForm()} style={{ whiteSpace: 'nowrap' }}>
            <Plus size={18} /> Thêm dự án mới
          </button>
        )}
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', alignItems: 'start', paddingBottom: '2rem' }}>
        {filteredProjects.map(project => (
          <div 
            key={project.id} 
            className="card" 
            style={{ 
              padding: '0', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden', 
              cursor: 'pointer', 
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onClick={() => handleOpenForm(project, true)}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'; }}
          >
            {project.image && (
              <div style={{ height: '120px', width: '100%', backgroundImage: `url(${project.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            )}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-blue">{project.code || 'Chưa có mã'}</span>
                  <span className="badge" style={{ backgroundColor: getProjectStatusColor(project.status).bg, color: getProjectStatusColor(project.status).text, border: `1px solid ${getProjectStatusColor(project.status).text}` }}>
                    {project.status || 'Chưa bắt đầu'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>{project.name}</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {userRole === 'Admin' && (
                  <>
                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleOpenForm(project); }} title="Sửa">
                      <Edit size={16} />
                    </button>
                    <button className="btn-icon" style={{ color: 'var(--color-danger)' }} onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} title="Xoá">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <MapPin size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{project.location || 'Chưa cập nhật địa điểm'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={16} style={{ flexShrink: 0 }} />
                <span>CĐT: {project.investor}</span>
              </div>
              {project.parentId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={16} style={{ flexShrink: 0 }} />
                  <span>Dự án cha: {projects.find(p => p.id.toString() === project.parentId)?.name || 'Không xác định'}</span>
                </div>
              )}
            </div>

            {project.location && (
              <div style={{ width: '100%', height: '150px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)', marginTop: '0.5rem' }}>
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps?q=${encodeURIComponent(project.location)}&output=embed`}
                ></iframe>
              </div>
            )}
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', maxWidth: '800px', height: '90vh', overflow: 'hidden' }}>
            <form onSubmit={handleSave} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              
              <div id="project-printable-area" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-surface)' }}>
                <div id="modal-header-banner" style={{ 
                  padding: formData.image ? '8rem 1.5rem 1.5rem' : '1.5rem 1.5rem', 
                  borderBottom: '1px solid var(--color-border)', 
                  display: 'flex', 
                  justifyContent: 'flex-start', 
                  alignItems: 'flex-end', 
                  backgroundColor: 'var(--color-bg-surface-hover)',
                  backgroundImage: formData.image ? `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%), url(${formData.image})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  color: formData.image ? 'white' : 'inherit',
                  position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                    {isPreviewMode ? (
                      <span className="badge" style={{ 
                        backgroundColor: getProjectStatusColor(formData.status).bg, 
                        color: getProjectStatusColor(formData.status).text, 
                        border: `1px solid ${getProjectStatusColor(formData.status).text}`,
                        backdropFilter: 'blur(4px)'
                      }}>
                        {formData.status || 'Chưa bắt đầu'}
                      </span>
                    ) : (
                      <div style={{ position: 'relative' }} ref={statusMenuRef}>
                        <div 
                          onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                          style={{
                            backgroundColor: getProjectStatusColor(formData.status).bg, 
                            color: getProjectStatusColor(formData.status).text, 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '100px', 
                            fontSize: '0.75rem', 
                            fontWeight: '600',
                            border: `1px solid ${getProjectStatusColor(formData.status).text}`,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            backdropFilter: 'blur(4px)'
                          }}
                        >
                          {formData.status || 'Chưa bắt đầu'}
                          <ChevronDown size={14} />
                        </div>
                        {showStatusDropdown && (
                          <div style={{
                            position: 'absolute', top: '100%', right: '0', marginTop: '4px',
                            backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', 
                            borderRadius: '8px', boxShadow: 'var(--shadow-md)',
                            border: '1px solid var(--color-border)', zIndex: 100,
                            overflow: 'hidden', minWidth: '140px'
                          }}>
                            {PROJECT_STATUSES.map(s => (
                              <div 
                                key={s} 
                                onClick={() => { setFormData({...formData, status: s}); setShowStatusDropdown(false); }}
                                style={{ 
                                  padding: '8px 12px', fontSize: '0.8rem', cursor: 'pointer',
                                  color: formData.status === s ? getProjectStatusColor(s).text : 'var(--color-text-main)',
                                  backgroundColor: formData.status === s ? 'var(--color-bg-surface-hover)' : 'transparent',
                                  display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = formData.status === s ? 'var(--color-bg-surface-hover)' : 'transparent'}
                              >
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getProjectStatusColor(s).text }}></span>
                                {s}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <h2 style={{ fontSize: formData.image ? '2rem' : '1.5rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', textShadow: formData.image ? '0 2px 4px rgba(0,0,0,0.6)' : 'none', maxWidth: '80%' }}>
                    <Briefcase size={formData.image ? 28 : 24} color={formData.image ? "white" : "var(--color-primary)"} />
                    {formData.name || (editingProject ? 'Dự án chưa có tên' : 'Thêm dự án mới')}
                  </h2>
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {!isPreviewMode && (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Ảnh đại diện dự án (Hiển thị ở Header)</label>
                      <input type="file" accept="image/*" className="input-field" onChange={handleImageUpload} style={{ padding: '0.5rem' }} />
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Mã dự án</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    disabled={isPreviewMode} 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value})} 
                    placeholder="Nhập mã dự án..." 
                    style={{ borderColor: formData.code && projects.some(p => p.code === formData.code && (!editingProject || p.id !== editingProject.id)) ? 'var(--color-danger)' : undefined }}
                  />
                  {formData.code && projects.some(p => p.code === formData.code && (!editingProject || p.id !== editingProject.id)) && (
                    <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      Mã dự án này đã tồn tại trong hệ thống.
                    </span>
                  )}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tên dự án <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input required type="text" className="input-field" disabled={isPreviewMode} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nhập tên dự án..." />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Địa điểm dự án</label>
                {isPreviewMode ? (
                  <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--color-bg-surface-hover)', borderRadius: 'var(--radius-sm)', minHeight: '2.5rem', display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)' }}>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.location)}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                      <MapPin size={16} /> {formData.location || 'Chưa cập nhật địa điểm'}
                    </a>
                  </div>
                ) : (
                  <input type="text" className="input-field" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Nhập địa chỉ dự án (VD: Quận 1, TP.HCM)..." />
                )}
                
                {formData.location && (
                  <div data-html2canvas-ignore="true" style={{ width: '100%', height: '200px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)', marginTop: '0.75rem' }}>
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.google.com/maps?q=${encodeURIComponent(formData.location)}&output=embed`}
                    ></iframe>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Chủ đầu tư</label>
                  <input type="text" className="input-field" disabled={isPreviewMode} value={formData.investor} onChange={e => setFormData({...formData, investor: e.target.value})} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Dự án cha</label>
                  <select className="input-field" disabled={isPreviewMode} value={formData.parentId} onChange={e => setFormData({...formData, parentId: e.target.value})}>
                    <option value="">-- Không có --</option>
                    {projects.filter(p => !editingProject || p.id !== editingProject.id).map(p => (
                      <option key={p.id} value={p.id.toString()}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }} onClick={() => setShowMembersSection(!showMembersSection)}>
                  <Users size={16} /> {showMembersSection ? 'Ẩn danh sách thành viên' : 'Thành viên CĐT'}
                </button>
                <button type="button" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }} onClick={() => setShowDocsSection(!showDocsSection)}>
                  <FileText size={16} /> {showDocsSection ? 'Ẩn tài liệu đính kèm' : 'Xem tài liệu đính kèm'}
                </button>
              </div>



              {showMembersSection && (
                <div style={{ marginTop: '1rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} color="var(--color-primary)" />
                    Thành viên dự án
                  </h3>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead style={{ backgroundColor: 'var(--color-bg-surface-hover)' }}>
                        <tr>
                          <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)', width: '60px' }}>STT</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Tên thành viên</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Email</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Vai trò</th>
                          {!isPreviewMode && <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)', width: '80px' }}>Xóa</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {formData.projectMembers.length === 0 ? (
                          <tr>
                            <td colSpan={isPreviewMode ? 4 : 5} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                              Chưa có thành viên nào được thêm vào dự án này.
                            </td>
                          </tr>
                        ) : (
                          formData.projectMembers.map((member, index) => {
                            const memberInfo = members.find(m => m.id.toString() === member.memberId?.toString());
                            return (
                              <tr key={index} style={{ borderBottom: index < formData.projectMembers.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                <td style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{index + 1}</td>
                                <td style={{ padding: '0.75rem' }}>
                                  {isPreviewMode ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                                      {memberInfo?.avatar && <img src={memberInfo.avatar} alt={memberInfo.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />}
                                      {memberInfo ? memberInfo.name : 'Không xác định'}
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      {memberInfo?.avatar && <img src={memberInfo.avatar} alt={memberInfo.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />}
                                      <select 
                                        className="input-field" 
                                        style={{ padding: '0.4rem 0.75rem', margin: 0, flex: 1 }}
                                        value={member.memberId}
                                        onChange={(e) => {
                                          const newMembers = [...formData.projectMembers];
                                          newMembers[index].memberId = e.target.value;
                                          setFormData({...formData, projectMembers: newMembers});
                                        }}
                                      >
                                        <option value="">-- Chọn thành viên --</option>
                                        {members.map(m => (
                                          <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>
                                  {memberInfo?.email || ''}
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                  {isPreviewMode ? (
                                    <span style={{ backgroundColor: 'rgba(130, 168, 209, 0.15)', color: 'var(--color-primary)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500' }}>
                                      {member.role || 'Chưa phân quyền'}
                                    </span>
                                  ) : (
                                    <select 
                                      className="input-field" 
                                      style={{ padding: '0.4rem 0.75rem', margin: 0 }}
                                      value={member.role}
                                      onChange={(e) => {
                                        const newMembers = [...formData.projectMembers];
                                        newMembers[index].role = e.target.value;
                                        setFormData({...formData, projectMembers: newMembers});
                                      }}
                                    >
                                      <option value="">-- Chọn vai trò --</option>
                                      {PROJECT_ROLES.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                      ))}
                                    </select>
                                  )}
                                </td>
                                {!isPreviewMode && (
                                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                    <button 
                                      type="button" 
                                      className="btn-icon" 
                                      style={{ color: 'var(--color-danger)' }} 
                                      onClick={() => {
                                        const newMembers = formData.projectMembers.filter((_, i) => i !== index);
                                        setFormData({...formData, projectMembers: newMembers});
                                      }}
                                    >
                                      <X size={16} />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  {!isPreviewMode && (
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      style={{ marginTop: '1rem', width: '100%', borderStyle: 'dashed' }}
                      onClick={() => setFormData({
                        ...formData, 
                        projectMembers: [...formData.projectMembers, { memberId: '', role: '' }]
                      })}
                    >
                      <Plus size={16} style={{ marginRight: '4px' }} /> Thêm thành viên
                    </button>
                  )}
                </div>
              )}

              {showDocsSection && (
                <div style={{ marginTop: '1rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={18} color="var(--color-primary)" />
                    Tài liệu đính kèm
                  </h3>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead style={{ backgroundColor: 'var(--color-bg-surface-hover)' }}>
                        <tr>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Số hiệu</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--color-border)', width: '60%' }}>Trích yếu</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>Đính kèm</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.filter(doc => doc.relatedProjects && doc.relatedProjects.includes(formData.name)).length === 0 ? (
                          <tr>
                            <td colSpan={3} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                              Chưa có tài liệu nào đính kèm cho dự án này.
                            </td>
                          </tr>
                        ) : (
                          documents.filter(doc => doc.relatedProjects && doc.relatedProjects.includes(formData.name))
                          .sort((a, b) => {
                            const dateA = a.effectiveDate ? new Date(a.effectiveDate) : new Date(0);
                            const dateB = b.effectiveDate ? new Date(b.effectiveDate) : new Date(0);
                            return dateB - dateA;
                          })
                          .map((doc, index) => (
                            <tr key={doc.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                              <td style={{ padding: '0.75rem', fontWeight: '500' }}>{doc.documentNumber}</td>
                              <td style={{ padding: '0.75rem' }}>{doc.summary}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                {doc.attachments && doc.attachments.length > 0 ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                    {doc.attachments.map((att, i) => (
                                      <a key={i} href={att.url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={att.name || 'Tài liệu'}>
                                        <Link size={18} />
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.5rem 0' }} />
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setIsPlanningSectionCollapsed(!isPlanningSectionCollapsed)}>
                    <Activity size={18} color="var(--color-primary)" />
                    Thông tin quy hoạch
                    <button 
                      type="button" 
                      style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 4px', transition: 'color 0.2s', marginLeft: '2px' }}
                      title={isPlanningSectionCollapsed ? "Hiện thông tin" : "Ẩn thông tin"}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
                    >
                      {isPlanningSectionCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                    </button>
                  </h3>
                </div>
                
                {!isPlanningSectionCollapsed && (
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead style={{ backgroundColor: 'var(--color-bg-surface-hover)' }}>
                        <tr>
                          <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid var(--color-border)', width: '60px' }}>STT</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Nội dung</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--color-border)', width: '40%' }}>Ghi chú / Giá trị</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.details.map((detail, index) => (
                          <tr key={detail.id} style={{ borderBottom: index < formData.details.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                            <td style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{index + 1}</td>
                            <td style={{ padding: '0.75rem', fontWeight: '500' }}>{detail.name}</td>
                            <td style={{ padding: '0.5rem' }}>
                              {isPreviewMode ? (
                                <div style={{ padding: '0.4rem 0.75rem', margin: 0, minHeight: '2rem' }}>{detail.value}</div>
                              ) : (
                                <input 
                                  type="text" 
                                  className="input-field" 
                                  style={{ padding: '0.4rem 0.75rem', margin: 0 }}
                                  value={detail.value}
                                  onChange={(e) => handleDetailChange(index, e.target.value)}
                                  placeholder="Nhập..."
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              </div>
              </div>

              <div data-html2canvas-ignore="true" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', position: 'sticky', bottom: 0, backgroundColor: 'var(--color-bg-surface)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 10 }}>
                <button type="button" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', borderColor: 'var(--color-success)' }} onClick={handleExportPDF}>
                  <Download size={18} /> Xuất dữ liệu PDF
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {isPreviewMode ? (
                    <>
                      {userRole === 'Admin' && (
                        <button type="button" className="btn btn-outline" onClick={() => setIsPreviewMode(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Edit size={16} /> Sửa dự án
                        </button>
                      )}
                      <button type="button" className="btn btn-primary" onClick={handleCloseForm}>Đóng</button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="btn btn-outline" onClick={handleCloseForm}>Hủy bỏ</button>
                      <button type="submit" className="btn btn-primary">Lưu dự án</button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// SVG icon inline for X since we used it in the header
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default Projects;
