# Phase 7 — Landing Page & Product Validation

## Objective

Chuẩn bị kênh giới thiệu sản phẩm chính thức, thu hút người dùng tiềm năng, tạo phễu thu thập danh sách chờ (Waitlist) và kiểm chứng nhu cầu thị trường trước khi phát hành rộng rãi.

**Status:** ⏳ Planned (P0 — Trước Beta)

---

## Epic P7-E1 — Product Positioning

Xác lập rõ ràng định vị và thông điệp cốt lõi của sản phẩm để truyền thông nhất quán trên website, Chrome Web Store và các cộng đồng.

- [ ] **Task P7-E1-T1 — Định danh thương hiệu & Tên sản phẩm:**
  - Chốt tên thương mại (VD: _Notion Highlight Sync_, _NotionMark_, _ClipToNotion_).
- [ ] **Task P7-E1-T2 — Đăng ký Domain chính thức:**
  - Lựa chọn tên miền phù hợp (.app, .io, .so hoặc .com).
- [ ] **Task P7-E1-T3 — Xây dựng Value Proposition:**
  - Tuyên ngôn giá trị cốt lõi: _"Lưu highlight từ web trực tiếp vào Notion chỉ với 1 cú click chuột — Tự động gom nhóm các trích dẫn cùng bài viết vào chung một trang duy nhất mà không làm rác workspace."_
- [ ] **Task P7-E1-T4 — Phân khúc Target User:**
  - Người làm nghiên cứu (Researchers), sinh viên, content creators, kiến thức viên (PKM practitioners) đang dùng Notion làm "Bộ não thứ hai" (Second Brain).
- [ ] **Task P7-E1-T5 — Tuyên bố vấn đề cần giải quyết (Problem Statement):**
  - Các công cụ Web Clipper thông thường lưu toàn bộ cả trang web gây nặng nề, khó đọc lại; hoặc lưu từng dòng bôi đen thành từng page rời rạc khiến database Notion bị phân mảnh.
- [ ] **Task P7-E1-T6 — Định vị điểm khác biệt (Differentiators):**
  - **Tự động gom nhóm thông minh theo URL bài viết gốc**: Bôi đen 10 đoạn trên cùng 1 trang web thì cả 10 đoạn đều nằm trong 1 trang Notion duy nhất.
  - **Bảo toàn ngữ cảnh**: Tự động lưu tiêu đề, URL gốc, ngày tháng đọc.
  - **Nhẹ, nhanh, không làm chậm trình duyệt**.

---

## Epic P7-E2 — Landing Page Development

Xây dựng một website tĩnh hoặc Next.js/Astro/Vite đơn giản, tối ưu tốc độ tải trang, chuẩn SEO và có tracking đo lường chuyển đổi.

- [ ] **Task P7-E2-T1 — Hero Section:**
  - Tiêu đề bắt mắt, mô tả súc tích, nút kêu gọi hành động (CTA: _"Tham gia Closed Beta"_ hoặc _"Cài đặt Extension"_).
- [ ] **Task P7-E2-T2 — Trình diễn Core Workflow:**
  - Trực quan hóa 3 bước trải nghiệm đơn giản:
    1. Bôi đen đoạn text tâm đắc trên bất kỳ trang web nào.
    2. Click chuột phải chọn _"Save to Notion"_.
    3. Mở Notion xem toàn bộ highlight đã được gom nhóm ngăn nắp.
- [ ] **Task P7-E2-T3 — Visual Showcase (Screenshot & GIF Demo):**
  - Đặt ảnh động GIF hoặc video ngắn quay màn hình thao tác lưu highlight thực tế.
- [ ] **Task P7-E2-T4 — Form CTA & Beta Waitlist:**
  - Ô nhập email đăng ký nhận lời mời tham gia Closed Beta sớm.
- [ ] **Task P7-E2-T5 — Section FAQ (Câu hỏi thường gặp):**
  - Trả lời các băn khoăn: Dữ liệu lưu ở đâu? Có an toàn không? Có miễn phí không? Notion cần cấp quyền gì?
- [ ] **Task P7-E2-T6 — Trang Privacy Policy & Terms:**
  - Trang tĩnh công khai chính sách xử lý dữ liệu để đạt điều kiện xét duyệt của Google và Chrome Web Store.
- [ ] **Task P7-E2-T7 — Footer & Kênh liên hệ:**
  - Link Discord/Twitter/X, email hỗ trợ, link GitHub hoặc feedback.

---

## Epic P7-E3 — User Demand Validation & Waitlist Survey

Thu thập dữ liệu thực tế về mong muốn của người dùng để định hướng lộ trình sau beta.

- [ ] **Task P7-E3-T1 — Thiết lập Form khảo sát nhu cầu (Survey):**
  - Nhúng Typeform / Tally / Google Form hoặc form tích hợp trực tiếp sau khi user để lại email:
    - _Bạn đang dùng công cụ nào để lưu nội dung web?_ (Pocket, Omnivore, Raindrop, Notion Web Clipper...)
    - _Bạn có sử dụng Notion làm nơi quản lý kiến thức chính không?_
    - _Bạn muốn kết nối thêm nền tảng nào ngoài Notion?_ (Obsidian, Readwise, Google Docs, Logseq...)
    - _Bạn có sẵn sàng trả phí cho công cụ này nếu nó giúp bạn tiết kiệm thời gian không? Mức giá kỳ vọng ($2-$5/tháng)?_
- [ ] **Task P7-E3-T2 — Khảo sát nhu cầu đa nền tảng:**
  - Đánh giá tỷ lệ người dùng muốn xuất sang Obsidian/Markdown so với Notion thuần túy.
- [ ] **Task P7-E3-T3 — Thu thập yêu cầu tính năng mở rộng:**
  - Ghi nhận mức độ quan tâm đối với: AI tóm tắt highlight, Highlight trên file PDF, Highlight đổi màu, Tagging.
- [ ] **Task P7-E3-T4 — Quản lý danh sách Beta Waitlist:**
  - Lưu email đăng ký vào cơ sở dữ liệu hoặc dịch vụ email marketing (Resend/Loops/Mailchimp).
- [ ] **Task P7-E3-T5 — Đo lường tỷ lệ chuyển đổi Landing Page (Conversion Rate):**
  - Gắn PostHog tracking lượt xem trang, tỷ lệ click CTA, tỷ lệ hoàn tất form đăng ký beta.

---

## Epic P7-E4 — Marketing Preparation

Chuẩn bị sẵn nội dung truyền thông cho ngày ra mắt thử nghiệm.

- [ ] **Task P7-E4-T1 — Chuẩn bị Demo Video ngắn (30-60s):**
  - Video chất lượng cao minh họa sự tiện lợi và tốc độ của extension.
- [ ] **Task P7-E4-T2 — Soạn thảo bài đăng cho các cộng đồng:**
  - Viết bài chia sẻ giá trị thực (không spam) cho Reddit (`r/Notion`, `r/productivity`, `r/PKMS`), Twitter/X và các nhóm Notion tại Việt Nam / Quốc tế.
- [ ] **Task P7-E4-T3 — Hướng dẫn cài đặt & onboarding:**
  - Tài liệu trực quan từng bước giúp beta tester cài đặt và cấp quyền Notion dễ dàng.
- [ ] **Task P7-E4-T4 — Thiết lập kênh trao đổi với Tester:**
  - Nhóm Telegram, Discord hoặc kênh hỗ trợ trực tiếp.

---

## Definition of Done (Phase 7)

1. Landing page hoạt động trên domain chính thức với chứng chỉ HTTPS.
2. Có form thu thập email waitlist và khảo sát nhu cầu.
3. Toàn bộ conversion funnel trên landing page được theo dõi bằng Analytics (Phase 6).
4. Có tài liệu Privacy Policy và Terms of Service công khai trên web.
