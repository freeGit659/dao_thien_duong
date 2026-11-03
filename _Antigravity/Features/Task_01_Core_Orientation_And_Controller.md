# 📋 TASK 01: HỆ THỐNG MÀN HÌNH DỌC/NGANG & ĐIỀU KHIỂN NHÂN VẬT 3D

## 🎯 1. MỤC TIÊU CẦN ĐẠT ĐƯỢC
1. Tạo một hệ thống **OrientationManager** có khả năng tự động phát hiện khi tỉ lệ màn hình thay đổi giữa Portrait (Dọc) và Landscape (Ngang) trên cả WebGL & Mobile.
2. Tạo **AdaptiveCameraController** có khả năng tự chuyển đổi góc nhìn (FOV và Camera Offset) mượt mà khi xoay màn hình.
3. Tạo **PlayerController** giúp nhân vật 3D di chuyển mượt mà (chạy, xoay người theo hướng đi, rơi trọng lực) bằng component `CharacterController`.

---

## 🏗️ 2. DANH SÁCH FILE VÀ KIẾN TRÚC
- `Assets/_Project/Scripts/Core/OrientationManager.cs` (Tech Lead đã tạo khung & event)
- `Assets/_Project/Scripts/Gameplay/Character/AdaptiveCameraController.cs` (Sếp hoàn thiện hàm Lerp vị trí)
- `Assets/_Project/Scripts/Gameplay/Character/PlayerController.cs` (Sếp hoàn thiện logic di chuyển & xoay)

---

## 🛠️ 3. CÁC BƯỚC SẾP THỰC HIỆN TRONG UNITY EDITOR
1. **Mở Unity Editor:**
   - Mở scene mẫu `Assets/Scenes/SampleScene.unity` (hoặc tạo scene mới `Assets/_Project/Scenes/MainIsland.unity`).
2. **Tạo Mặt Đất (Ground):**
   - Click phải trong Hierarchy $\to$ `3D Object` $\to$ `Plane` (Đặt tên là `Ground`, Scale = `5, 1, 5`).
3. **Tạo Nhân Vật (Player):**
   - Click phải trong Hierarchy $\to$ `3D Object` $\to$ `Capsule` (Đặt tên là `Player`).
   - Xóa bỏ component `Capsule Collider` trên GameObject này.
   - Bấm `Add Component` $\to$ Thêm `CharacterController`.
   - Bấm `Add Component` $\to$ Thêm script `PlayerController`.
4. **Tạo Core Manager:**
   - Click phải trong Hierarchy $\to$ `Create Empty` $\to$ Đặt tên `[Core]` $\to$ Thêm script `OrientationManager`.
5. **Gán Camera:**
   - Chọn `Main Camera` $\to$ Bấm `Add Component` $\to$ Thêm script `AdaptiveCameraController`.
   - Kéo GameObject `Player` vào ô `Target` của Camera Controller trong Inspector.
6. **Chạy thử & Kiểm tra:**
   - Bấm `Play`.
   - Dùng phím `W, A, S, D` để di chuyển Capsule chạy vòng quanh mặt đất.
   - Trong cửa sổ `Game View`, đổi tỉ lệ màn hình thử từ `16:9` sang `9:16` (hoặc Portrait $\leftrightarrow$ Landscape) để ngắm Camera tự động đổi góc nhìn linh hoạt!
