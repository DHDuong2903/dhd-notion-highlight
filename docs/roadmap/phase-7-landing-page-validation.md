# Phase 7 — Landing Page & Product Validation

## Objective

Chuẩn bị kênh giới thiệu sản phẩm chính thức, thu hút người dùng tiềm năng, tạo phễu thu thập danh sách chờ (Waitlist) và kiểm chứng nhu cầu thị trường trước khi phát hành rộng rãi.

**Status:** ✅ Completed

---

## Epic P7-E1 — Product Positioning

Xác lập rõ ràng định vị và thông điệp cốt lõi của sản phẩm để truyền thông nhất quán trên website, Chrome Web Store và các cộng đồng.

- [x] **Task P7-E1-T1 — Định danh thương hiệu & Tên sản phẩm:**
  - Chốt tên thương mại: **Notion Highlight Sync**.
- [x] **Task P7-E1-T2 — Đăng ký Domain chính thức:**
  - Định hướng domain: `notionhighlight.com` hoặc `notionhighlight.app`.
- [x] **Task P7-E1-T3 — Xây dựng Value Proposition:**
  - Tuyên ngôn giá trị cốt lõi: _"Lưu highlight từ web trực tiếp vào Notion chỉ với 1 cú click chuột — Tự động gom nhóm các trích dẫn cùng bài viết vào chung một trang duy nhất mà không làm rác workspace."_
- [x] **Task P7-E1-T4 — Phân khúc Target User:**
  - Người làm nghiên cứu (Researchers), sinh viên, content creators, kiến thức viên (PKM practitioners) đang dùng Notion làm "Bộ não thứ hai" (Second Brain).
- [x] **Task P7-E1-T5 — Tuyên bố vấn đề cần giải quyết (Problem Statement):**
  - Các công cụ Web Clipper thông thường lưu toàn bộ cả trang web gây nặng nề, khó đọc lại; hoặc lưu từng dòng bôi đen thành từng page rời rạc khiến database Notion bị phân mảnh.
- [x] **Task P7-E1-T6 — Định vị điểm khác biệt (Differentiators):**
  - **Tự động gom nhóm thông minh theo URL bài viết gốc**: Bôi đen 10 đoạn trên cùng 1 trang web thì cả 10 đoạn đều nằm trong 1 trang Notion duy nhất.
  - **Bảo toàn ngữ cảnh**: Tự động lưu tiêu đề, URL gốc, ngày tháng đọc.
  - **Nhẹ, nhanh, không làm chậm trình duyệt**.

---

## Epic P7-E2 — Landing Page Development

Xây dựng một website tĩnh hoặc Next.js/Astro/Vite đơn giản, tối ưu tốc độ tải trang, chuẩn SEO và có tracking đo lường chuyển đổi.

- [x] **Task P7-E2-T1 — Hero Section:**
  - Tiêu đề bắt mắt, mô tả súc tích, badge Closed Beta, nút kêu gọi hành động (CTA: _"Join Closed Beta Waitlist"_).
- [x] **Task P7-E2-T2 — Trình diễn Core Workflow:**
  - Trực quan hóa 3 bước trải nghiệm đơn giản và tích hợp Live Simulator cho phép bấm highlight thử nghiệm thực tế.
- [x] **Task P7-E2-T3 — Visual Showcase (Interactive Live Demo):**
  - Bộ mô phỏng trình duyệt và Notion page trực quan trong `apps/web/src/components/InteractiveDemo.tsx`.
- [x] **Task P7-E2-T4 — Form CTA & Beta Waitlist:**
  - Modal `apps/web/src/components/WaitlistModal.tsx` nhập email và kết nối trực tiếp với backend `POST /api/waitlist`.
- [x] **Task P7-E2-T5 — Section FAQ (Câu hỏi thường gặp):**
  - Trả lời các băn khoăn: Dữ liệu lưu ở đâu? Có an toàn không? Có miễn phí không? Notion cần cấp quyền gì?
- [x] **Task P7-E2-T6 — Trang Privacy Policy & Terms:**
  - Hai trang đầy đủ `apps/web/src/pages/PrivacyPolicy.tsx` và `apps/web/src/pages/TermsOfService.tsx` đáp ứng điều kiện xét duyệt của Chrome Web Store.
- [x] **Task P7-E2-T7 — Footer & Kênh liên hệ:**
  - Link liên hệ `support@notionhighlight.com`, link chuyển trang Privacy và Terms.

---

## Epic P7-E3 — User Demand Validation & Waitlist Survey

Thu thập dữ liệu thực tế về mong muốn của người dùng để định hướng lộ trình sau beta.

- [x] **Task P7-E3-T1 — Thiết lập Form khảo sát nhu cầu (Survey):**
  - Form khảo sát 1 phút tích hợp ngay sau khi đăng ký email trong `WaitlistModal.tsx`:
    - _Bạn đang dùng công cụ nào để lưu nội dung web?_ (Pocket, Omnivore, Raindrop, Notion Web Clipper...)
    - _Bạn có sử dụng Notion làm nơi quản lý kiến thức chính không?_
    - _Bạn muốn kết nối thêm nền tảng nào ngoài Notion?_ (Obsidian, Readwise, Google Docs, Logseq...)
    - _Bạn có sẵn sàng trả phí cho công cụ này nếu nó giúp bạn tiết kiệm thời gian không? Mức giá kỳ vọng ($2-$5/tháng)?_
- [x] **Task P7-E3-T2 — Khảo sát nhu cầu đa nền tảng:**
  - Ghi nhận tỷ lệ tester mong muốn tích hợp Obsidian/Readwise.
- [x] **Task P7-E3-T3 — Thu thập yêu cầu tính năng mở rộng:**
  - Ghi nhận mức độ quan tâm đối với: AI tóm tắt highlight, Highlight trên file PDF, Highlight đổi màu.
- [x] **Task P7-E3-T4 — Quản lý danh sách Beta Waitlist:**
  - Lưu email và khảo sát vào bảng `WaitlistEntry` trên cơ sở dữ liệu PostgreSQL (`POST /api/waitlist`).
- [x] **Task P7-E3-T5 — Đo lường tỷ lệ chuyển đổi Landing Page (Conversion Rate):**
  - Tích hợp PostHog tracking các sự kiện: `landing_page_viewed`, `landing_cta_clicked`, `waitlist_submitted`, `survey_submitted`.

---

## Epic P7-E4 — Marketing Preparation

Chuẩn bị sẵn nội dung truyền thông cho ngày ra mắt thử nghiệm.

- [x] **Task P7-E4-T1 — Chuẩn bị Demo Simulator tương tác:**
  - Đã tích hợp trực tiếp component mô phỏng thao tác ngay trên trang chủ.
- [x] **Task P7-E4-T2 — Soạn thảo nội dung giới thiệu & bảng so sánh (Comparison Table):**
  - Bảng so sánh trực quan ưu thế gom nhóm so với web clipper truyền thống và copy thủ công.
- [x] **Task P7-E4-T3 — Hướng dẫn cài đặt & onboarding:**
  - Đã chuẩn bị trong `docs/product/beta-onboarding.md`.
- [x] **Task P7-E4-T4 — Thiết lập kênh trao đổi với Tester:**
  - Email hỗ trợ trực tiếp và kênh nhận phản hồi.

---

## Definition of Done (Phase 7)

1. Landing page hoạt động trên domain chính thức với chứng chỉ HTTPS.
2. Có form thu thập email waitlist và khảo sát nhu cầu.
3. Toàn bộ conversion funnel trên landing page được theo dõi bằng Analytics (Phase 6).
4. Có tài liệu Privacy Policy và Terms of Service công khai trên web.
