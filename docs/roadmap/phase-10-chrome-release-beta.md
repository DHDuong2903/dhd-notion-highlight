# Phase 10 — Chrome Web Store Release & Closed Beta

## Objective

Đóng gói, đăng tải extension lên Chrome Web Store, vượt qua quy trình kiểm duyệt của Google và khởi động chương trình Closed Beta với 5–10 người dùng thật để kiểm tra toàn bộ luồng giá trị trong môi trường thực tế.

**Status:** ⏳ Planned (P0 — Release Gate)

---

## Epic P10-E1 — Chrome Web Store Preparation & Submission

Chuẩn bị đầy đủ tài nguyên hình ảnh, mô tả sản phẩm và giải trình quyền riêng tư để submit lên Chrome Web Store Developer Dashboard.

- [ ] **Task P10-E1-T1 — Đóng gói Extension Production Bundle:**
  - Chạy `pnpm --filter @notion-highlight/extension build`.
  - Tạo file ZIP sạch không chứa source map dev hoặc file rác.
- [ ] **Task P10-E1-T2 — Soạn thảo Store Listing (Tên & Mô tả):**
  - Tên ngắn gọn, rõ ràng (dưới 45 ký tự).
  - Mô tả chi tiết (Detailed Description) nêu bật tính năng tự động gom nhóm highlight theo URL bài viết gốc vào Notion.
- [ ] **Task P10-E1-T3 — Thiết kế Screenshots chất lượng cao:**
  - Chuẩn bị tối thiểu 4-5 ảnh chụp màn hình kích thước chuẩn 1280x800 px:
    1. Thao tác bôi đen chữ trên web và menu chuột phải.
    2. Popup hiển thị trạng thái kết nối Notion & chọn database.
    3. Trang Notion hiển thị các trích dẫn đã được tự động gom nhóm ngăn nắp.
    4. Toast thông báo tiện lợi kèm nút mở ngay Notion.
- [ ] **Task P10-E1-T4 — Thiết kế Promotional Tiles:**
  - Small promo tile: 440x280 px.
  - Marquee promo tile: 1400x560 px (tùy chọn cho featured placement).
- [ ] **Task P10-E1-T5 — Kê khai Quyền riêng tư (Privacy Practices):**
  - Giải trình mục đích duy nhất (Single Purpose description): _"Lưu đoạn văn bản được người dùng bôi đen vào Notion workspace cá nhân."_
  - Giải trình từng quyền:
    - `contextMenus`: Tạo menu chuột phải khi người dùng bôi đen văn bản.
    - `storage`: Lưu trạng thái cấu hình cục bộ và thông tin phiên làm việc.
    - `notifications`: Báo cho người dùng biết khi highlight đã được lưu thành công vào Notion.
    - `activeTab`: Lấy tiêu đề và URL của trang web đang đọc để gán nguồn cho highlight.
- [ ] **Task P10-E1-T6 — Kiểm tra Tuân thủ Chính sách CWS:**
  - Đảm bảo không chứa mã độc, không dùng remote code (tuân thủ nghiêm ngặt Manifest V3).
- [ ] **Task P10-E1-T7 — Submit Extension xét duyệt:**
  - Đăng ký tài khoản Chrome Web Store Developer, nộp phí đăng ký nếu chưa có.
  - Tải file ZIP lên và gửi kiểm duyệt (Review process).

---

## Epic P10-E2 — Release Smoke Testing & Production Validation

Kiểm tra trực tiếp bản cài đặt tải về từ Chrome Web Store trên một máy tính / trình duyệt sạch để đảm bảo không có sự khác biệt giữa môi trường dev và production.

- [ ] **Task P10-E2-T1 — Cài đặt từ CWS link trên Chrome profile hoàn toàn mới:**
  - Đảm bảo extension cài đặt thành công, icon xuất hiện trên thanh toolbar.
- [ ] **Task P10-E2-T2 — Đăng ký tài khoản mới tinh:**
  - Xác nhận luồng đăng ký tài khoản hoạt động với Backend Production.
- [ ] **Task P10-E2-T3 — Thực hiện liên kết Notion OAuth:**
  - Xác nhận redirect sang Notion authorization screen và quay lại extension thành công.
- [ ] **Task P10-E2-T4 — Tạo database hoặc chọn database có sẵn:**
  - Kiểm tra tính năng tự động tạo database "Web Highlights" hoặc chọn database Notion hiện hữu.
- [ ] **Task P10-E2-T5 — Thực hiện luồng lưu Highlight:**
  - Bôi đen text trên bài báo mạng -> Lưu qua chuột phải -> Kiểm tra block trích dẫn xuất hiện chính xác trên Notion page.
- [ ] **Task P10-E2-T6 — Kiểm tra tính năng gom nhóm:**
  - Bôi đen tiếp đoạn text thứ hai trên cùng bài báo -> Xác nhận đoạn thứ hai được nối thêm vào cùng page Notion thay vì tạo page mới.
- [ ] **Task P10-E2-T7 — Kiểm tra Telemetry & Error Monitoring:**
  - Xác nhận PostHog và Sentry ghi nhận sự kiện/session từ extension thật mà không có lỗi ngầm.

---

## Epic P10-E3 — Closed Beta Execution

Triển khai chương trình thử nghiệm có kiểm soát với người dùng thật.

- [ ] **Task P10-E3-T1 — Mời nhóm Beta Tester đầu tiên (5–10 người dùng):**
  - Gửi email mời nhóm đăng ký từ danh sách Waitlist (Phase 7) kèm link cài đặt extension.
- [ ] **Task P10-E3-T2 — Theo dõi hành trình Onboarding:**
  - Quan sát tỷ lệ hoàn tất onboarding thông qua PostHog Funnel.
  - Nhận diện ngay những bước mà người dùng bị vướng (drop-off).
- [ ] **Task P10-E3-T3 — Tiếp nhận & Phân loại phản hồi:**
  - Phân nhóm: Lỗi nghiêm trọng (Blocker/Bug), Đề xuất cải tiến UX (Usability), Mong muốn tính năng mới (Feature Request).
- [ ] **Task P10-E3-T4 — Fix Blocker & Cập nhật phiên bản vá lỗi (Hotfix):**
  - Nhanh chóng xử lý các sự cố về mạng hoặc tương thích Notion API nếu có.
- [ ] **Task P10-E3-T5 — Đánh giá mức độ hài lòng:**
  - Đo lường xem người dùng có tiếp tục sử dụng extension sau ngày thứ 3, thứ 7 (Day-3 & Day-7 Retention).

---

## Điều kiện tiên quyết để Submit Extension (Checklist)

- [x] Backend & Database production hoạt động 100% với HTTPS.
- [x] Extension manifest không chứa quyền thừa hoặc script ngoài.
- [x] Không lưu bất kỳ Notion secret hay API key nào trong extension bundle.
- [x] Chính sách quyền riêng tư (Privacy Policy) có URL truy cập công khai.
- [x] Không có lỗi blocker trong core workflow (bôi đen -> chuột phải -> lưu vào Notion).

---

## Definition of Done (Phase 10)

1. Extension chính thức được Google Chrome Web Store phê duyệt và phát hành.
2. Tối thiểu 5–10 người dùng thật hoàn thành trọn vẹn luồng lưu highlight đầu tiên.
3. Toàn bộ funnel và lỗi được ghi nhận tự động vào dashboard Analytics & Sentry.
