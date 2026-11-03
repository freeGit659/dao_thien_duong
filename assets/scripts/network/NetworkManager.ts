import { _decorator, Component, Node, Vec3, Prefab, instantiate } from 'cc';
import { PlayerController } from '../gameplay/PlayerController';
import { RemotePlayer } from './RemotePlayer';
const { ccclass, property } = _decorator;

@ccclass('NetworkManager')
export class NetworkManager extends Component {
    private static _instance: NetworkManager | null = null;
    public static get instance(): NetworkManager {
        return this._instance!;
    }

    @property
    public serverUrl: string = 'ws://localhost:3000';

    @property(Node)
    public localPlayer: Node | null = null;

    @property(Prefab)
    public remotePlayerPrefab: Prefab | null = null;

    private _ws: WebSocket | null = null;
    private _myId: string = '';
    private _myName: string = '';
    private _remotePlayers: Map<string, RemotePlayer> = new Map();
    private _lastSendTime: number = 0;
    private _localPlayerController: PlayerController | null = null;

    protected onLoad() {
        NetworkManager._instance = this;

        // Sinh ID và Tên ngẫu nhiên cho người chơi này
        this._myId = 'player_' + Math.random().toString(36).substring(2, 8);
        this._myName = 'Cư Dân #' + Math.floor(100 + Math.random() * 900);

        if (this.localPlayer) {
            this._localPlayerController = this.localPlayer.getComponent(PlayerController);
        }

        this.connect();
    }

    public connect() {
        console.log(`[NetworkManager] Đang kết nối tới máy chủ: ${this.serverUrl}`);
        this._ws = new WebSocket(this.serverUrl);

        this._ws.onopen = () => {
            console.log(`✅ [NetworkManager] Kết nối WebSocket thành công với ID: ${this._myId} (${this._myName})`);
            const pos = this.localPlayer ? this.localPlayer.worldPosition : new Vec3(0, 0, 0);

            // Gửi gói Join Khu 1
            this.send({
                type: 'join',
                playerId: this._myId,
                playerName: this._myName,
                zoneId: 1,
                x: pos.x,
                y: pos.y,
                z: pos.z,
                rotY: this.localPlayer ? this.localPlayer.eulerAngles.y : 0
            });
        };

        this._ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                this.handleMessage(msg);
            } catch (e) {
                console.error('[NetworkManager] Lỗi đọc gói tin:', e);
            }
        };

        this._ws.onclose = () => {
            console.log('[NetworkManager] Mất kết nối tới server.');
        };
    }

    private handleMessage(msg: any) {
        switch (msg.type) {
            case 'init_zone':
                this.clearAllRemotePlayers();
                if (msg.players) {
                    msg.players.forEach((p: any) => this.spawnRemotePlayer(p.id, p.name, new Vec3(p.x, p.y, p.z), p.rotY));
                }
                break;

            case 'player_joined':
                if (msg.id !== this._myId) {
                    this.spawnRemotePlayer(msg.id, msg.name, new Vec3(msg.x, msg.y, msg.z), msg.rotY);
                }
                break;

            case 'player_moved':
                if (this._remotePlayers.has(msg.id)) {
                    const rp = this._remotePlayers.get(msg.id)!;
                    rp.updateState(new Vec3(msg.x, msg.y, msg.z), msg.rotY, msg.speed);
                }
                break;

            case 'player_left':
                this.removeRemotePlayer(msg.id);
                break;
        }
    }

    private spawnRemotePlayer(id: string, name: string, pos: Vec3, rotY: number) {
        if (this._remotePlayers.has(id)) return;

        let node: Node;
        if (this.remotePlayerPrefab) {
            node = instantiate(this.remotePlayerPrefab);
        } else if (this.localPlayer) {
            // Nếu chưa có prefab, clone node localPlayer
            node = instantiate(this.localPlayer);
            const ctrl = node.getComponent(PlayerController);
            if (ctrl) ctrl.destroy();
        } else {
            node = new Node(`Remote_${name}`);
        }

        node.name = `Remote_${name}`;
        this.node.scene.addChild(node);

        let rp = node.getComponent(RemotePlayer);
        if (!rp) rp = node.addComponent(RemotePlayer);

        rp.init(id, name, pos, rotY);
        this._remotePlayers.set(id, rp);
        console.log(`👤 [NetworkManager] Thấy người chơi: ${name} (ID: ${id})`);
    }

    private removeRemotePlayer(id: string) {
        if (this._remotePlayers.has(id)) {
            const rp = this._remotePlayers.get(id)!;
            rp.node.destroy();
            this._remotePlayers.delete(id);
        }
    }

    private clearAllRemotePlayers() {
        this._remotePlayers.forEach(rp => rp.node.destroy());
        this._remotePlayers.clear();
    }

    protected update(dt: number) {
        if (!this._ws || this._ws.readyState !== WebSocket.OPEN || !this.localPlayer) return;

        const now = Date.now();
        // Gửi 15 lần/giây (khoảng 66ms một lần)
        if (now - this._lastSendTime >= 66) {
            this._lastSendTime = now;

            const pos = this.localPlayer.worldPosition;
            const rotY = this.localPlayer.eulerAngles.y;
            const isMoving = this._localPlayerController ? this._localPlayerController.isMoving : false;

            this.send({
                type: 'move',
                playerId: this._myId,
                x: pos.x,
                y: pos.y,
                z: pos.z,
                rotY: rotY,
                speed: isMoving ? 1.0 : 0.0
            });
        }
    }

    public send(data: any) {
        if (this._ws && this._ws.readyState === WebSocket.OPEN) {
            this._ws.send(JSON.stringify(data));
        }
    }
}
