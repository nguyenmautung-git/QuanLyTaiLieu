import React, { useState } from 'react';
import { DocumentProvider } from './context/DocumentContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DocumentForm from './components/DocumentForm';

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <DocumentProvider>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Header onOpenForm={() => setIsFormOpen(true)} />
          <div className="content-area">
            <Dashboard />
          </div>
        </main>
        
        {isFormOpen && <DocumentForm onClose={() => setIsFormOpen(false)} />}
      </div>
    </DocumentProvider>
  );
}

export default App;
