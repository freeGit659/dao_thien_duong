# 🎨 ĐỊNH HƯỚNG ĐỒ HỌA & ART SPECIFICATIONS (ART DIRECTION)

## 1. PHONG CÁCH CHỦ ĐẠO (ART STYLE)
- **Phong cách:** **3D Stylized Chibi / Casual Cartoon** (tương tự như Animal Crossing, Play Together, Fall Guys).
- **Cảm xúc mang lại:** Tươi sáng, ấm cúng, thư giãn (chill, cozy), đáng yêu và gắn kết.
- **Tỉ lệ nhân vật (Proportions):** Chibi 2.5 đến 3 đầu thân. Đầu to mắt tròn, tay chân bầu bĩnh, biểu cảm đa dạng.

---

## 2. BẢNG MÀU & ÁNH SÁNG (PALETTE & LIGHTING)
- **Tông màu chủ đạo:** Pastel nhiệt đới (Tropical Pastel).
  - Vàng nắng cát biển (`#FFE082`)
  - Xanh nước biển ngọc bích (`#4DD0E1`)
  - Xanh lá cây dừa mát rượi (`#81C784`)
  - Hồng cam san hô hoàng hôn (`#FF8A65`)
- **Ánh sáng (Lighting):** Ánh sáng mặt trời dịu nhẹ kết hợp Baked Lightmaps tĩnh cho môi trường để WebGL chạy mượt 60 FPS, chỉ dùng 1 Direct Light thời gian thực tạo bóng nhẹ dưới chân nhân vật.

---

## 3. CHỈ TIÊU KỸ THUẬT (BUDGET SPECS) CHO WEBGL & MOBILE

Để game load trên trình duyệt web chỉ mất **dưới 5-8 giây** và điện thoại tầm trung không bị nóng máy:

| Thành phần | Hạn mức đề xuất (Target Budget) | Ghi chú tối ưu |
| :--- | :--- | :--- |
| **Model Nhân vật** | 1,500 - 3,000 Triangles | Mesh đơn giản, rigging xương chuẩn Humanoid để tái sử dụng Animation. |
| **Đồ nội thất / Cần câu** | 100 - 500 Triangles | Low-poly tối giản, bo tròn góc nhìn êm mắt. |
| **Texture Size** | 512x512 hoặc 1024x1024 (Atlas) | Dùng chung 1 Color Palette Texture (Atlas) cho nhiều vật phẩm để giảm Draw Calls. |
| **Total Draw Calls (Scene)**| Dưới 80 - 120 Draw Calls | Sử dụng GPU Instancing và SRP Batcher của URP Unity 6. |
| **Shader** | URP / Simple Lit hoặc Toon Lit Unlit | Tránh các shader tính toán phức tạp, bóng đổ mềm khử răng cưa nhẹ. |

---

## 4. QUY CHUẨN UI/UX DỌC & NGANG
- **Màu UI:** Nền trắng mờ / bo tròn mềm mại phong cách glassmorphism nhẹ hoặc cartoon flat.
- **Icon:** To rõ ràng, tối thiểu 44x44 dp trên màn hình di động để ngón tay dễ chạm trúng.
- **Bong bóng chat (Chat Bubble):** Nền trắng chữ đen nổi bật trên đỉnh đầu, tự tan biến sau 5 giây.
