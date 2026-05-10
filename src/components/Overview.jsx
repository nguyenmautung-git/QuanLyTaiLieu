import React, { useContext, useMemo } from 'react';
import { DocumentContext } from '../context/DocumentContext';
import { FileText, Briefcase, Users, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { PASTEL_COLORS } from '../data';

const Overview = () => {
  const { documents, projects, members } = useContext(DocumentContext);

  // Tính toán các chỉ số (KPIs)
  const totalDocs = documents.length;
  const totalProjects = projects.length;
  const totalMembers = members.length;
  
  // Tài liệu mới trong 30 ngày qua
  const thirtyDaysAgo = subDays(new Date(), 30);
  const newDocsCount = documents.filter(doc => new Date(doc.createdAt) >= thirtyDaysAgo).length;

  // Dữ liệu cho Biểu đồ tròn: Số lượng tài liệu theo Loại
  const docsByTypeData = useMemo(() => {
    const counts = {};
    documents.forEach(doc => {
      const type = doc.documentType || 'Khác';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    })).sort((a, b) => b.value - a.value);
  }, [documents]);

  // Dữ liệu cho Biểu đồ cột: Số lượng tài liệu theo Dự án (Top 5)
  const docsByProjectData = useMemo(() => {
    const counts = {};
    documents.forEach(doc => {
      if (doc.relatedProjects && doc.relatedProjects.length > 0) {
        doc.relatedProjects.forEach(proj => {
          counts[proj] = (counts[proj] || 0) + 1;
        });
      } else {
        counts['Không gán'] = (counts['Không gán'] || 0) + 1;
      }
    });
    return Object.keys(counts).map(key => ({
      name: key,
      TàiLiệu: counts[key]
    })).sort((a, b) => b.TàiLiệu - a.TàiLiệu).slice(0, 5); // Chỉ lấy top 5
  }, [documents]);

  // Lấy 5 tài liệu mới nhất
  const recentDocuments = documents.slice(0, 5);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].name}</p>
          <p style={{ margin: 0, color: 'var(--color-primary)' }}>{`Số lượng: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', overflowY: 'auto', paddingRight: '0.5rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
          Tổng quan Hệ thống
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Xem nhanh các chỉ số và hoạt động mới nhất của dự án FDI.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <KpiCard title="Tổng số Dự án" value={totalProjects} icon={<Briefcase size={24} />} color="#3b82f6" bgColor="#eff6ff" />
        <KpiCard title="Tổng số Tài liệu" value={totalDocs} icon={<FileText size={24} />} color="#10b981" bgColor="#ecfdf5" />
        <KpiCard title="Tài liệu mới (30 ngày)" value={newDocsCount} icon={<TrendingUp size={24} />} color="#f59e0b" bgColor="#fffbeb" />
        <KpiCard title="Thành sự" value={totalMembers} icon={<Users size={24} />} color="#8b5cf6" bgColor="#f5f3ff" />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Pie Chart */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>Phân bổ Tài liệu theo Loại</h3>
          <div style={{ flex: 1, minHeight: '300px' }}>
            {docsByTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={docsByTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {docsByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>Chưa có dữ liệu</div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>Top 5 Dự án nhiều Tài liệu nhất</h3>
          <div style={{ flex: 1, minHeight: '300px' }}>
             {docsByProjectData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={docsByProjectData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  barSize={40}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={{stroke: '#e5e7eb'}} />
                  <YAxis tickLine={false} axisLine={false} tick={{fontSize: 12}} />
                  <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="TàiLiệu" fill="#818cf8" radius={[4, 4, 0, 0]}>
                    {docsByProjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PASTEL_COLORS[(index + 2) % PASTEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
             ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>Chưa có dữ liệu</div>
             )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Tài liệu vừa cập nhật</h3>
        </div>
        
        {recentDocuments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentDocuments.map((doc) => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-surface-hover)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#4f46e5', flexShrink: 0 }}>
                  <FileText size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontWeight: '600', margin: 0, fontSize: '0.95rem' }}>{doc.documentNumber}</h4>
                    {doc.documentType && <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>{doc.documentType}</span>}
                  </div>
                  <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {doc.summary}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>
                  <Calendar size={14} />
                  {format(new Date(doc.createdAt || doc.effectiveDate), 'dd/MM/yyyy', { locale: vi })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>Chưa có hoạt động nào.</p>
        )}
      </div>

    </div>
  );
};

const KpiCard = ({ title, value, icon, color, bgColor }) => (
  <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default' }}
       onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
       onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'; }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: bgColor, color: color, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>{title}</p>
      <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-text-main)' }}>{value}</h3>
    </div>
  </div>
);

export default Overview;
