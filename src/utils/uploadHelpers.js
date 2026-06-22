/**
 * Upload utility helpers — tập trung các hàm upload dùng chung.
 * Tránh copy-paste `withTimeout` trong PhapLy / TienDo / NghiemThu.
 */

/**
 * Wrap một Promise với timeout — nếu quá thời gian sẽ reject với Error('TIMEOUT').
 * @param {Promise} promise - Promise cần wrap
 * @param {number} ms - Thời gian timeout (ms)
 */
export const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms)
    ),
  ]);

/**
 * Tạo thông báo lỗi upload phù hợp dựa trên loại lỗi.
 * @param {Error} err
 * @returns {string}
 */
export const getUploadErrorMessage = (err) => {
  if (err.message === 'TIMEOUT' || err.code === 'storage/unauthorized') {
    return 'Firebase Storage chưa cho phép upload. Vào Firebase Console → Storage → Rules → đổi thành: allow read, write: if true;';
  }
  return `Lỗi tải lên: ${err.message || 'Vui lòng thử lại'}`;
};
