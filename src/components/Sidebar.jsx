import React, { useState } from 'react';
import { FolderOpen, LayoutDashboard, FileText, Settings, Users, HelpCircle, Briefcase, Building2, Package, ChevronDown, ChevronRight, ClipboardList, Scale, Clock, BarChart3, HardHat, CheckSquare, AlertCircle, UserCheck } from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView }) => {
  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg" alt="FPT Logo" style={{ width: '54px', height: 'auto' }} />
        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-main)', lineHeight: '1.2', margin: 0 }}>FDI projects manage</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <NavItem icon={<LayoutDashboard size={20} />} label="Tổng quan" active={currentView === 'overview'} onClick={() => setCurrentView('overview')} />

        <NavAccordion label="Thông tin dự án" icon={<FolderOpen size={20} />} defaultOpen={currentView === 'projects' || currentView === 'dashboard'}>
          <NavItem icon={<Briefcase size={20} />} label="Dự án" active={currentView === 'projects'} onClick={() => setCurrentView('projects')} isChild />
          <NavItem icon={<FileText size={20} />} label="Tài liệu" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} isChild />
        </NavAccordion>

        <NavAccordion label="Công tác đấu thầu" icon={<Briefcase size={20} />} defaultOpen={['biddingPlan', 'bidding', 'contractorSelection'].includes(currentView)}>
          <NavItem icon={<ClipboardList size={20} />} label="Kế hoạch LCNT" active={currentView === 'biddingPlan'} onClick={() => setCurrentView('biddingPlan')} isChild />
          <NavItem icon={<Package size={20} />} label="Danh sách gói thầu" active={currentView === 'bidding'} onClick={() => setCurrentView('bidding')} isChild />
          <NavItem icon={<UserCheck size={20} />} label="Lựa chọn nhà thầu" active={currentView === 'contractorSelection'} onClick={() => setCurrentView('contractorSelection')} isChild />
        </NavAccordion>

        <NavAccordion label="Quản lý dự án" icon={<BarChart3 size={20} />} defaultOpen={['phapLy','tienDo','khoiLuong','atld','nghiemThu','danhMucLoi'].includes(currentView)}>
          <NavItem icon={<Scale size={20} />} label="Pháp lý" active={currentView === 'phapLy'} onClick={() => setCurrentView('phapLy')} isChild />
          <NavItem icon={<Clock size={20} />} label="Tiến độ" active={currentView === 'tienDo'} onClick={() => setCurrentView('tienDo')} isChild />
          <NavItem icon={<BarChart3 size={20} />} label="Khối lượng & chất lượng" active={currentView === 'khoiLuong'} onClick={() => setCurrentView('khoiLuong')} isChild />
          <NavItem icon={<HardHat size={20} />} label="ATLĐ & VSMT" active={currentView === 'atld'} onClick={() => setCurrentView('atld')} isChild />
          <NavItem icon={<CheckSquare size={20} />} label="Nghiệm thu - Thanh quyết toán" active={currentView === 'nghiemThu'} onClick={() => setCurrentView('nghiemThu')} isChild />
          <NavItem icon={<AlertCircle size={20} />} label="Danh mục lỗi" active={currentView === 'danhMucLoi'} onClick={() => setCurrentView('danhMucLoi')} isChild />
        </NavAccordion>

        <NavAccordion label="Quản trị" icon={<Settings size={20} />} defaultOpen={currentView === 'members' || currentView === 'partners' || currentView === 'settings'}>
          <NavItem icon={<Users size={20} />} label="Thành viên" active={currentView === 'members'} onClick={() => setCurrentView('members')} isChild />
          <NavItem icon={<Building2 size={20} />} label="Đối tác" active={currentView === 'partners'} onClick={() => setCurrentView('partners')} isChild />
          <NavItem icon={<Settings size={20} />} label="Cài đặt" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} isChild />
        </NavAccordion>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <NavItem icon={<HelpCircle size={20} />} label="Trợ giúp" active={currentView === 'help'} onClick={() => setCurrentView('help')} />
      </div>
    </aside>
  );
};

const NavAccordion = ({ label, icon, defaultOpen, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ marginTop: '0.25rem' }}>
      <a href="#" onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text-muted)',
        fontWeight: '600',
        textDecoration: 'none',
        transition: 'all var(--transition-fast)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {icon}
          <span>{label}</span>
        </div>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </a>
      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem', paddingLeft: '1.5rem' }}>
          {children}
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, isChild = false }) => (
  <a href="#" onClick={(e) => { e.preventDefault(); onClick && onClick(); }} style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: isChild ? '8px 12px' : '10px 12px',
    borderRadius: 'var(--radius-md)',
    color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
    backgroundColor: active ? 'var(--color-bg-surface-hover)' : 'transparent',
    fontWeight: active ? '600' : '500',
    fontSize: isChild ? '0.9rem' : '1rem',
    textDecoration: 'none',
    transition: 'all var(--transition-fast)'
  }}>
    {icon}
    <span>{label}</span>
  </a>
);

export default Sidebar;
