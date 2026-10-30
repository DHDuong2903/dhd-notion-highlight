# Phase 6 — Analytics & Error Tracking Foundation

## Objective

Theo dõi hành vi người dùng, luồng kích hoạt (activation funnel), lỗi vận hành (error tracking) và bảo vệ quyền riêng tư mà không làm rò rỉ dữ liệu nhạy cảm.

> [!NOTE]
> **Định hướng triển khai Feedback:**
> Phân hệ Feedback (form góp ý trong app/extension) được tạm hoãn (deferred) và chỉ triển khai sau khi hệ thống đã vận hành ổn định trên môi trường Production một thời gian nhằm tránh tạo độ phức tạp khi chưa có lưu lượng người dùng thực tế.

**Status:** ✅ Completed (Epics P6-E1, P6-E2, P6-E3 hoàn thành; Epic P6-E4 tạm hoãn đến sau Production)

---

## Epic P6-E1 — Product Analytics

Mục tiêu: Biết người dùng đến từ đâu, tỷ lệ hoàn tất onboarding, cách họ sử dụng extension và tần suất lưu highlight.

- [x] **Task P6-E1-T1 — Chọn & thiết lập Analytics Provider:**
  - Khuyến nghị: PostHog (hỗ trợ cả client-side Chrome Extension và backend Node.js).
  - Cấu hình provider client với cơ chế gracefully degrade (noop/mock) khi chưa cấp API key trong môi trường development hoặc test.
- [x] **Task P6-E1-T2 — Tích hợp analytics vào Backend & Extension:**
  - `apps/api`: Tích hợp telemetry client phục vụ theo dõi server-side events (`apps/api/src/lib/telemetry.ts`).
  - `apps/extension`: Tích hợp telemetry client trong popup và background service worker (`apps/extension/src/lib/telemetry.ts`).
- [x] **Task P6-E1-T3 — Định nghĩa Event Taxonomy chuẩn:**
  - Tạo `packages/shared/src/analytics/events.ts` định nghĩa kiểu dữ liệu type-safe cho toàn bộ sự kiện:
    | Event                   | Ý nghĩa                   | Thuộc tính chính (không chứa PII)                                 |
    | ----------------------- | ------------------------- | ----------------------------------------------------------------- |
    | `user_registered`       | Đăng ký thành công        | `auth_method: 'email'`                                            |
    | `user_logged_in`        | Đăng nhập thành công      | `auth_method: 'email'`                                            |
    | `notion_connected`      | Kết nối Notion thành công | `workspace_id` (hashed hoặc opaque)                               |
    | `database_selected`     | Chọn database lưu trữ     | `is_auto_created: boolean`                                        |
    | `highlight_saved`       | Lưu highlight thành công  | `is_new_source: boolean`, `domain: string`, `char_length: number` |
    | `highlight_save_failed` | Lưu highlight thất bại    | `error_code: string`, `domain: string`                            |
    | `history_opened`        | Mở danh sách lịch sử      | `items_count: number`                                             |
- [x] **Task P6-E1-T4 — Thiết lập User Identification:**
  - Định danh người dùng thông qua UUID/CUID ngẫu nhiên (`user.id`).
  - Tuyệt đối không dùng email hoặc thông tin cá nhân làm primary distinct ID nếu không có sự đồng ý.
- [x] **Task P6-E1-T5 — Thiết lập Tracking Activation Funnel:**
  - Đo lường từng bước trong phễu chuyển đổi:
    1. Cài Extension / Mở popup lần đầu
    2. Đăng ký / Đăng nhập tài khoản
    3. Kết nối OAuth Notion
    4. Chọn Notion Database
    5. Thực hiện Highlight đầu tiên (First value milestone)
- [x] **Task P6-E1-T6 — Thiết lập Retention & Usage Metrics:**
  - Đo lường DAU/WAU, số lượng highlight trung bình mỗi user theo tuần/tháng để làm cơ sở cho kế hoạch Free Quota / Paid Plan tại Phase 11.

---

## Epic P6-E2 — Error Tracking

Mục tiêu: Phát hiện sớm sự cố, lỗi Notion API và lỗi extension mà không thu thập dữ liệu nhạy cảm của người dùng.

> [!NOTE]
> **Định hướng tối ưu công cụ:**
> Không cần dùng Sentry riêng biệt. Toàn bộ exception và lỗi server/extension được hợp nhất trực tiếp vào **PostHog Error Tracking** thông qua sự kiện chuẩn `$exception` và structured logs của Fastify. Giúp quản lý tập trung toàn bộ funnel và lỗi trong 1 dashboard duy nhất mà không tăng độ phức tạp hạ tầng.

- [x] **Task P6-E2-T1 — Tích hợp Error Tracking cho Backend:**
  - Triển khai `serverErrorTracker` (`apps/api/src/lib/errorTracker.ts`) đẩy sự kiện `$exception` lên PostHog & ghi log an toàn.
  - Tích hợp hook `onError` toàn cục trên Fastify `app.ts`.
- [x] **Task P6-E2-T2 — Tích hợp Error Tracking cho Extension:**
  - Bắt lỗi runtime chưa xử lý (`window.onerror`, `window.onunhandledrejection`) trong `apps/extension/src/lib/errorTracker.ts`.
  - Ghi nhận lỗi khi lưu highlight trong background script và gửi về PostHog.
- [x] **Task P6-E2-T3 — Theo dõi lỗi Notion API:**
  - Giám sát chi tiết các mã lỗi đặc thù từ Notion API trong `NotionService`, `highlights` và `notion` routes.
- [x] **Task P6-E2-T4 — Thiết lập Error Monitoring trên PostHog:**
  - Xem và quản lý exceptions trực tiếp trên tab Error Tracking của PostHog dashboard.
- [x] **Task P6-E2-T5 — Loại bỏ Secrets & Dữ liệu Highlight khỏi Error Payload:**
  - Sử dụng hàm `scrubSensitiveData` từ `@notion-highlight/shared`:
    - Loại bỏ triệt để headers chứa Cookie, Session ID, Bearer tokens.
    - Loại bỏ nội dung text được chọn (`highlight.content`), chỉ giữ lại độ dài ký tự (`contentLength`).
    - Mask các trường `accessTokenEncrypted`, `passwordHash`, `code`.

---

## Epic P6-E3 — Privacy & Data Hygiene

Mục tiêu: Đảm bảo tuân thủ nguyên tắc tối giản dữ liệu (data minimization) và quyền riêng tư của người dùng.

- [x] **Task P6-E3-T1 — Xác định phạm vi dữ liệu analytics thu thập:**
  - Chỉ thu thập các chỉ số kỹ thuật và hành vi luồng, không thu thập nội dung nhạy cảm.
- [x] **Task P6-E3-T2 — Kiểm tra bảo vệ nội dung Highlight:**
  - Đảm bảo PostHog và Sentry không bao giờ nhận bản rõ của văn bản người dùng bôi đen (`contentLength` thay vì raw text).
- [x] **Task P6-E3-T3 — Bảo vệ Credentials & Tokens:**
  - Đảm bảo token Notion, session cookie và mật khẩu không bao giờ xuất hiện trong query params, URL logs hoặc tracking payloads (`sanitizeDomain`, `scrubSensitiveData`).
- [x] **Task P6-E3-T4 — Consent & Telemetry Opt-out Toggle:**
  - Thêm tùy chọn và giao diện trong extension popup: cho phép người dùng bật/tắt chia sẻ dữ liệu ẩn danh (Anonymous Telemetry).
- [x] **Task P6-E3-T5 — Cập nhật Privacy Disclosure:**
  - Minh bạch về dữ liệu thu thập trực tiếp trên tooltip/footer của popup extension.

---

## Epic P6-E4 — Feedback System (⏸️ Tạm hoãn đến sau Production)

> [!IMPORTANT]
> Phân hệ này được lưu trữ cấu trúc sẵn và sẽ được kích hoạt khi sản phẩm đã chạy ổn định trên Production.

- [ ] **Task P6-E4-T1 — Database Feedback Schema (Prisma):**
  - Chuẩn bị model `Feedback` (`id`, `userId`, `type`: `BUG` | `FEATURE_REQUEST` | `GENERAL`, `message`, `appVersion`, `createdAt`).
- [ ] **Task P6-E4-T2 — Feedback Submission API:**
  - `POST /api/feedback` với Zod validation schema.
- [ ] **Task P6-E4-T3 — Popup Feedback Form Component:**
  - Form gửi nhanh trong popup kèm thông tin phiên bản extension tự động.
- [ ] **Task P6-E4-T4 — Admin Feedback Viewer:**
  - Endpoint / trang quản trị đơn giản để đọc và phân loại phản hồi.

---

## Definition of Done (Phase 6)

1. Hệ thống theo dõi được đầy đủ các sự kiện trong activation funnel và usage retention.
2. Sentry bắt được lỗi ở cả Backend và Extension với cơ chế sanitization loại bỏ 100% token, mật khẩu và nội dung highlight.
3. Người dùng có quyền bật/tắt telemetry ẩn danh.
4. Mọi test suite hiện có tiếp tục pass và build không lỗi.
