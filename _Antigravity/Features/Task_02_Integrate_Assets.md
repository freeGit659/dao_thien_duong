# 🌴 TÀI LIỆU PHÂN TÍCH ASSET & HƯỚNG DẪN TÍCH HỢP

## 1. PHÂN TÍCH CHUYÊN SÂU 2 GÓI ASSET

### 🌟 Asset 1: Palmov Island (Low Poly Houses Free Pack)
- **Đánh giá Tech Lead:** 10/10 điểm phù hợp cho dự án Đảo Thiên Đường!
- **Tại sao?**
  - Sử dụng kỹ thuật **Color Palette Texture Atlas** (`palette.png`). Hàng chục ngôi nhà, cây cối, ghế đá đều chia sẻ chung **1 Material duy nhất** (`mat main.mat`).
  - Lợi ích cho WebGL & Mobile: Giảm số lượng Draw Calls từ hàng trăm xuống chỉ còn **vài chục**, game load cực nhanh trên trình duyệt web và máy Android yếu cũng chạy 60 FPS mát rượi.
- **Những thành phần vàng cần dùng cho dự án:**
  - `Grounds/land.prefab`: Làm bề mặt đảo cơ bản.
  - `Grounds/lake.prefab`: Hồ nước ngọt tự nhiên $\to$ Bãi câu cá trung tâm đảo (Milestone 4).
  - `Environment/bench.prefab`: Ghế đá công viên $\to$ Tương tác ngồi nghỉ hồi phục năng lượng (Milestone 3).
  - `Houses with environment/`: Khu phố thị trấn, quán nước ven biển.
  - `Trees/`: Hàng dừa bãi biển nhiệt đới.

---

### 🌟 Asset 2: ToonyTinyPeople
- **Đánh giá Tech Lead:** Rất chuẩn cho phong cách Chibi mạng xã hội (tương tự Play Together).
- **Đặc điểm Rigging:** Cấu trúc xương **Unity Humanoid** tiêu chuẩn (`animationType: 3`).
  - Có thể dùng chung các animation cho cả nhân vật nam (`TT_demo_male_A`), nhân vật nữ (`TT_demo_female`) và cảnh sát.
  - Sau này có thể import thêm bất kỳ animation nào từ Mixamo (nhảy nhót, nhảy kpop, câu cá, ngồi ghế) mà không cần chỉnh lại xương.
- **Animation Clips cốt lõi đã có:**
  - `m_idle_A`: Đứng thở nhịp nhàng.
  - `m_run`: Chạy nhanh đầy năng lượng.
  - `m_walk`: Đi bộ dạo biển.

---

## 2. CƠ CHẾ ĐÃ TỰ ĐỘNG HÓA CHO SẾP (TOOL 1-CLICK)

Tech Lead đã viết sẵn công cụ tự động hóa trong file [`ProjectSetupHelper.cs`](file:///e:/data/unity/DaoThienDuong/Assets/_Project/Scripts/Editor/ProjectSetupHelper.cs). 

Sếp **không cần phải tự tay nối Animator hay căn chỉnh Collider**, chỉ cần bấm 2 nút trên Menu bar Unity:
1. `Dao Thien Duong` $\to$ `1. Auto Setup Player & Animations`:
   - Tự động tạo file `PlayerAnimatorController.controller` tại `Assets/_Project/Art/Characters/`.
   - Cấu hình chuyển động `Idle` $\leftrightarrow$ `Run` theo tham số `Speed`.
   - Tạo Prefab chuẩn `Player_Main.prefab` tại `Assets/_Project/Prefabs/` với kích thước `CharacterController` vừa khít cơ thể Chibi.
2. `Dao Thien Duong` $\to$ `2. Setup Island Scene Ground & Environment`:
   - Dựng sẵn hòn đảo với 4 khối đất lớn từ Palmov Island, hồ nước ở giữa.
   - Tự động gắn `MeshCollider` để nhân vật đứng và chạy trên đảo mà không bị rơi xuyên đất.
   - Tự động gắn Camera bám theo Player.
