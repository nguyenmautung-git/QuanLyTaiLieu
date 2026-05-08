import React, { createContext, useState, useEffect } from 'react';
import { initialDocuments, INITIAL_DOCUMENT_TYPES } from '../data';

export const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [userRole, setUserRole] = useState('Admin'); // 'Admin' hoặc 'User'
  const [documentTypes, setDocumentTypes] = useState([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('project_documents');
    if (saved) {
      setDocuments(JSON.parse(saved));
    } else {
      setDocuments(initialDocuments);
      localStorage.setItem('project_documents', JSON.stringify(initialDocuments));
    }

    const savedTypes = localStorage.getItem('document_types');
    if (savedTypes) {
      setDocumentTypes(JSON.parse(savedTypes));
    } else {
      setDocumentTypes(INITIAL_DOCUMENT_TYPES);
      localStorage.setItem('document_types', JSON.stringify(INITIAL_DOCUMENT_TYPES));
    }
  }, []);

  const toggleRole = () => {
    setUserRole(prev => prev === 'Admin' ? 'User' : 'Admin');
  };

  const addDocumentType = (newType) => {
    if (newType && !documentTypes.includes(newType)) {
      const updatedTypes = [...documentTypes, newType];
      setDocumentTypes(updatedTypes);
      localStorage.setItem('document_types', JSON.stringify(updatedTypes));
    }
  };

  const addDocument = (newDoc) => {
    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    localStorage.setItem('project_documents', JSON.stringify(updatedDocs));
    
    if (newDoc.documentType) {
      addDocumentType(newDoc.documentType);
    }
  };

  const markAsRead = () => {
    const updatedDocs = documents.map(doc => ({ ...doc, isNew: false }));
    setDocuments(updatedDocs);
    localStorage.setItem('project_documents', JSON.stringify(updatedDocs));
  };

  const getNewCount = () => {
    return documents.filter(doc => doc.isNew).length;
  };

  return (
    <DocumentContext.Provider value={{ documents, addDocument, markAsRead, getNewCount, userRole, toggleRole, documentTypes, addDocumentType }}>
      {children}
    </DocumentContext.Provider>
  );
};
