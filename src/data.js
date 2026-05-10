import { v4 as uuidv4 } from 'uuid';

export const PASTEL_COLORS = [
  '#fdf2f8', // pink-50
  '#eff6ff', // blue-50
  '#f0fdf4', // green-50
  '#fffbeb', // amber-50
  '#f5f3ff', // violet-50
  '#fff1f2', // rose-50
  '#f0fdfa', // teal-50
  '#ecfdf5', // emerald-50
];

export const getPastelColor = (idStr) => {
  if (!idStr) return PASTEL_COLORS[0];
  let hash = 0;
  const str = idStr.toString();
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PASTEL_COLORS.length;
  return PASTEL_COLORS[index];
};

export const mockMembers = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', role: 'Admin', phone: '0901234567', avatar: 'https://i.pravatar.cc/150?img=11', locked: false, level: 7 },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', role: 'User', phone: '0987654321', avatar: 'https://i.pravatar.cc/150?img=5', locked: false, level: 3 },
  { id: 3, name: 'Lê Hoàng C', email: 'lehoangc@example.com', role: 'User', phone: '0912345678', avatar: 'https://i.pravatar.cc/150?img=12', locked: true, level: 2 },
  { id: 4, name: 'Phạm Minh D', email: 'phamminhd@example.com', role: 'User', phone: '0933334444', avatar: 'https://i.pravatar.cc/150?img=3', locked: false, level: 5 },
];

export const PROJECT_ROLES = [
  'Giám đốc DA',
  'Chuyên viên',
  'Thư ký DA'
];

export const initialDocuments = [
  {
    id: 'doc-1',
    documentCode: 'HD-2024-001',
    documentNumber: '125/QĐ-BXD',
    issuingAgency: 'Bộ Xây Dựng',
    documentType: 'Quyết định',
    effectiveDate: '2024-01-15',
    summary: 'Quyết định phê duyệt quy hoạch xây dựng khu đô thị sinh thái thông minh phía Nam thành phố.',
    relatedProjects: ['Dự án Khu đô thị Xanh', 'Dự án Cơ sở hạ tầng Nam'],
    attachmentLink: 'https://example.com/doc1.pdf',
    quickViewImage: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=600&auto=format&fit=crop',
    uploader: 'Nguyễn Văn A',
    createdAt: '2024-01-20T08:30:00Z',
    isNew: false
  },
  {
    id: 'doc-2',
    documentCode: 'TK-2024-042',
    documentNumber: '42/BVTK-TC',
    issuingAgency: 'Công ty CP Tư vấn Thiết kế',
    documentType: 'Hồ sơ thiết kế',
    effectiveDate: '2024-03-10',
    summary: 'Bản vẽ thiết kế thi công chi tiết hạng mục Cầu Vượt Nút Giao Trung Tâm.',
    relatedProjects: ['Dự án Nút giao Trung Tâm'],
    attachmentLink: 'https://example.com/doc2.pdf',
    quickViewImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop',
    uploader: 'Trần Thị B',
    createdAt: '2024-03-12T14:15:00Z',
    isNew: false
  },
  {
    id: 'doc-3',
    documentCode: 'BB-2024-015',
    documentNumber: '15/BB-NT',
    issuingAgency: 'Ban Quản lý Dự án',
    documentType: 'Biên bản',
    effectiveDate: '2024-04-22',
    summary: 'Biên bản nghiệm thu hoàn thành giai đoạn 1 hạng mục cọc khoan nhồi.',
    relatedProjects: ['Dự án Khu đô thị Xanh', 'Dự án Chung cư Cao cấp M1'],
    attachmentLink: 'https://example.com/doc3.pdf',
    quickViewImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
    uploader: 'Lê Văn C',
    createdAt: '2024-04-23T09:00:00Z',
    isNew: true
  },
  {
    id: 'doc-4',
    documentCode: 'DT-2024-088',
    documentNumber: '88/DT-XD',
    issuingAgency: 'Phòng Kế hoạch Kỹ thuật',
    documentType: 'Tờ trình',
    effectiveDate: '2024-05-02',
    summary: 'Dự toán kinh phí bổ sung cho việc mở rộng đường gom khu vực phía Tây.',
    relatedProjects: ['Dự án Nút giao Trung Tâm'],
    attachmentLink: 'https://example.com/doc4.pdf',
    quickViewImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop',
    uploader: 'Nguyễn Văn A',
    createdAt: '2024-05-03T16:45:00Z',
    isNew: true
  }
];

export const ALL_PROJECTS = [
  'Dự án Khu đô thị Xanh',
  'Dự án Cơ sở hạ tầng Nam',
  'Dự án Nút giao Trung Tâm',
  'Dự án Chung cư Cao cấp M1',
  'Dự án Cải tạo Kênh Tẻ'
];

export const ALL_AGENCIES = [
  'UBND Thành phố Hà Nội'
];

export const INITIAL_DOCUMENT_TYPES = [
  'Hồ sơ thiết kế',
  'Công văn đi',
  'Công văn đến',
  'Tờ trình',
  'Quyết định',
  'Biên bản'
];

export const EMPLOYEE_LEVELS = [
  { id: 1, shortName: 'Cấp 1', fullName: 'Cấp 1: Cán bộ/Nhân viên nghiệp vụ giản đơn' },
  { id: 2, shortName: 'Cấp 2', fullName: 'Cấp 2: Cán bộ/Nhân viên nghiệp vụ' },
  { id: 3, shortName: 'Cấp 3', fullName: 'Cấp 3: Quản trị viên/Chuyên viên (ví dụ: Trưởng nhóm, Quản trị viên dự án)' },
  { id: 4, shortName: 'Cấp 4', fullName: 'Cấp 4: Quản lý/Chuyên gia (ví dụ: Trưởng phòng, Quản trị viên dự án lớn)' },
  { id: 5, shortName: 'Cấp 5', fullName: 'Cấp 5: Quản lý/Chuyên gia cao cấp (ví dụ: Giám đốc Trung tâm thuộc công ty thành viên)' },
  { id: 6, shortName: 'Cấp 6', fullName: 'Cấp 6: Quản lý cao cấp (Ban Tổng Giám đốc công ty thành viên)' },
  { id: 7, shortName: 'Cấp 7', fullName: 'Cấp 7: Lãnh đạo cấp tập đoàn (Hội đồng quản trị, Ban Tổng Giám đốc FPT)' }
];

export const PROJECT_DETAILS_TEMPLATE = [
  { id: '1', key: 'tong_dien_tich', name: 'Tổng diện tích ô đất dự án (m2)', value: '' },
  { id: '2', key: 'mat_do_xay_dung', name: 'Mật độ xây dựng (m2)', value: '' },
  { id: '3', key: 'he_so_su_dung_dat', name: 'Hệ số sử dụng đất (lần)', value: '' },
  { id: '4', key: 'so_tang_cao', name: 'Số tầng cao (tầng)', value: '' },
  { id: '5', key: 'so_tang_ham', name: 'Số tầng hầm (tầng)', value: '' },
  { id: '6', key: 'dien_tich_xay_dung', name: 'Diện tích xây dựng (m2)', value: '' },
  { id: '7', key: 'tong_dien_tich_san', name: 'Tổng diện tích sàn xây dựng (m2)', value: '' },
  { id: '8', key: 'cong_suat_phuc_vu', name: 'Công suất phục vụ (người)', value: '' },
  { id: '9', key: 'chieu_cao_pccc', name: 'Chiều cao PCCC (m)', value: '' },
  { id: '10', key: 'chieu_cao_tinh_khong', name: 'Chiều cao tĩnh không', value: '' },
  { id: '11', key: 'chieu_sau_tang_ham', name: 'Chiều sâu tầng hầm', value: '' },
  { id: '12', key: 'phan_cap_du_an', name: 'Phân cấp dự án', value: '' },
  { id: '13', key: 'phan_loai_du_an', name: 'Phân loại dự án', value: '' }
];

export const mockProjects = [
  {
    id: 1,
    code: 'CNS-01',
    name: 'Dự án Toà nhà CNS-1',
    location: 'Khu công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội',
    investor: 'Công ty TNHH Hạ tầng công nghệ số FPT',
    parentId: '',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
    details: PROJECT_DETAILS_TEMPLATE.map(d => ({ ...d, value: d.key === 'so_tang_cao' ? '15' : '' }))
  }
];

export const mockPartners = [
  {
    id: 1,
    name: 'Công ty Cổ phần Xây dựng Coteccons',
    shortName: 'Coteccons',
    taxCode: '0303443233',
    type: 'Nhà thầu thi công',
    representative: 'Bolat Duisenov',
    phone: '028 3514 2255',
    email: 'contact@coteccons.vn',
    address: 'Tòa nhà Coteccons, 236/6 Điện Biên Phủ, Phường 17, Quận Bình Thạnh, TP.HCM',
    website: 'https://coteccons.vn',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop',
    locked: false
  },
  {
    id: 2,
    name: 'Công ty TNHH Hệ thống Thông tin FPT',
    shortName: 'FPT IS',
    taxCode: '0100111111',
    type: 'Nhà thầu công nghệ',
    representative: 'Nguyễn Văn Khoa',
    phone: '024 3562 6000',
    email: 'contact@fpt.com.vn',
    address: 'Tòa nhà FPT, Số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội',
    website: 'https://fpt-is.com',
    logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&h=150&fit=crop',
    locked: false
  }
];

export const LIST_CONFIGS = [
  {
    key: 'documentTypes',
    collectionName: 'documentTypes',
    name: 'Phân loại tài liệu',
    description: 'Danh sách các loại tài liệu hiện có trong hệ thống.',
    initialData: INITIAL_DOCUMENT_TYPES
  },
  {
    key: 'employeeLevels',
    collectionName: 'employeeLevels',
    name: 'Quản lý cấp bậc nhân viên',
    description: 'Danh sách các cấp bậc của nhân viên.',
    initialData: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7']
  },
  {
    key: 'projectRoles',
    collectionName: 'projectRoles',
    name: 'Vai trò trong dự án',
    description: 'Danh sách các vai trò có thể phân công cho thành viên trong một dự án.',
    initialData: ['Giám đốc dự án', 'Điều phối dự án', 'Thành viên dự án', 'Thư ký dự án']
  },
  {
    key: 'projectGrades',
    collectionName: 'projectGrades',
    name: 'Phân cấp dự án',
    description: 'Phân cấp quy mô, tầm quan trọng của dự án.',
    initialData: ['Cấp đặc biệt', 'Cấp I', 'Cấp II', 'Cấp III', 'Cấp IV', 'Cấp V']
  },
  {
    key: 'fireHazardGroups',
    collectionName: 'fireHazardGroups',
    name: 'Phân nhóm nguy hiểm cháy theo công năng',
    description: 'Nhóm nguy hiểm cháy theo mục đích sử dụng công năng.',
    initialData: ['Nhóm F1', 'Nhóm F2', 'Nhóm F3', 'Nhóm F4', 'Nhóm F5']
  },
  {
    key: 'fireResistanceLevels',
    collectionName: 'fireResistanceLevels',
    name: 'Phân bậc chịu lửa của nhà, công trình',
    description: 'Bậc chịu lửa thiết kế của công trình.',
    initialData: ['Bậc I', 'Bậc II', 'Bậc III', 'Bậc IV', 'Bậc V']
  },
  {
    key: 'structuralFireHazardGrades',
    collectionName: 'structuralFireHazardGrades',
    name: 'Phân cấp nguy hiểm cháy kết cấu',
    description: 'Cấp nguy hiểm cháy của các kết cấu.',
    initialData: ['S0', 'S1', 'S2', 'S3']
  },
  {
    key: 'partnerTypes',
    collectionName: 'partnerTypes',
    name: 'Phân loại đối tác',
    description: 'Phân loại các công ty đối tác tham gia dự án.',
    initialData: ['Chủ đầu tư', 'Nhà thầu thi công', 'Đơn vị tư vấn', 'Nhà cung cấp vật tư', 'Đơn vị giám sát']
  },
  {
    key: 'packageNames',
    collectionName: 'packageNames',
    name: 'Danh sách Tên gói thầu',
    description: 'Danh sách tên gói thầu được gợi ý để tái sử dụng.',
    initialData: []
  }
];
