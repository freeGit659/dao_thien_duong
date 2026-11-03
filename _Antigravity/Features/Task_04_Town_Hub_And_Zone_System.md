# 📋 TASK 04: THIẾT KẾ THÀNH PHỐ TRUNG TÂM & HỆ THỐNG BIỂN CHUYỂN KHU (TOWN HUB & CHANNEL SYSTEM)

## 🎯 1. MỤC TIÊU CẦN ĐẠT ĐƯỢC
1. **Quy hoạch Thành phố nhỏ (Town Hub):**
   - **Công viên trung tâm (Central Park):** Đài phun nước nghệ thuật (`fountain`), ghế đá nghỉ chân (`bench`), đèn đường (`lamppost`), rặng cây xanh mát.
   - **Các công trình xung quanh:**
     - Toà Thị Chính (`City Hall`)
     - Tiệm Pizza & Ăn uống (`Pizzeria House`) - tiền đề cho tính năng Ăn uống nạp năng lượng (Milestone 3).
     - Quán Cafe / Giải khát (`Brewery House`)
     - Khu phố dân cư (`Cute House`)
2. **Cơ chế Phân Khu (Channel System - Tương tự Avatar 2D):**
   - Giới hạn tải tối đa **20 người/khu** để đảm bảo WebGL và Điện thoại di động chạy mượt mà 60 FPS, không nghẽn băng thông.
   - **Biển Chuyển Khu (Zone Signboard):** Đặt tại công viên trung tâm với bảng tên hiển thị số người realtime (ví dụ: `Khu 1 [12/20]`).
   - Khi lại gần biển báo, xuất hiện nút `[Đổi Khu]` $\to$ Bấm vào mở giao diện chọn danh sách khu vực (Khu 1 đến Khu 10, hiển thị trạng thái Xanh lá = Vắng, Vàng = Đông, Đỏ = Đầy).

---

## 🏗️ 2. DANH SÁCH FILE KIẾN TRÚC
- `Assets/_Project/Scripts/Core/ZoneManager.cs`: Quản lý danh sách Channel/Khu vực, trạng thái số người trong phòng (tối đa 20 người/khu).
- `Assets/_Project/Scripts/Gameplay/Interaction/ZonePortal.cs`: Trigger tương tác gắn tại Biển Chuyển Khu trong thành phố.
- `Assets/_Project/Scripts/UI/ZoneSelectUI.cs`: Giao diện Popup danh sách khu vực phong cách Avatar 2D cổ điển kết hợp 3D hiện đại.
- `Assets/_Project/Scripts/Editor/ProjectSetupHelper.cs`: Công cụ 1-click tự động dựng toàn bộ Thành phố và lắp đặt Biển Chuyển Khu.
