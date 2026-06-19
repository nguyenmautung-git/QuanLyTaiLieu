import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { DocumentProvider } from './context/DocumentContext';
import LoginPage from './components/LoginPage';
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
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // null if logged out, user object if logged in
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
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

  // Loading state while Firebase checks auth
  if (user === undefined) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#0f172a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '1rem',
      }}>
        <div style={{
          width: '44px', height: '44px',
          border: '3px solid rgba(59,130,246,0.2)',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: '#475569', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
          Đang tải...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in → show Login page
  if (!user) {
    return <LoginPage />;
  }

  // Logged in → show full app
  return (
    <DocumentProvider>
      <div className="app-container">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        <main className="main-content">
          <Header
            currentView={currentView}
            onOpenForm={() => setIsFormOpen(true)}
            user={user}
            onLogout={handleLogout}
          />
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
