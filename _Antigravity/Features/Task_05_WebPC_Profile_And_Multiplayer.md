# 📋 TASK 05: TỐI ƯU WEB PC, LƯU DỮ LIỆU ĐĂNG NHẬP & MULTIPLAYER REALTIME

## 🎯 1. MỤC TIÊU CẦN ĐẠT ĐƯỢC
1. **Trải Nghiệm Chuẩn Web PC:**
   - Ẩn chuột (`Cursor Lock Mode`) khi click vào game.
   - Xoay Camera 360 độ tự do quanh nhân vật bằng chuột (Mouse Orbit 3rd Person Camera).
   - Nhấn phím `ESC` để nhả chuột khi cần bấm Menu, Đổi Khu Vực.
   - Ẩn hoàn toàn Virtual Joystick (ưu tiên phím WASD + Chuột).
2. **Hệ Thống Đăng Nhập & Lưu Dữ Liệu Cư Dân (Profile & Save System):**
   - Lưu trữ qua `PlayerPrefs` / WebGL LocalStorage.
   - **Lần đầu vào game:** Hiện Popup nhập tên cư dân (Ví dụ: "Sếp Đẹp Trai").
   - **Các lần sau:** Tự động đăng nhập thẳng vào game, khôi phục tên và dữ liệu.
   - **Name Tag 3D:** Hiển thị tên cư dân nổi trên đỉnh đầu nhân vật (luôn xoay mặt về camera).
3. **Cấu Trúc Mạng Multiplayer Realtime (WebSocket):**
   - Hỗ trợ WebGL Sandbox 100%.
   - Server Node.js siêu nhẹ trong thư mục `Server/` phân chia theo từng Khu vực (tối đa 20 người/khu).
   - Đồng bộ vị trí, hướng quay, bước chạy mượt mà bằng phương pháp Nội suy (Interpolation).
4. **Quy Trình Test Multiplayer Cho Sếp:**
   - Hướng dẫn test 2 người chơi cùng lúc trên cùng một máy (Unity Editor $\leftrightarrow$ Trình duyệt Web).

---

## 🏗️ 2. DANH SÁCH FILE KIẾN TRÚC
- `Assets/_Project/Scripts/Core/CursorManager.cs`: Quản lý ẩn/hiện và khóa chuột trên PC.
- `Assets/_Project/Scripts/Core/ProfileManager.cs`: Lưu/Tải dữ liệu cư dân, quản lý popup đăng nhập.
- `Assets/_Project/Scripts/Gameplay/Character/PlayerNameTag.cs`: Bảng tên 3D trên đỉnh đầu nhân vật.
- `Assets/_Project/Scripts/Network/NetworkManager.cs`: Quản lý kết nối WebSocket Client cho WebGL & Editor.
- `Assets/_Project/Scripts/Network/RemotePlayer.cs`: Đồng bộ vị trí người chơi khác.
- `Server/server.js`: Node.js WebSocket Game Server nhẹ nhàng, tốc độ cao.
