const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const MAX_PLAYERS_PER_ZONE = 20;

// 1. Tạo HTTP Server phục vụ Web Client Test
const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end('Lỗi nạp trang Web Client');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
    });
});

// 2. Gắn WebSocket Server vào chung cổng HTTP
const wss = new WebSocketServer({ server });

console.log(`====================================================`);
console.log(`🌴 ĐẢO THIÊN ĐƯỜNG - MÁY CHỦ MULTIPLAYER ONLINE REALTIME 🌴`);
console.log(`🚀 Cổng Server: http://localhost:${PORT} (và ws://localhost:${PORT})`);
console.log(`🌐 MỞ TRÌNH DUYỆT: http://localhost:${PORT} ĐỂ TEST MULTIPLAYER NGAY (KHÔNG CẦN BUILD!)`);
console.log(`👥 Tối đa ${MAX_PLAYERS_PER_ZONE} người/khu vực (chống lag chuẩn Web & Mobile)`);
console.log(`====================================================\n`);

// Danh sách người chơi đang online: clientId => Player Object
const players = new Map();

// Quản lý các phòng (Khu vực): zoneId => Set of Client IDs
const zones = new Map();

function getZoneClients(zoneId) {
    if (!zones.has(zoneId)) {
        zones.set(zoneId, new Set());
    }
    return zones.get(zoneId);
}

function broadcastToZone(zoneId, message, senderWs = null) {
    const jsonStr = typeof message === 'string' ? message : JSON.stringify(message);
    const clientIds = getZoneClients(zoneId);

    clientIds.forEach(id => {
        const player = players.get(id);
        if (player && player.ws && player.ws !== senderWs && player.ws.readyState === 1) { // 1 = OPEN
            player.ws.send(jsonStr);
        }
    });
}

wss.on('connection', (ws) => {
    let currentId = null;

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data.toString());

            switch (msg.type) {
                case 'join': {
                    currentId = msg.playerId;
                    const zoneId = parseInt(msg.zoneId) || 1;
                    const zoneSet = getZoneClients(zoneId);

                    if (zoneSet.size >= MAX_PLAYERS_PER_ZONE) {
                        ws.send(JSON.stringify({ type: 'error', message: `Khu ${zoneId} đã đầy (20/20 người)!` }));
                        return;
                    }

                    // Lưu thông tin người chơi
                    const playerObj = {
                        id: currentId,
                        name: msg.playerName || 'Cư Dân',
                        zoneId: zoneId,
                        x: msg.x || 0,
                        y: msg.y || 2.5,
                        z: msg.z || 0,
                        rotY: msg.rotY || 0,
                        speed: 0,
                        ws: ws
                    };
                    players.set(currentId, playerObj);
                    zoneSet.add(currentId);

                    console.log(`[+] 👤 "${playerObj.name}" (ID: ${currentId}) đã vào Khu ${zoneId} [${zoneSet.size}/${MAX_PLAYERS_PER_ZONE}]`);

                    // 1. Gửi lại cho người mới danh sách tất cả những người đang có trong khu
                    const existingPlayers = [];
                    zoneSet.forEach(id => {
                        if (id !== currentId && players.has(id)) {
                            const p = players.get(id);
                            existingPlayers.push({
                                id: p.id,
                                name: p.name,
                                x: p.x,
                                y: p.y,
                                z: p.z,
                                rotY: p.rotY,
                                speed: p.speed
                            });
                        }
                    });

                    ws.send(JSON.stringify({
                        type: 'init_zone',
                        zoneId: zoneId,
                        players: existingPlayers
                    }));

                    // 2. Báo cho tất cả những người khác trong khu biết có người mới vào
                    broadcastToZone(zoneId, {
                        type: 'player_joined',
                        id: playerObj.id,
                        name: playerObj.name,
                        x: playerObj.x,
                        y: playerObj.y,
                        z: playerObj.z,
                        rotY: playerObj.rotY
                    }, ws);
                    break;
                }

                case 'move': {
                    if (!currentId || !players.has(currentId)) return;
                    const p = players.get(currentId);
                    p.x = msg.x;
                    p.y = msg.y;
                    p.z = msg.z;
                    p.rotY = msg.rotY;
                    p.speed = msg.speed;

                    // Broadcast vị trí cho những người khác trong cùng khu vực
                    broadcastToZone(p.zoneId, {
                        type: 'player_moved',
                        id: p.id,
                        x: p.x,
                        y: p.y,
                        z: p.z,
                        rotY: p.rotY,
                        speed: p.speed
                    }, ws);
                    break;
                }

                case 'change_zone': {
                    if (!currentId || !players.has(currentId)) return;
                    const p = players.get(currentId);
                    const oldZone = p.zoneId;
                    const newZone = parseInt(msg.targetZoneId) || 1;

                    // Xóa khỏi khu cũ
                    const oldZoneSet = getZoneClients(oldZone);
                    oldZoneSet.delete(currentId);
                    broadcastToZone(oldZone, { type: 'player_left', id: currentId }, ws);

                    // Thêm vào khu mới
                    p.zoneId = newZone;
                    const newZoneSet = getZoneClients(newZone);
                    newZoneSet.add(currentId);

                    console.log(`[~] 🔄 "${p.name}" chuyển từ Khu ${oldZone} sang Khu ${newZone} [${newZoneSet.size}/${MAX_PLAYERS_PER_ZONE}]`);

                    // Gửi lại danh sách người trong khu mới
                    const existingInNewZone = [];
                    newZoneSet.forEach(id => {
                        if (id !== currentId && players.has(id)) {
                            const other = players.get(id);
                            existingInNewZone.push({
                                id: other.id,
                                name: other.name,
                                x: other.x,
                                y: other.y,
                                z: other.z,
                                rotY: other.rotY,
                                speed: other.speed
                            });
                        }
                    });

                    ws.send(JSON.stringify({
                        type: 'init_zone',
                        zoneId: newZone,
                        players: existingInNewZone
                    }));

                    broadcastToZone(newZone, {
                        type: 'player_joined',
                        id: p.id,
                        name: p.name,
                        x: p.x,
                        y: p.y,
                        z: p.z,
                        rotY: p.rotY
                    }, ws);
                    break;
                }
            }
        } catch (e) {
            console.error('Lỗi phân tích gói tin JSON:', e);
        }
    });

    ws.on('close', () => {
        if (currentId && players.has(currentId)) {
            const p = players.get(currentId);
            const zoneSet = getZoneClients(p.zoneId);
            zoneSet.delete(currentId);
            players.delete(currentId);

            console.log(`[-] 👋 "${p.name}" (ID: ${currentId}) đã rời đảo. Còn lại ${zoneSet.size} người trong Khu ${p.zoneId}`);

            broadcastToZone(p.zoneId, {
                type: 'player_left',
                id: currentId
            });
        }
    });
});

server.listen(PORT, () => {
    console.log(`✅ Server đã sẵn sàng phục vụ tại cổng ${PORT}`);
});
