import React from 'react';
import { FolderOpen, LayoutDashboard, FileText, Settings, Users, HelpCircle } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--color-primary)', padding: '8px', borderRadius: '8px', color: 'white' }}>
          <FolderOpen size={24} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-main)' }}>DocuProject</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <NavItem icon={<LayoutDashboard size={20} />} label="Tổng quan" active />
        <NavItem icon={<FileText size={20} />} label="Tài liệu dự án" />
        <NavItem icon={<Users size={20} />} label="Thành viên" />
        <NavItem icon={<Settings size={20} />} label="Cài đặt" />
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <NavItem icon={<HelpCircle size={20} />} label="Trợ giúp" />
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, active }) => (
  <a href="#" style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
    backgroundColor: active ? 'var(--color-bg-surface-hover)' : 'transparent',
    fontWeight: active ? '600' : '500',
    textDecoration: 'none',
    transition: 'all var(--transition-fast)'
  }}>
    {icon}
    <span>{label}</span>
  </a>
);

export default Sidebar;
