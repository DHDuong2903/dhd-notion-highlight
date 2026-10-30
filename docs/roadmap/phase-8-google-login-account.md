# Phase 8 — Google Login & Account UX

## Objective

Giảm rào cản (friction) khi đăng ký tài khoản, tối ưu trải nghiệm onboarding và hoàn thiện phân hệ quản lý tài khoản người dùng trước khi public launch.

> [!IMPORTANT]
> **Quy tắc phân tách bảo mật:**
> Google Login là phương thức định danh người dùng vào hệ thống của ứng dụng. Notion OAuth là flow kết nối và phân quyền truy cập workspace riêng biệt. Tuyệt đối không gộp hoặc gắn cứng hai quyền này vào nhau.

**Status:** ⏳ Planned (P1 — Trước Public Launch)

---

## Epic P8-E1 — Google OAuth Integration

Triển khai đăng nhập và đăng ký 1-click thông qua tài khoản Google.

- [ ] **Task P8-E1-T1 — Thiết lập Google OAuth Console:**
  - Tạo OAuth 2.0 Client ID trên Google Cloud Console.
  - Cấu hình Authorized Javascript Origins và Authorized Redirect URIs cho môi trường dev và production.
- [ ] **Task P8-E1-T2 — Cập nhật Database Schema (Prisma):**
  - Hỗ trợ user đăng nhập Google (ví dụ: trường `googleId`, cho phép `passwordHash` nullable khi đăng ký qua mạng xã hội).
- [ ] **Task P8-E1-T3 — Backend Google Auth Flow:**
  - `GET /api/auth/google`: Tạo redirect URL đến Google OAuth consent screen với state chống CSRF.
  - `GET /api/auth/google/callback`: Trao đổi auth code, lấy Google Profile (id, email, name, avatar), cấp cookie session.
- [ ] **Task P8-E1-T4 — Xử lý Account Linking & Email đã tồn tại:**
  - Nếu email đã đăng ký bằng email/password: tự động liên kết tài khoản nếu xác thực Google email đã verified, hoặc yêu cầu nhập mật khẩu xác nhận tùy theo chính sách bảo mật.
  - Đảm bảo một user chỉ có một bản ghi duy nhất trong bảng `User`.
- [ ] **Task P8-E1-T5 — Trải nghiệm Google Login trên Extension:**
  - Sử dụng `chrome.identity.launchWebAuthFlow` hoặc redirect tab phụ về trang đăng nhập của Backend để người dùng đăng nhập Google liền mạch.
- [ ] **Task P8-E1-T6 — Kiểm tra Logout & Session Handling:**
  - Đảm bảo khi đăng xuất, session cookie bị hủy hoàn toàn trên cả Backend và Extension storage.

---

## Epic P8-E2 — Account Management & Settings

Cung cấp giao diện rõ ràng để người dùng xem thông tin cá nhân và kiểm soát kết nối Notion.

- [ ] **Task P8-E2-T1 — Xây dựng màn hình Account Settings:**
  - Màn hình cấu hình trong extension popup hoặc trang web settings riêng biệt.
- [ ] **Task P8-E2-T2 — Hiển thị User Profile:**
  - Hiển thị email người dùng, avatar (nếu dùng Google), ngày tham gia và gói dịch vụ (FREE / BETA).
- [ ] **Task P8-E2-T3 — Quản lý kết nối Notion:**
  - Hiển thị workspace Notion đang kết nối (`workspaceId` / tên workspace).
  - Hiển thị database đang được chọn lưu trữ highlight.
- [ ] **Task P8-E2-T4 — Tùy chọn Disconnect Notion:**
  - Nút ngắt kết nối Notion an toàn (`DELETE /api/notion/connection`), xóa token đã mã hóa khỏi database.
- [ ] **Task P8-E2-T5 — Tùy chọn thay đổi Database đích:**
  - Cho phép người dùng chuyển đổi sang một database Notion khác mà không cần reconnect lại toàn bộ OAuth.
- [ ] **Task P8-E2-T6 — Tùy chọn Xóa tài khoản (Delete Account - GDPR Compliance):**
  - `DELETE /api/auth/account`: Xóa toàn bộ dữ liệu người dùng (User, NotionConnection, Sources, Highlights, SyncLogs) theo yêu cầu bảo vệ quyền riêng tư của người dùng.

---

## Definition of Done (Phase 8)

1. Người dùng có thể đăng ký và đăng nhập mượt mà bằng cả Email/Password hoặc Google 1-click.
2. Quản lý trạng thái đăng nhập, đổi database, disconnect Notion và logout hoạt động ổn định trên cả web và extension.
3. Cơ chế xóa tài khoản hoạt động triệt để (cascade delete sạch dữ liệu).
4. Các test suite auth và regression test chạy thành công.
