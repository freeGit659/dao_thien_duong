# 🌴 ĐẢO THIÊN ĐƯỜNG (PARADISE ISLAND) - INDEX & CONTEXT MAP
> **Single Source of Truth (SSOT)**: Đọc file này đầu tiên để nắm toàn bộ trạng thái dự án trong 30 giây mà không cần quét lại toàn bộ file code.

---

## 📌 1. THÔNG TIN DỰ ÁN TỔNG QUAN
- **Tên dự án:** Đảo Thiên Đường (Paradise Island)
- **Thể loại:** 3D Social Life Simulation / Multiplayer Hub (Avatar 2D + Play Together)
- **Core Loop:** Sống & Giao tiếp (Ăn/Ngủ/Nghỉ/Chat/Emote) $\to$ Kiếm tiền (Câu cá/Mini-games/Việc làm) $\to$ Tiêu dùng (Thời trang/Nội thất/Xe cộ/Check-in).
- **Target Platform:** WebGL (Web game PC/Mobile browser) & Mobile (Android / iOS).
- **Định dạng hiển thị:** Hybrid Screen (Hỗ trợ linh hoạt cả **Màn hình dọc** & **Màn hình ngang**).
- **Unity Engine:** Unity 6 (6000.5.9f1) - URP (Universal Render Pipeline).

---

## 👥 2. PHÂN VAI & CƠ CHẾ LÀM VIỆC
| Nhân sự | Vai trò | Trách nhiệm chính |
| :--- | :--- | :--- |
| **Sếp (User)** | **Fresher Dev & Game Designer** | **Code chính**, hiện thực hóa logic, test gameplay, đưa ra ý tưởng và quyết định cảm giác game (game feel). |
| **Antigravity (AI)** | **Tech Lead, Business Owner, Lead Designer, Lead Đồ hoạ** | Thiết kế kiến trúc (Architecture), phân rã task thành các bước nhỏ dễ làm, chuẩn bị Skeleton/Template code, review & optimize, định hướng art & business. |

---

## 📂 3. BẢN ĐỒ TÀI LIỆU (QUICK LINKS)
- [Quy trình làm việc & Phân quyền](file:///e:/data/unity/DaoThienDuong/_Antigravity/ROLES_AND_WORKFLOW.md): Cách thức Sếp & Tech Lead phối hợp ra code nhanh, ít bug.
- [Lộ trình phát triển & Timeline](file:///e:/data/unity/DaoThienDuong/_Antigravity/ROADMAP.md): Chi tiết 5 Milestone từ Prototype đến Open Beta.
- [Game Design Document (GDD)](file:///e:/data/unity/DaoThienDuong/_Antigravity/DesignDocs/GDD_DaoThienDuong.md): Đặc tả thiết kế game chi tiết.
- [Kiến trúc Kỹ thuật (Architecture)](file:///e:/data/unity/DaoThienDuong/_Antigravity/Architecture/SystemArchitecture.md): Cấu trúc project, UI dọc/ngang, Event Bus, Network.
- [Chiến lược Multiplayer (WebGL + Mobile)](file:///e:/data/unity/DaoThienDuong/_Antigravity/Architecture/NetworkStrategy.md): Giải pháp realtime socket tối ưu.
- [Định hướng Đồ hoạ & Art Specs](file:///e:/data/unity/DaoThienDuong/_Antigravity/ArtDirection/ArtStyle_Specs.md): Phong cách Stylized 3D, hạn mức polygon & texture cho Web/Mobile.
- [Tiêu chuẩn Code C# cho Fresher](file:///e:/data/unity/DaoThienDuong/_Antigravity/Architecture/CodingStandards.md): Quy ước đặt tên, tối ưu bộ nhớ, clean code.

---

## 🚦 4. TRẠNG THÁI HIỆN TẠI (STATUS TRACKER)
- **Giai đoạn hiện tại:** `Milestone 2 - Web PC Optimization, Player Profile & Realtime Multiplayer`
- **Tiến độ:** 45% (Đã hoàn thiện: Chuẩn điều khiển Web PC với Mouse Orbit 360°, khóa chuột khi chơi và nhả chuột bằng ESC, ẩn Joystick, Bảng Đăng Nhập / Nhập tên cư dân kèm lưu data tự động qua PlayerPrefs/LocalStorage, NameTag 3D trên đầu nhân vật, và WebSocket Server Node.js sẵn sàng kết nối).
- **Next Task:** Sếp mở menu `Dao Thien Duong / 6. Tối Ưu Web PC, Đăng Nhập & Cài Đặt Multiplayer`, khởi động server qua file `Server/run_server.bat` và test Multiplayer!
