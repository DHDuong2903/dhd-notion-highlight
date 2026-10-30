# Phase 11 — Post-Beta Product Decisions & Strategy

## Objective

Phân tích số liệu định lượng (funnel, retention, usage) và phản hồi định tính từ đợt Closed Beta để đưa ra các quyết định chiến lược: xây dựng mô hình giá (Monetization), định mức gói miễn phí (Free Quota), và lựa chọn các tính năng / nền tảng tiếp theo để mở rộng.

> [!IMPORTANT]
> **Nguyên tắc cốt lõi:**
> Không lập trình các tính năng trả phí hay tích hợp nền tảng mới trước khi có dữ liệu từ Phase 10. Mọi quyết định trong Phase 11 phải được thúc đẩy bởi hành vi thực tế của người dùng thay vì giả định chủ quan.

**Status:** ⏳ Planned (P1 — Sau Beta)

---

## Epic P11-E1 — Quantitative & Qualitative Beta Analysis

Đánh giá toàn diện kết quả thử nghiệm để hiểu rõ sản phẩm đang giải quyết vấn đề tốt ở đâu và người dùng gặp trở ngại ở đâu.

- [ ] **Task P11-E1-T1 — Phân tích Activation Funnel:**
  - Đo tỷ lệ chuyển đổi từ cài đặt -> kết nối Notion -> lưu highlight đầu tiên.
  - Xác định tỷ lệ rớt (drop-off) lớn nhất xảy ra ở khâu nào để tối ưu onboarding.
- [ ] **Task P11-E1-T2 — Phân tích Retention & Stickiness:**
  - Đo lường Day-1, Day-7 và Day-14 Retention.
  - Người dùng có quay lại sử dụng extension khi đọc tài liệu hàng ngày không?
- [ ] **Task P11-E1-T3 — Phân tích tần suất sử dụng (Highlight Usage Distribution):**
  - Thống kê tỷ lệ người dùng:
    - Casual user: 1–10 highlights/tháng.
    - Power user: 50–200+ highlights/tháng.
- [ ] **Task P11-E1-T4 — Đánh giá tỷ lệ lỗi đồng bộ (Sync Failure Rate):**
  - Đảm bảo tỷ lệ lỗi đồng bộ dưới 1% trên môi trường thực tế.
- [ ] **Task P11-E1-T5 — Tổng hợp & Xếp hạng Feature Requests:**
  - Tổng hợp danh sách tính năng được đề xuất nhiều nhất từ cộng đồng tester.

---

## Epic P11-E2 — Monetization & Quota Strategy

Xác định mô hình kinh doanh dựa trên dữ liệu sử dụng thực tế.

- [ ] **Task P11-E2-T1 — Xác định Free Quota hợp lý:**
  - Thiết lập ngưỡng miễn phí đủ để người dùng trải nghiệm trọn vẹn giá trị nhưng khuyến khích power user nâng cấp (ví dụ: 30–50 highlights/tháng hoặc 5 bài viết/tháng).
- [ ] **Task P11-E2-T2 — Phân loại tính năng Pro / Paid:**
  - Các tính năng tiềm năng dành cho gói trả phí:
    - Lưu không giới hạn (Unlimited Highlights).
    - Hỗ trợ nhiều Notion databases cho từng mục đích (Work, Study, Personal).
    - Tự động gắn tag và ghi chú cá nhân (Notes & Tags).
    - Tóm tắt bằng AI (AI Summary / Key Takeaways).
- [ ] **Task P11-E2-T3 — Khảo sát mức độ sẵn sàng trả tiền (Willingness to Pay):**
  - Phỏng vấn 5–10 power user về mức giá hợp lý ($2.99/tháng hoặc $29/năm hoặc Lifetime Deal $39).
- [ ] **Task P11-E2-T4 — Quyết định tích hợp Payment Gateway:**
  - Lựa chọn nhà cung cấp thanh toán thân thiện với SaaS quốc tế (Stripe, Lemon Squeezy, hoặc Polar).

---

## Epic P11-E3 — Integration & Feature Roadmap Prioritization

Định hình lộ trình mở rộng sau khi đã làm chủ luồng Notion.

- [ ] **Task P11-E3-T1 — Khảo sát nền tảng điểm đến tiếp theo (Next Destination):**
  - Đánh giá nhu cầu:
    - **Obsidian**: Xuất file Markdown trực tiếp vào Local Vault.
    - **Readwise**: Đồng bộ highlights vào hệ sinh thái Readwise.
    - **Google Docs / Apple Notes**: Lưu trữ văn bản thông dụng.
- [ ] **Task P11-E3-T2 — Đánh giá Effort & API Feasibility:**
  - Ước tính thời gian và độ phức tạp kỹ thuật để hỗ trợ nền tảng mới.
- [ ] **Task P11-E3-T3 — Quyết định tính năng AI (AI Assistant):**
  - Xem xét có nên thêm AI hay không (AI tóm tắt đoạn trích, tự động sinh thẻ tag, phát hiện chủ đề).
- [ ] **Task P11-E3-T4 — Đánh giá nhu cầu bôi đen trên file PDF:**
  - Nghiên cứu cơ chế bắt highlight trên Chrome PDF Viewer.

---

## Bảng quyết định chiến lược (Decision Matrix)

| Vấn đề cần quyết định    | Tín hiệu từ Beta                   | Hướng giải quyết đề xuất                 |
| ------------------------ | ---------------------------------- | ---------------------------------------- |
| **Giới hạn Free Plan**   | >70% user lưu <30 highlights/tháng | Đặt free limit ở mức 40 highlights/tháng |
| **Giá gói Pro**          | User phản hồi giá $2-$4 hợp lý     | Bắt đầu với $2.99/tháng hoặc $29/năm     |
| **Obsidian Integration** | >30% survey yêu cầu xuất Markdown  | Ưu tiên xây dựng Local Vault sync        |
| **Tính năng AI**         | User cần tóm tắt nhanh             | Đưa vào gói Pro có giới hạn credit AI    |
| **PDF Support**          | Sinh viên / Researcher yêu cầu cao | Nghiên cứu tích hợp PDF.js               |

---

## Definition of Done (Phase 11)

1. Báo cáo tổng kết dữ liệu Closed Beta hoàn tất (Funnel, Retention, Lỗi).
2. Quyết định rõ ràng về hạn mức Free Plan và chính sách giá Pro Plan.
3. Roadmap kỹ thuật cho chu kỳ phát triển tiếp theo (Next Quarter) được phê duyệt dựa trên nhu cầu người dùng.
