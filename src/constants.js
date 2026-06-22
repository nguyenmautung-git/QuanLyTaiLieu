/**
 * App-wide constants — tập trung tất cả magic strings để dễ bảo trì.
 * Import từ bất kỳ component nào thay vì hard-code strings trực tiếp.
 */

// ── Vai trò người dùng ────────────────────────────────────────────────────
export const ROLES = {
  ADMIN: 'Admin',
  USER: 'User',
};

// ── Trạng thái bước công việc (pháp lý / tiến độ / nghiệm thu) ───────────
export const STEP_STATUS = {
  DONE: 'done',
  IN_PROGRESS: 'inprogress',
  PENDING: 'pending',
};

// ── Trạng thái lời mời thành viên ─────────────────────────────────────────
export const INVITE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
};

// ── Tên collection Firestore ──────────────────────────────────────────────
export const COLLECTIONS = {
  DOCUMENTS: 'documents',
  PROJECTS: 'projects',
  MEMBERS: 'members',
  PARTNERS: 'partners',
  BIDDING_PACKAGES: 'biddingPackages',
  LEGAL_STEPS: 'legalSteps',
  SCHEDULE_STEPS: 'scheduleSteps',
  ACCEPTANCE_STEPS: 'acceptanceSteps',
  INVITATIONS: 'invitations',
};

// ── Danh sách bước mặc định (dùng chung PhapLy & TienDo) ─────────────────
export const WORKFLOW_DEFAULT_STEPS = [
  'Phê duyệt chủ trương đầu tư',
  'Phê duyệt dự án đầu tư (Quyết định đầu tư)',
  'Chấp thuận địa điểm xây dựng',
  'Phê duyệt quy hoạch chi tiết 1/500',
  'Cấp phép xây dựng',
  'Thẩm duyệt thiết kế PCCC',
  'Phê duyệt thiết kế bản vẽ thi công',
  'Nghiệm thu hoàn thành công trình',
  'Bàn giao đưa vào sử dụng',
];
