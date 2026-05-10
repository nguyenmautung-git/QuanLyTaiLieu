import React, { createContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { mockProjects, mockMembers, mockPartners, LIST_CONFIGS } from '../data';

export const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [userRole, setUserRole] = useState('Admin'); // 'Admin' hoặc 'User'
  const [globalLists, setGlobalLists] = useState(
    LIST_CONFIGS.reduce((acc, config) => {
      acc[config.key] = [];
      return acc;
    }, {})
  );
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [biddingPackages, setBiddingPackages] = useState([]);
  const [legalSteps, setLegalSteps] = useState([]); // legal workflow steps per project

  useEffect(() => {
    // Theo dõi danh sách tài liệu
    const unsubscribeDocs = onSnapshot(collection(db, 'documents'), (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sắp xếp theo ngày tạo mới nhất (nếu có)
      docsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setDocuments(docsData);
    });

    // Theo dõi các danh mục cài đặt động (7 danh mục)
    const listUnsubscribes = LIST_CONFIGS.map(config => {
      return onSnapshot(collection(db, config.collectionName), (snapshot) => {
        if (!snapshot.empty) {
          const listData = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name
          })).sort((a, b) => a.name.localeCompare(b.name));
          setGlobalLists(prev => ({ ...prev, [config.key]: listData }));
        } else {
          // Nạp dữ liệu mẫu lên Firebase
          config.initialData.forEach(async (item) => {
            await addDoc(collection(db, config.collectionName), { name: item });
          });
        }
      });
    });

    // Theo dõi danh sách dự án
    const unsubscribeProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      if (!snapshot.empty) {
        const projectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectsData);
      } else {
        // Nạp dữ liệu mẫu
        mockProjects.forEach(async (project) => {
          const { id, ...data } = project;
          await addDoc(collection(db, 'projects'), data);
        });
      }
    });

    // Theo dõi danh sách thành viên
    const unsubscribeMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      if (!snapshot.empty) {
        const membersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMembers(membersData);
      } else {
        // Nạp dữ liệu mẫu
        mockMembers.forEach(async (member) => {
          const { id, ...data } = member;
          await addDoc(collection(db, 'members'), data);
        });
      }
    });

    // Theo dõi danh sách đối tác
    const unsubscribePartners = onSnapshot(collection(db, 'partners'), (snapshot) => {
      if (!snapshot.empty) {
        const partnersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPartners(partnersData);
      } else {
        // Nạp dữ liệu mẫu
        mockPartners.forEach(async (partner) => {
          const { id, ...data } = partner;
          await addDoc(collection(db, 'partners'), data);
        });
      }
    });

    // Theo dõi gói thầu
    const unsubscribeBidding = onSnapshot(collection(db, 'biddingPackages'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setBiddingPackages(data);
    });

    // Theo dõi bước pháp lý theo dự án
    const unsubscribeLegal = onSnapshot(collection(db, 'legalSteps'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setLegalSteps(data);
    });

    return () => {
      unsubscribeDocs();
      listUnsubscribes.forEach(unsub => unsub());
      unsubscribeProjects();
      unsubscribeMembers();
      unsubscribePartners();
      unsubscribeBidding();
      unsubscribeLegal();
    };
  }, []);

  const toggleRole = () => {
    setUserRole(prev => prev === 'Admin' ? 'User' : 'Admin');
  };

  const addListItem = async (collectionName, name) => {
    // Kiểm tra trùng lặp
    const config = LIST_CONFIGS.find(c => c.collectionName === collectionName);
    if (!config) return;

    const currentList = globalLists[config.key];
    const exists = currentList.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (name && !exists) {
      try {
        await addDoc(collection(db, collectionName), { name });
      } catch (error) {
        console.error(`Lỗi khi thêm vào ${collectionName}: `, error);
      }
    }
  };

  const deleteListItem = async (collectionName, id) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(`Lỗi khi xóa khỏi ${collectionName}: `, error);
    }
  };

  const editListItem = async (collectionName, id, newName) => {
    try {
      await updateDoc(doc(db, collectionName, id), { name: newName });
    } catch (error) {
      console.error(`Lỗi khi sửa ${collectionName}: `, error);
    }
  };

  // Wrapper for backward compatibility with existing code
  const addDocumentType = (name) => addListItem('documentTypes', name);
  const deleteDocumentType = (id) => deleteListItem('documentTypes', id);
  const editDocumentType = (id, newName) => editListItem('documentTypes', id, newName);

  const addDocument = async (newDoc) => {
    try {
      // Bỏ id giả do Form tạo ra, để Firebase tự tạo ID
      const { id, ...docData } = newDoc;
      await addDoc(collection(db, 'documents'), docData);

      if (docData.documentType) {
        addDocumentType(docData.documentType);
      }
    } catch (error) {
      console.error("Lỗi khi tải lên tài liệu: ", error);
      throw error; // Để Form có thể bắt lỗi
    }
  };

  const editDocument = async (id, updatedDoc) => {
    try {
      const docRef = doc(db, 'documents', id);
      const { id: docId, ...docData } = updatedDoc;
      await updateDoc(docRef, docData);

      if (docData.documentType) {
        addDocumentType(docData.documentType);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật tài liệu: ", error);
      throw error;
    }
  };

  const deleteDocument = async (id) => {
    try {
      await deleteDoc(doc(db, 'documents', id));
    } catch (error) {
      console.error("Lỗi khi xóa tài liệu: ", error);
      throw error;
    }
  };

  const markAsRead = async () => {
    try {
      const batch = writeBatch(db);
      const unreadDocs = documents.filter(doc => doc.isNew);

      unreadDocs.forEach((document) => {
        const docRef = doc(db, 'documents', document.id);
        batch.update(docRef, { isNew: false });
      });

      await batch.commit();
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc: ", error);
    }
  };

  const getNewCount = () => {
    return documents.filter(doc => doc.isNew).length;
  };

  const addProject = async (newProject) => {
    try {
      const { id, ...data } = newProject;
      await addDoc(collection(db, 'projects'), data);
    } catch (error) {
      console.error("Lỗi khi thêm dự án: ", error);
      throw error;
    }
  };

  const editProject = async (id, updatedProject) => {
    try {
      const { id: _, ...data } = updatedProject;
      await updateDoc(doc(db, 'projects', id), data);
    } catch (error) {
      console.error("Lỗi khi sửa dự án: ", error);
      throw error;
    }
  };

  const deleteProject = async (id) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      console.error("Lỗi khi xóa dự án: ", error);
      throw error;
    }
  };

  const addMember = async (newMember) => {
    try {
      const { id, ...data } = newMember;
      await addDoc(collection(db, 'members'), data);
    } catch (error) {
      console.error("Lỗi khi thêm thành viên: ", error);
      throw error;
    }
  };

  const editMember = async (id, updatedMember) => {
    try {
      const { id: _, ...data } = updatedMember;
      await updateDoc(doc(db, 'members', id), data);
    } catch (error) {
      console.error("Lỗi khi sửa thành viên: ", error);
      throw error;
    }
  };

  const deleteMember = async (id) => {
    try {
      await deleteDoc(doc(db, 'members', id));
    } catch (error) {
      console.error("Lỗi khi xóa thành viên: ", error);
      throw error;
    }
  };

  const addPartner = async (newPartner) => {
    try {
      const { id, ...data } = newPartner;
      await addDoc(collection(db, 'partners'), data);
    } catch (error) {
      console.error("Lỗi khi thêm đối tác: ", error);
      throw error;
    }
  };

  const editPartner = async (id, updatedPartner) => {
    try {
      const { id: _, ...data } = updatedPartner;
      await updateDoc(doc(db, 'partners', id), data);
    } catch (error) {
      console.error("Lỗi khi sửa đối tác: ", error);
      throw error;
    }
  };

  const deletePartner = async (id) => {
    try {
      await deleteDoc(doc(db, 'partners', id));
    } catch (error) {
      console.error("Lỗi khi xóa đối tác: ", error);
      throw error;
    }
  };

  // ==== Bidding Packages ====
  const addBiddingPackage = async (projectId, pkgData) => {
    await addDoc(collection(db, 'biddingPackages'), { projectId, ...pkgData, createdAt: new Date().toISOString() });
  };
  const editBiddingPackage = async (projectId, pkgId, pkgData) => {
    const { id, ...data } = pkgData;
    const cleanedData = {};
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined) cleanedData[k] = v; });
    await updateDoc(doc(db, 'biddingPackages', pkgId), { ...cleanedData, updatedAt: new Date().toISOString() });
  };
  const deleteBiddingPackage = async (projectId, pkgId) => {
    await deleteDoc(doc(db, 'biddingPackages', pkgId));
  };
  const reorderBiddingPackages = async (pkgs, projectCode) => {
    const batch = writeBatch(db);
    pkgs.forEach((pkg, index) => {
      const ref = doc(db, 'biddingPackages', pkg.id);
      const { id, ...data } = pkg;
      const computedCode = projectCode ? `${projectCode}.GT.${String(index + 1).padStart(2, '0')}` : data.code;
      const cleanedData = {};
      Object.entries({ ...data, order: index, code: computedCode, updatedAt: new Date().toISOString() })
        .forEach(([k, v]) => { if (v !== undefined) cleanedData[k] = v; });
      batch.update(ref, cleanedData);
    });
    await batch.commit();
  };

  // ==== Legal Steps ====
  const addLegalStep = async (projectId, stepData) => {
    await addDoc(collection(db, 'legalSteps'), { projectId, ...stepData, createdAt: new Date().toISOString() });
  };
  const updateLegalStep = async (id, stepData) => {
    await updateDoc(doc(db, 'legalSteps', id), { ...stepData, updatedAt: new Date().toISOString() });
  };
  const deleteLegalStep = async (id) => {
    await deleteDoc(doc(db, 'legalSteps', id));
  };

  return (
    <DocumentContext.Provider value={{
      documents, addDocument, editDocument, deleteDocument, markAsRead, getNewCount,
      userRole, toggleRole,
      documentTypes: globalLists.documentTypes, addDocumentType, deleteDocumentType, editDocumentType,
      globalLists, addListItem, editListItem, deleteListItem,
      projects, addProject, editProject, deleteProject,
      members, addMember, editMember, deleteMember,
      partners, addPartner, editPartner, deletePartner,
      biddingPackages, addBiddingPackage, editBiddingPackage, deleteBiddingPackage, reorderBiddingPackages,
      legalSteps, addLegalStep, updateLegalStep, deleteLegalStep
    }}>
      {children}
    </DocumentContext.Provider>
  );
};
