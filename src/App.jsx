import React, { useState, useEffect } from 'react';
import { DocumentProvider } from './context/DocumentContext';
import InvitePage from './components/InvitePage';
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
import TienDo from './components/TienDo';
import KhoiLuong from './components/KhoiLuong';
import NghiemThu from './components/NghiemThu';
import DanhMucLoi from './components/DanhMucLoi';
import Payment from './components/Payment';

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentView, setCurrentView] = useState('overview');
  const [inviteToken, setInviteToken] = useState(null);

  // Check for ?invite=TOKEN in URL on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (token) setInviteToken(token);
  }, []);

  // Clear token and clean URL after activation
  const handleInviteDone = () => {
    setInviteToken(null);
    // Remove ?invite= from URL without reloading
    const url = new URL(window.location.href);
    url.searchParams.delete('invite');
    window.history.replaceState({}, '', url.toString());
  };

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
        return <TienDo />;
      case 'khoiLuong':
        return <KhoiLuong />;
      case 'atld':
        return <ComingSoon title="ATLĐ & VSMT" icon="🪦" description="Quản lý an toàn lao động, vệ sinh môi trường thi công, biên bản kiểm tra định kỳ." />;
      case 'nghiemThu':
        return <NghiemThu />;
      case 'payment':
        return <Payment />;
      case 'danhMucLoi':
        return <DanhMucLoi />;
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

  // Intercept invite flow — rendered OUTSIDE DocumentProvider is fine;
  // InvitePage uses DocumentContext internally via its own provider below
  if (inviteToken) {
    return (
      <DocumentProvider>
        <InvitePage token={inviteToken} onDone={handleInviteDone} />
      </DocumentProvider>
    );
  }

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
