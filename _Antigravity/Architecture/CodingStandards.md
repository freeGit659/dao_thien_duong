# 💻 QUY CHUẨN LẬP TRÌNH C# CHO DỰ ÁN (CODING STANDARDS)
> *Dành cho Sếp - Đảm bảo code sạch, dễ đọc, chuẩn performance trên WebGL & Mobile!*

---

## 1. QUY ƯỚC ĐẶT TÊN (NAMING CONVENTION)
- **Class / Struct / Enum / Interface:** `PascalCase`
  - Ví dụ: `PlayerController`, `FishData`, `IInteractable`.
  - Interface luôn bắt đầu bằng chữ `I` (ví dụ: `IInteractable`, `INetworkSync`).
- **Method (Hàm):** `PascalCase` và dùng động từ rõ nghĩa.
  - Ví dụ: `CastFishingRod()`, `SitOnBench()`, `ConsumeEnergy()`.
- **Biến công khai / Thuộc tính (Public Properties):** `PascalCase`
  - Ví dụ: `public float MoveSpeed { get; private set; }`
- **Biến Serialized trong Inspector:** `camelCase` hoặc `_camelCase` kèm thuộc tính `[SerializeField]`.
  - Ví dụ: `[SerializeField] private float moveSpeed = 5.0f;`
- **Biến private nội bộ:** `_camelCase`
  - Ví dụ: `private bool _isFishing;`

---

## 2. 5 NGUYÊN TẮC VÀNG CHO GAME WEBGL & MOBILE

### 1. Không bao giờ tìm kiếm Component trong Update
❌ **SAI:**
```csharp
void Update() {
    GetComponent<Animator>().SetFloat("Speed", 1.0f); // Tốn CPU kinh khủng!
}
```
✅ **ĐÚNG:**
```csharp
private Animator _animator;
void Awake() {
    _animator = GetComponent<Animator>(); // Cache 1 lần ở Awake/Start
}
void Update() {
    _animator.SetFloat("Speed", 1.0f);
}
```

### 2. Tránh cấp phát bộ nhớ (GC Alloc) trong vòng lặp chính
- Không dùng phép cộng chuỗi `string + string` trong `Update`.
- Hạn chế tạo mới mảng `new int[]` hay `new List<T>()` liên tục trong các hàm gọi thường xuyên.
- Sử dụng Object Pool cho các đối tượng xuất hiện liên tục (bong bóng chat, hiệu ứng nước, cá).

### 3. Tách biệt Logic và Giao diện (Event-Driven)
- Logic không trực tiếp nắm giữ tham chiếu kéo thả tới mọi UI Text.
- Khi máu/năng lượng thay đổi, phát Event:
```csharp
public static event Action<float> OnEnergyChanged;
// Khi ăn xong:
OnEnergyChanged?.Invoke(currentEnergy);
```
- UI chỉ cần lắng nghe `OnEnergyChanged` để cập nhật thanh máu. Code sẽ cực kỳ gọn và không bị lỗi `NullReferenceException`.
