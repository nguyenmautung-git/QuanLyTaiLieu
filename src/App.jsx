import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { DocumentProvider } from './context/DocumentContext';
import LoginPage from './components/LoginPage';
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

// ── Màn hình chờ ─────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh', backgroundColor: '#0f172a',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '1rem',
  }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '14px',
      background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
      boxShadow: '0 6px 24px rgba(59,130,246,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div style={{ width: '32px', height: '32px', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const [authUser, setAuthUser]     = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [inviteToken, setInviteToken] = useState(null);
  const [isFormOpen, setIsFormOpen]   = useState(false);
  const [currentView, setCurrentView] = useState('overview');

  useEffect(() => {
    // Kiểm tra token mời trong URL
    const params = new URLSearchParams(window.location.search);
    const tok = params.get('invite');
    if (tok) setInviteToken(tok);

    // Lắng nghe trạng thái đăng nhập Firebase
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Sau khi kích hoạt tài khoản qua link mời
  const handleInviteDone = () => {
    setInviteToken(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('invite');
    window.history.replaceState({}, '', url.toString());
    // onAuthStateChanged sẽ tự cập nhật authUser → vào app chính
  };

  const renderContent = () => {
    switch (currentView) {
      case 'overview':           return <Overview />;
      case 'dashboard':          return <Dashboard />;
      case 'projects':           return <Projects />;
      case 'members':            return <Members />;
      case 'partners':           return <Partners />;
      case 'bidding':            return <BiddingPackages />;
      case 'biddingPlan':        return <BiddingPlan />;
      case 'contractorSelection':return <ContractorSelection />;
      case 'phapLy':             return <PhapLy />;
      case 'tienDo':             return <TienDo />;
      case 'khoiLuong':          return <KhoiLuong />;
      case 'atld':               return <ComingSoon title="ATLĐ & VSMT" icon="🪦" description="Quản lý an toàn lao động, vệ sinh môi trường thi công, biên bản kiểm tra định kỳ." />;
      case 'nghiemThu':          return <NghiemThu />;
      case 'payment':            return <Payment />;
      case 'danhMucLoi':         return <DanhMucLoi />;
      case 'settings':           return <Settings />;
      default: return (
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

  // 1. Đang kiểm tra auth → hiển thị loading
  if (authLoading) return <LoadingScreen />;

  // 2. Có link mời → hiển thị trang kích hoạt (không cần đăng nhập trước)
  if (inviteToken) return (
    <DocumentProvider>
      <InvitePage token={inviteToken} onDone={handleInviteDone} />
    </DocumentProvider>
  );

  // 3. Chưa đăng nhập → hiển thị trang login
  if (!authUser) return <LoginPage />;

  // 4. Đã đăng nhập → vào app chính
  return (
    <DocumentProvider currentUser={authUser}>
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
