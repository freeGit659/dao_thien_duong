# 📋 TASK 03: GIAO DIỆN CẢM ỨNG (VIRTUAL JOYSTICK & HYBRID UI)

## 🎯 1. MỤC TIÊU CẦN ĐẠT ĐƯỢC
1. Tạo component **VirtualJoystick** (Cần điều khiển ảo) dùng thư viện chuẩn `UnityEngine.EventSystems` (`IDragHandler`, `IPointerDownHandler`, `IPointerUpHandler`).
2. Kết nối Joystick với hàm `SetJoystickInput(Vector2 input)` trong [`PlayerController.cs`](file:///e:/data/unity/DaoThienDuong/Assets/_Project/Scripts/Gameplay/Character/PlayerController.cs) để di chuyển trên Mobile/Web cảm ứng.
3. Tạo nút **Toggle Orientation** trên màn hình để Sếp bấm thử chuyển đổi giữa Dọc và Ngang ngay trong lúc chơi.
4. Tạo nút **Jump Button** trên màn hình cảm ứng.

---

## 🏗️ 2. DANH SÁCH FILE
- `Assets/_Project/Scripts/UI/VirtualJoystick.cs` (Cần gạt ảo cảm ứng mượt mà)
- `Assets/_Project/Scripts/UI/OrientationAdaptiveUI.cs` (Tự động dịch chuyển vị trí Joystick & Nút bấm khi xoay màn hình)
- `Assets/_Project/Scripts/Editor/ProjectSetupHelper.cs` (Tích hợp menu 1-click tự động tạo Canvas UI hoàn chỉnh)

---

## 🛠️ 3. KIẾN THỨC GAME DEV CHO SẾP (FRESSHER INSIGHT)
- Để làm Joystick ảo mượt trong Unity:
  - Dùng **Canvas Scaler** chế độ `Scale With Screen Size` (Reference Resolution: `1080 x 1920` hoặc `1920 x 1080`) để giao diện không bị méo trên các kích thước màn hình khác nhau.
  - Sử dụng `RectTransformUtility.ScreenPointToLocalPointInRectangle` để tính khoảng cách ngón tay kéo so với tâm joystick, sau đó chuẩn hóa vector về khoảng $(-1 \to 1)$.
