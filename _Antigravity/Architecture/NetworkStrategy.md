# 🌐 CHIẾN LƯỢC MẠNG MULTIPLAYER (WEBGL + MOBILE)

## 1. THÁCH THỨC ĐẶC THÙ CỦA WEBGL VÀ MOBILE
- **WebGL chạy trong trình duyệt bảo mật (Browser Sandbox):** Không hỗ trợ giao thức socket tầng thấp (Raw TCP/UDP). WebGL **bắt buộc** phải giao tiếp thông qua **WebSocket (WSS)** hoặc **WebRTC**.
- **Mobile:** Hỗ trợ mọi loại socket, nhưng cần tiết kiệm pin và chống ngắt kết nối đột ngột khi chuyển mạng Wifi/4G.
- **Yêu cầu của Đảo Thiên Đường:**
  - Không cần tốc độ phản xạ 60 ticks/s như game bắn súng FPS.
  - Tần số đồng bộ 10-15 ticks/s là đủ để di chuyển, chat, câu cá, emote mượt mà kết hợp nội suy (Client-side Interpolation).

---

## 2. GIẢI PHÁP ĐƯỢC CHỌN (RECOMMENDED STACK)

### Lựa chọn tối ưu 1: **Colyseus (Node.js) + Colyseus Unity SDK** (Đề xuất số 1)
- **Ưu điểm:**
  - Chạy WebSocket thuần 100%, tương thích hoàn hảo cả WebGL và Mobile mà không cần cấu hình proxy phức tạp.
  - Quản lý Room/Lobby cực kỳ trực quan, nhẹ nhàng.
  - Server viết bằng TypeScript/Node.js rất dễ triển khai lên các dịch vụ hosting miễn phí hoặc giá rẻ (Render, Railway, VPS nhỏ).
  - Khả năng xử lý State Synchronization và Chat Realtime tuyệt vời cho thể loại Social MMO Hub.

### Lựa chọn thay thế 2: **Fish-Net / Mirror với SimpleWebTransport**
- **Ưu điểm:** Viết toàn bộ code Server trên chính C# Unity (Headless Server).
- **Hạn chế:** Tốn tài nguyên server hơn Node.js khi scale nhiều phòng.

---

## 3. CẤU TRÚC GÓI TIN ĐỒNG BỘ CỐT LÕI (NETWORK PROTOCOL)

1. **State Message:**
   ```json
   {
     "id": "player_123",
     "x": 12.5,
     "y": 0.0,
     "z": -4.2,
     "rotY": 180.0,
     "animState": 1, // 0: Idle, 1: Walk, 2: Run, 3: Sit, 4: Sleep, 5: Fishing
     "currentEmote": null
   }
   ```
2. **Chat Message:**
   ```json
   {
     "senderId": "player_123",
     "senderName": "Sếp Dev",
     "message": "Ai ra bến tàu câu cá mập với tôi không?",
     "timestamp": 1740000000
   }
   ```
3. **Action / Interaction Message:**
   ```json
   {
     "playerId": "player_123",
     "actionType": "SIT",
     "targetObjectId": "bench_seaside_04"
   }
   ```
