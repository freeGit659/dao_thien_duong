# 🤝 QUY CHẾ LÀM VIỆC & PHÂN QUYỀN (ROLES & WORKFLOW)

## 1. PHÂN QUYỀN ANTIGRAVITY TRONG PROJECT
- **Phạm vi quyền hạn:** **FULL QUYỀN** trong toàn bộ workspace `e:\data\unity\DaoThienDuong` (tạo thư mục, tạo script template, cập nhật tài liệu, tối ưu asset setting, thiết lập git).
- **Trách nhiệm bảo vệ:** Antigravity luôn commit/backup trước khi thực hiện các thay đổi lớn về refactor code hoặc cấu trúc folder để Sếp luôn an tâm 100%.

---

## 2. QUY TRÌNH PHỐI HỢP: SẾP CODE CHÍNH - TECH LEAD HỖ TRỢ TOÀN DIỆN

Để Sếp vừa nâng cao tay nghề lập trình game, vừa nắm rõ toàn bộ logic mà không bị ngợp:

```mermaid
flowchart LR
    A["1. Tech Lead (Antigravity)<br/>Thiết kế Spec & Task Checklist"] --> B["2. Sếp (Fresher Dev)<br/>Đọc hiểu & Viết Code"]
    B --> C["3. Tech Lead (Antigravity)<br/>Review, Góp ý, Sửa Bug"]
    C --> D["4. Sếp & Tech Lead<br/>Test Gameplay & Git Commit"]
```

### Chi tiết 4 bước:
1. **Bước 1 (Tech Lead chuẩn bị):** 
   - Antigravity sẽ viết tài liệu đặc tả tính năng (`Feature Spec`), tạo các **Interface / Data Model / Skeleton Script** với các hàm rỗng và comment `// TODO: Sếp code logic ở đây`.
   - Cung cấp checklist các bước triển khai trực quan, dễ hiểu kèm giải thích tại sao làm như vậy.
2. **Bước 2 (Sếp viết code):** 
   - Sếp mở file C# lên và viết logic theo hướng dẫn. Nếu gặp vướng mắc ở thuật toán nào (ví dụ: cách tính góc xoay camera khi đổi màn hình dọc/ngang, cơ chế kéo cá cắn câu), Sếp chỉ cần hỏi ngay.
3. **Bước 3 (Tech Lead Review & Đồng hành):** 
   - Antigravity đọc code của Sếp, chỉ ra chỗ tối ưu (tránh rác GC Alloc, tối ưu `Update()`, chuẩn WebGL), giải thích cặn kẽ để Sếp lên trình.
4. **Bước 4 (Đóng gói & Commit):** 
   - Sau khi test ngon nghẻ trên Unity Editor, Antigravity hỗ trợ Sếp ghi git commit log sạch đẹp theo chuẩn Conventional Commits.

---

## 3. NGUYÊN TẮC TỐI ƯU CONTEXT (TRÁNH ĐỌC LẶP FILE)
1. **Luôn tra cứu qua [INDEX.md](file:///e:/data/unity/DaoThienDuong/_Antigravity/INDEX.md)**: File này giữ trạng thái cốt lõi và link tới mọi thành phần.
2. **Mỗi tính năng là một Task Sheet độc lập** trong thư mục `_Antigravity/Features/`. Khi code tính năng nào, chỉ cần đọc đúng task sheet đó.
3. **Mã nguồn phân tầng rõ ràng (Modular Separation)**:
   - `Scripts/Core/` : Framework dùng chung.
   - `Scripts/Features/<TênFeature>/` : Tách biệt logic từng tính năng.
   - `Scripts/UI/` : Giao diện người dùng.
