# Phase 9 — Production Readiness

## Objective

Chuyển giao toàn bộ hệ thống từ môi trường local/dev sang môi trường Production an toàn, có khả năng mở rộng, bảo mật cao và sẵn sàng vận hành ổn định phục vụ người dùng thật.

**Status:** ⏳ Planned (P0 — Bắt buộc trước Release)

---

## Epic P9-E1 — Production Infrastructure & Environment

Thiết lập hạ tầng cloud, domain, HTTPS và cấu hình cơ sở dữ liệu production.

- [ ] **Task P9-E1-T1 — Triển khai Production Backend:**
  - Lựa chọn nền tảng host: Railway, Render, Fly.io hoặc AWS/VPS.
  - Cấu hình quy trình build và khởi chạy Fastify server (`npm run build`, `npm run start`).
- [ ] **Task P9-E1-T2 — Khởi tạo Production Database:**
  - Thiết lập Managed PostgreSQL (Neon, Supabase, Railway Postgres, hoặc AWS RDS).
  - Cấu hình Connection Pooling (PgBouncer hoặc Prisma Accelerate) để xử lý lượng kết nối lớn.
- [ ] **Task P9-E1-T3 — Cấu hình Domain & Chứng chỉ SSL/HTTPS:**
  - Trỏ DNS custom domain cho Backend API (ví dụ: `api.notionhighlight.com`).
  - Kích hoạt HTTPS bắt buộc thông qua Cloudflare hoặc Let's Encrypt.
- [ ] **Task P9-E1-T4 — Quản lý Environment Variables bảo mật:**
  - Cung cấp đầy đủ biến môi trường production:
    - `DATABASE_URL` (SSL enabled)
    - `COOKIE_SECRET`, `ENCRYPTION_KEY` (32-byte hex an toàn)
    - `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, `NOTION_REDIRECT_URI`
    - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (nếu dùng Phase 8)
    - `SENTRY_DSN`, `POSTHOG_API_KEY`
- [ ] **Task P9-E1-T5 — Cập nhật Production OAuth Callback URLs:**
  - Cập nhật Redirect URI trên Notion Developers Integration portal và Google Cloud Console sang URL production chính thức.
- [ ] **Task P9-E1-T6 — Chạy Database Migrations:**
  - Thực thi Prisma migrations trên DB production (`prisma migrate deploy`).
- [ ] **Task P9-E1-T7 — Thiết lập Automated Backup & Disaster Recovery:**
  - Kích hoạt tính năng sao lưu hàng ngày (Daily automated backups) cho cơ sở dữ liệu.

---

## Epic P9-E2 — Comprehensive Security Review

Đảm bảo sản phẩm tuân thủ nghiêm ngặt các tiêu chuẩn an toàn thông tin và bảo vệ quyền riêng tư.

- [ ] **Task P9-E2-T1 — Review Authentication & Session:**
  - Cấu hình cookie production: `secure: true`, `httpOnly: true`, `sameSite: 'lax'`, `domain: '.notionhighlight.com'`.
- [ ] **Task P9-E2-T2 — Kiểm tra Tenant Isolation (Cách ly dữ liệu):**
  - Đảm bảo mọi truy vấn `Highlight`, `Source`, `NotionConnection` đều có điều kiện `userId: session.userId`. User A tuyệt đối không thể xem, sửa hoặc xóa dữ liệu của User B.
- [ ] **Task P9-E2-T3 — Kiểm toán lưu trữ Notion Token:**
  - Xác nhận token Notion luôn được mã hóa đối xứng AES-256-GCM trước khi ghi vào database và chỉ giải mã trên bộ nhớ RAM khi gọi Notion API.
  - Tuyệt đối không trả về token trong bất kỳ endpoint API nào.
- [ ] **Task P9-E2-T4 — Input Validation & Payload Size Limits:**
  - Xác thực nghiêm ngặt mọi body request bằng Zod.
  - Giới hạn kích thước payload (JSON body < 100KB, độ dài text highlight < 10,000 ký tự).
- [ ] **Task P9-E2-T5 — API Rate Limiting & Anti-Abuse:**
  - Tích hợp `@fastify/rate-limit` để chống brute-force đăng nhập và spam lưu highlight.
- [ ] **Task P9-E2-T6 — Tối giản quyền hạn Extension (Least Privilege):**
  - Rà soát `manifest.json`: chỉ xin quyền tối thiểu (`contextMenus`, `storage`, `notifications`, `activeTab`).
  - Tránh xin `host_permissions: ["<all_urls>"]` nếu không bắt buộc, bảo đảm đáp ứng tiêu chí duyệt nhanh của Chrome Web Store.
- [ ] **Task P9-E2-T7 — Zero Secret Leakage:**
  - Kiểm tra toàn bộ source code frontend/extension đảm bảo không chứa bất kỳ secret, API key riêng tư nào.

---

## Epic P9-E3 — Operational Readiness & Monitoring

Chuẩn bị các công cụ và quy trình để theo dõi và xử lý sự cố trong vận hành thực tế.

- [ ] **Task P9-E3-T1 — Health Check chi tiết:**
  - Cải tiến `GET /api/health` kiểm tra thêm kết nối DB và thời gian phản hồi (latency).
- [ ] **Task P9-E3-T2 — Giám sát & Báo động (Alerting):**
  - Kích hoạt cảnh báo Sentry qua Slack / Email khi phát sinh unhandled exception hoặc lỗi server 5xx.
- [ ] **Task P9-E3-T3 — Cấu hình Logging Production:**
  - Sử dụng Pino với định dạng JSON chuẩn hóa, loại trừ các trường nhạy cảm trong logs.
- [ ] **Task P9-E3-T4 — Xử lý lỗi đồng bộ Notion không gián đoạn:**
  - Khi token Notion bị hết hạn hoặc người dùng thu hồi quyền trên Notion, trả về mã lỗi rõ ràng và hướng dẫn người dùng kết nối lại một cách thân thiện.
- [ ] **Task P9-E3-T5 — Quy trình Rollback & Hotfix:**
  - Thiết lập tài liệu quy trình khôi phục phiên bản trước khi bản deploy gặp lỗi nghiêm trọng.
- [ ] **Task P9-E3-T6 — Kênh hỗ trợ người dùng:**
  - Thiết lập email tiếp nhận khiếu nại hoặc lỗi kỹ thuật (`support@notionhighlight.com`).

---

## Epic P9-E4 — Legal & Privacy Compliance

Hoàn thiện các văn bản pháp lý bắt buộc trước khi đưa sản phẩm lên chợ ứng dụng và thu hút người dùng quốc tế.

- [ ] **Task P9-E4-T1 — Soạn thảo Privacy Policy:**
  - Nêu rõ dữ liệu được lưu: email, ID người dùng, URL bài viết, ngày lưu, độ dài trích dẫn.
  - Cam kết không chia sẻ dữ liệu cho bên thứ ba, không bán dữ liệu người dùng.
- [ ] **Task P9-E4-T2 — Soạn thảo Terms of Service:**
  - Điều khoản sử dụng, quyền sở hữu trí tuệ, phạm vi miễn trừ trách nhiệm khi dịch vụ Notion gặp sự cố.
- [ ] **Task P9-E4-T3 — Minh bạch dữ liệu gửi sang Notion:**
  - Giải thích rõ ràng extension chỉ ghi nội dung trích dẫn vào database do người dùng tự tay lựa chọn trên Notion.
- [ ] **Task P9-E4-T4 — Quy trình xóa dữ liệu (GDPR Compliance):**
  - Hướng dẫn và cung cấp tính năng xóa tài khoản và xóa sạch dữ liệu khỏi server khi người dùng yêu cầu.

---

## Definition of Done (Phase 9)

1. Backend, Database và Domain Production chạy ổn định với HTTPS.
2. Kiểm tra bảo mật hoàn tất (không rò rỉ secret, phân quyền cách ly triệt để giữa các user).
3. Đầy đủ hệ thống giám sát (Health check, Sentry alerts, logging).
4. Trang Privacy Policy & Terms of Service được công khai trên website.

