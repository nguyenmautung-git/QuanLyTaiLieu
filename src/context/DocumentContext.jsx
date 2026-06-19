import React, { createContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, writeBatch, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase';
import { mockProjects, mockMembers, mockPartners, LIST_CONFIGS } from '../data';
import { generateToken, hashToken, getAppUrl } from '../utils/inviteUtils';

export const DocumentContext = createContext();

export const DocumentProvider = ({ children, currentUser }) => {
  const [documents, setDocuments] = useState([]);
  const [userRole, setUserRole] = useState('User');
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
  const [legalSteps, setLegalSteps] = useState([]);
  const [scheduleSteps, setScheduleSteps] = useState([]);
  const [acceptanceSteps, setAcceptanceSteps] = useState([]);
  const [invitations, setInvitations] = useState([]);

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
            ...doc.data()
          })).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          
          const uniqueData = listData.filter((item, index, self) => 
            index === self.findIndex((t) => t.name === item.name)
          );

          setGlobalLists(prev => ({ ...prev, [config.key]: uniqueData }));
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

    // Theo dõi tiến độ theo dự án
    const unsubscribeSchedule = onSnapshot(collection(db, 'scheduleSteps'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setScheduleSteps(data);
    });

    // Theo dõi nghiệm thu thanh toán theo dự án
    const unsubscribeAcceptance = onSnapshot(collection(db, 'acceptanceSteps'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAcceptanceSteps(data);
    });

    // Theo dõi lời mời thành viên
    const unsubscribeInvitations = onSnapshot(collection(db, 'invitations'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => {
        const tA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const tB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return tB - tA;
      });
      setInvitations(data);
    });

    return () => {
      unsubscribeDocs();
      listUnsubscribes.forEach(unsub => unsub());
      unsubscribeProjects();
      unsubscribeMembers();
      unsubscribePartners();
      unsubscribeBidding();
      unsubscribeLegal();
      unsubscribeSchedule();
      unsubscribeAcceptance();
      unsubscribeInvitations();
    };
  }, []);

  // Đồng bộ userRole từ member document của người đang đăng nhập
  useEffect(() => {
    if (currentUser && members.length > 0) {
      const member = members.find(m => m.email === currentUser.email);
      if (member) setUserRole(member.role || 'User');
    }
  }, [members, currentUser]);

  // Giữ lại cho Admin để test giao diện User (debug)
  const toggleRole = () => {
    setUserRole(prev => prev === 'Admin' ? 'User' : 'Admin');
  };

  const addListItem = async (collectionName, dataOrName) => {
    // Kiểm tra trùng lặp
    const config = LIST_CONFIGS.find(c => c.collectionName === collectionName);
    if (!config) return;

    const name = typeof dataOrName === 'string' ? dataOrName : dataOrName.name;
    const currentList = globalLists[config.key];
    const exists = currentList.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (name && !exists) {
      try {
        const payload = typeof dataOrName === 'string' ? { name } : dataOrName;
        await addDoc(collection(db, collectionName), payload);
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

  const editListItem = async (collectionName, id, newData) => {
    try {
      const payload = typeof newData === 'string' ? { name: newData } : newData;
      await updateDoc(doc(db, collectionName, id), payload);
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

  // ==== Schedule Steps ====
  const addScheduleStep = async (projectId, stepData) => {
    await addDoc(collection(db, 'scheduleSteps'), { projectId, ...stepData, createdAt: new Date().toISOString() });
  };
  const updateScheduleStep = async (id, stepData) => {
    await updateDoc(doc(db, 'scheduleSteps', id), { ...stepData, updatedAt: new Date().toISOString() });
  };
  const deleteScheduleStep = async (id) => {
    await deleteDoc(doc(db, 'scheduleSteps', id));
  };

  // ==== Acceptance Steps ====
  const addAcceptanceStep = async (projectId, stepData) => {
    await addDoc(collection(db, 'acceptanceSteps'), { projectId, ...stepData, createdAt: new Date().toISOString() });
  };
  const updateAcceptanceStep = async (id, stepData) => {
    await updateDoc(doc(db, 'acceptanceSteps', id), { ...stepData, updatedAt: new Date().toISOString() });
  };
  const deleteAcceptanceStep = async (id) => {
    await deleteDoc(doc(db, 'acceptanceSteps', id));
  };

  // ==== Invitations ====

  /** Gửi lời mời — trả về invite link để Admin copy */
  const sendInvitation = async ({ email, name, role, level }) => {
    // Rate limit: tối đa 5 lời mời trong 60 giây
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentCount = invitations.filter(inv => {
      const createdAt = inv.createdAt?.toDate?.() || new Date(inv.createdAt || 0);
      return createdAt > oneMinuteAgo && inv.status === 'pending';
    }).length;
    if (recentCount >= 5) throw new Error('RATE_LIMITED');

    // Kiểm tra email đã được mời chưa
    const alreadyPending = invitations.find(
      inv => inv.email === email && inv.status === 'pending'
    );
    if (alreadyPending) throw new Error('ALREADY_INVITED');

    // Tạo token bảo mật
    const plainToken = generateToken();
    const tokenHash = await hashToken(plainToken);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 giờ

    // Lưu vào Firestore (chỉ lưu hash, KHÔNG lưu plainToken)
    await addDoc(collection(db, 'invitations'), {
      email,
      name,
      role,
      level: Number(level),
      tokenHash,          // hash SHA-256, không phải token gốc
      expiresAt,
      status: 'pending',
      createdBy: 'Admin',
      createdAt: new Date(),
      activatedAt: null,
    });

    // Trả về link để Admin copy
    return `${getAppUrl()}?invite=${plainToken}`;
  };

  /** Admin thu hồi lời mời */
  const revokeInvitation = async (id) => {
    await updateDoc(doc(db, 'invitations', id), {
      status: 'revoked',
      tokenHash: null, // Vô hiệu hóa hash
    });
  };

  /** Gửi lại lời mời (tạo token mới) */
  const resendInvitation = async (id) => {
    // Rate limit check
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentCount = invitations.filter(inv => {
      const createdAt = inv.createdAt?.toDate?.() || new Date(inv.createdAt || 0);
      return createdAt > oneMinuteAgo && inv.status === 'pending';
    }).length;
    if (recentCount >= 5) throw new Error('RATE_LIMITED');

    const plainToken = generateToken();
    const tokenHash = await hashToken(plainToken);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await updateDoc(doc(db, 'invitations', id), {
      tokenHash,
      expiresAt,
      status: 'pending',
      createdAt: new Date(),
      activatedAt: null,
    });

    // Lấy email/name từ invitations state để tạo link
    const inv = invitations.find(i => i.id === id);
    return `${getAppUrl()}?invite=${plainToken}`;
  };

  /**
   * Xác minh token từ URL — gọi từ InvitePage
   * Returns { valid, invitation, error }
   */
  const verifyInviteToken = async (plainToken) => {
    try {
      const tokenHash = await hashToken(plainToken);
      const q = query(collection(db, 'invitations'), where('tokenHash', '==', tokenHash));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return { valid: false, error: 'Link mời không hợp lệ hoặc đã được sử dụng.' };

      const invDoc = snapshot.docs[0];
      const inv = { id: invDoc.id, ...invDoc.data() };

      if (inv.status === 'revoked') return { valid: false, error: 'Link mời đã bị thu hồi bởi Admin.' };
      if (inv.status === 'active')  return { valid: false, error: 'Tài khoản đã được kích hoạt từ link này rồi.' };
      if (inv.status !== 'pending') return { valid: false, error: 'Link mời không còn hiệu lực.' };

      const expiresAt = inv.expiresAt?.toDate?.() || new Date(inv.expiresAt);
      if (expiresAt < new Date()) {
        await updateDoc(doc(db, 'invitations', inv.id), { status: 'expired', tokenHash: null });
        return { valid: false, error: 'Link mời đã hết hạn (>48 giờ). Vui lòng yêu cầu Admin gửi lại.' };
      }

      return { valid: true, invitation: inv };
    } catch (err) {
      return { valid: false, error: 'Không thể xác minh link. Kiểm tra kết nối internet.' };
    }
  };

  /**
   * Kích hoạt tài khoản — đặt mật khẩu và tạo Firebase Auth user
   * Gọi sau khi verifyInviteToken thành công
   */
  const activateAccount = async (plainToken, password) => {
    // Xác minh lại token lần cuối
    const { valid, invitation, error } = await verifyInviteToken(plainToken);
    if (!valid) throw new Error(error);

    // Tạo Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, invitation.email, password);
    await updateProfile(userCredential.user, { displayName: invitation.name });

    // Thêm vào members collection
    await addDoc(collection(db, 'members'), {
      name: invitation.name,
      email: invitation.email,
      phone: '',
      role: invitation.role,
      level: invitation.level,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
      locked: false,
      createdAt: new Date(),
    });

    // Vô hiệu hóa token (single-use)
    await updateDoc(doc(db, 'invitations', invitation.id), {
      status: 'active',
      activatedAt: new Date(),
      tokenHash: null, // Xóa hash sau khi dùng
    });

    return userCredential.user;
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
      legalSteps, addLegalStep, updateLegalStep, deleteLegalStep,
      scheduleSteps, addScheduleStep, updateScheduleStep, deleteScheduleStep,
      acceptanceSteps, addAcceptanceStep, updateAcceptanceStep, deleteAcceptanceStep,
      invitations, sendInvitation, revokeInvitation, resendInvitation, verifyInviteToken, activateAccount,
    }}>
      {children}
    </DocumentContext.Provider>
  );
};
