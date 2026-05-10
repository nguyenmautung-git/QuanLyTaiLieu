import React, { useState } from 'react';
import { DocumentProvider } from './context/DocumentContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DocumentForm from './components/DocumentForm';
import Members from './components/Members';
import Settings from './components/Settings';
import Projects from './components/Projects';
import Overview from './components/Overview';
import Partners from './components/Partners';
import BiddingPackages from './components/BiddingPackages';
import BiddingPlan from './components/BiddingPlan';
import ContractorSelection from './components/ContractorSelection';
import AIAssistant from './components/AIAssistant';
import ComingSoon from './components/ComingSoon';
import PhapLy from './components/PhapLy';

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentView, setCurrentView] = useState('overview');

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return <Overview />;
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <Projects />;
      case 'members':
        return <Members />;
      case 'partners':
        return <Partners />;
      case 'bidding':
        return <BiddingPackages />;
      case 'biddingPlan':
        return <BiddingPlan />;
      case 'contractorSelection':
        return <ContractorSelection />;
      // === Quản lý dự án ===
      case 'phapLy':
        return <PhapLy />;
      case 'tienDo':
        return <ComingSoon title="Tiến độ" icon="📅" description="Theo dõi và cập nhật tiến độ thi công, so sánh kế hoạch và thực tế, cảnh báo trễ tiến độ." />;
      case 'khoiLuong':
        return <ComingSoon title="Khối lượng & Chất lượng" icon="📊" description="Theo dõi khối lượng thực hiện, kết quả kiểm định chất lượng và các biên bản nghiệm thu." />;
      case 'atld':
        return <ComingSoon title="ATLĐ & VSMT" icon="🪦" description="Quản lý an toàn lao động, vệ sinh môi trường thi công, biên bản kiểm tra định kỳ." />;
      case 'nghiemThu':
        return <ComingSoon title="Nghiệm thu - Thanh quyết toán" icon="✅" description="Quản lý hồ sơ nghiệm thu hạng mục, thanh toán theo tiến độ và quyết toán hợp đồng." />;
      case 'danhMucLoi':
        return <ComingSoon title="Danh mục lỗi" icon="📋" description="Ghi nhận, theo dõi và xử lý các lỗi phát sinh trong quá trình thi công và nghiệm thu." />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Chức năng đang phát triển</h2>
            <p>Khu vực này hiện chưa được xây dựng nội dung.</p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setCurrentView('overview')}>
              Quay lại Tổng quan
            </button>
          </div>
        );
    }
  };

  return (
    <DocumentProvider>
      <div className="app-container">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        <main className="main-content">
          <Header currentView={currentView} onOpenForm={() => setIsFormOpen(true)} />
          <div className="content-area">
            {renderContent()}
          </div>
        </main>

        {isFormOpen && <DocumentForm onClose={() => setIsFormOpen(false)} />}
        <AIAssistant />
      </div>
    </DocumentProvider>
  );
}

export default App;
