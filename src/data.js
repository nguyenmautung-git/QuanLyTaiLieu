import { v4 as uuidv4 } from 'uuid';

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
  'Bộ Xây Dựng',
  'Công ty CP Tư vấn Thiết kế',
  'Ban Quản lý Dự án',
  'Phòng Kế hoạch Kỹ thuật',
  'Sở Giao thông Vận tải'
];

export const INITIAL_DOCUMENT_TYPES = [
  'Hồ sơ thiết kế',
  'Công văn đi',
  'Công văn đến',
  'Tờ trình',
  'Quyết định',
  'Biên bản'
];
