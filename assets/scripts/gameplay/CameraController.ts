import { _decorator, Component, Node, Vec3, Quat, input, Input, EventMouse, EventKeyboard, KeyCode, math, game, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {
    @property(Node)
    public target: Node | null = null;

    @property({ tooltip: 'Khoảng cách camera tới nhân vật (PUBG: 2.5m - 2.8m)' })
    public distance: number = 2.6;

    @property
    public minDistance: number = 1.5;

    @property
    public maxDistance: number = 10.0;

    @property
    public sensitivity: number = 0.22;

    @property({ tooltip: 'Góc nghiêng mặc định ngang tầm mắt/vai nhìn ra chân trời (PUBG: 8 độ)' })
    public basePitch: number = 8.0;

    @property({ tooltip: 'Tốc độ camera trả về sau gáy khi thả nút Alt' })
    public returnSpeed: number = 16.0;

    @property({ tooltip: 'Độ cao tối thiểu so với mặt đất (mét)' })
    public minGroundHeight: number = 0.3;

    @property({ tooltip: 'Tâm ngắm ngang cổ/vai nhân vật, lệch nhẹ sang vai phải chuẩn PUBG' })
    public targetOffset: Vec3 = new Vec3(0.15, 1.15, 0);

    @property
    public invertY: boolean = false;

    // Góc lệch khi người chơi đè phím Alt (Free Look)
    private _freeLookYaw: number = 0;
    private _freeLookPitch: number = 0;
    private _isAltDown: boolean = false;

    public get isFreeLooking(): boolean {
        return this._isAltDown;
    }

    protected onLoad() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.onWindowKeyDown.bind(this));
            window.addEventListener('keyup', this.onWindowKeyUp.bind(this));
        }
    }

    protected start() {
        if (!this.target) {
            const playerNode = find('Player') || this.node.scene?.getChildByName('Player');
            if (playerNode) {
                this.target = playerNode;
                console.log('✅ [CameraController] Đã tự động gán Target là Node Player!');
            }
        }
    }

    protected onDestroy() {
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.off(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);

        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);

        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.onWindowKeyDown.bind(this));
            window.removeEventListener('keyup', this.onWindowKeyUp.bind(this));
        }
    }

    private onWindowKeyDown(e: KeyboardEvent) {
        if (e.key === 'Alt') {
            this._isAltDown = true;
            e.preventDefault();
        }
    }

    private onWindowKeyUp(e: KeyboardEvent) {
        if (e.key === 'Alt') {
            this._isAltDown = false;
        }
    }

    private onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ALT_LEFT || event.keyCode === KeyCode.ALT_RIGHT) {
            this._isAltDown = true;
        }
    }

    private onKeyUp(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ALT_LEFT || event.keyCode === KeyCode.ALT_RIGHT) {
            this._isAltDown = false;
        }
    }

    private onMouseDown(event: EventMouse) {
        if (typeof document !== 'undefined' && game.canvas) {
            if (document.pointerLockElement !== game.canvas) {
                try {
                    game.canvas.requestPointerLock();
                } catch (e) {}
            }
        }
    }

    private onMouseMove(event: EventMouse) {
        const dx = event.getDeltaX();
        const dy = event.getDeltaY();

        if (this._isAltDown) {
            // ĐANG GIỮ ALT (Free Look): Chỉ xoay Camera vòng quanh người
            this._freeLookYaw -= dx * this.sensitivity;

            const pitchDelta = this.invertY ? (-dy * this.sensitivity) : (dy * this.sensitivity);
            this._freeLookPitch += pitchDelta;
            this._freeLookPitch = math.clamp(this._freeLookPitch, -30.0, 50.0);
        } else {
            // KHÔNG GIỮ ALT (Góc nhìn thực tế PUBG): Di chuột làm xoay mặt nhân vật!
            // Camera gắn sau lưng nên tự động nhìn theo hướng mắt nhân vật giống thực tế!
            if (this.target) {
                const currentEuler = this.target.eulerAngles;
                const newYaw = currentEuler.y - dx * this.sensitivity;
                this.target.setRotationFromEuler(0, newYaw, 0);
            }

            // Điều chỉnh góc ngước lên / nhìn xuống (Pitch)
            const pitchDelta = this.invertY ? (-dy * this.sensitivity) : (dy * this.sensitivity);
            this.basePitch += pitchDelta;
            this.basePitch = math.clamp(this.basePitch, -20.0, 55.0);
        }
    }

    private onMouseWheel(event: EventMouse) {
        const scroll = event.getScrollY();
        this.distance = math.clamp(this.distance - scroll * 0.005, this.minDistance, this.maxDistance);
    }

    protected lateUpdate(dt: number) {
        if (!this.target) return;

        // Khi KHÔNG giữ Alt: trả góc Free Look mượt mà về 0 (góc nhìn sau lưng chuẩn PUBG)
        if (!this._isAltDown) {
            this._freeLookYaw = math.lerp(this._freeLookYaw, 0, dt * this.returnSpeed);
            this._freeLookPitch = math.lerp(this._freeLookPitch, 0, dt * this.returnSpeed);
            if (Math.abs(this._freeLookYaw) < 0.05) this._freeLookYaw = 0;
            if (Math.abs(this._freeLookPitch) < 0.05) this._freeLookPitch = 0;
        }

        const focusPoint = this.target.worldPosition.clone().add(this.targetOffset);

        // Vector hướng sau lưng nhân vật (Model Chibi này mặt hướng +Z nên sau lưng là -Z)
        const backDir = new Vec3(0, 0, -1);
        Vec3.transformQuat(backDir, backDir, this.target.worldRotation);
        backDir.y = 0;
        backDir.normalize();

        // Xoay quanh người khi đè phím Alt (hoặc lúc đang lượn trả về)
        if (this._freeLookYaw !== 0) {
            const rotY = new Quat();
            Quat.fromAxisAngle(rotY, Vec3.UP, math.toRadian(this._freeLookYaw));
            Vec3.transformQuat(backDir, backDir, rotY);
        }

        // Tính toán độ cao và khoảng cách lùi sau gáy
        const totalPitch = math.clamp(this.basePitch + this._freeLookPitch, -20.0, 60.0);
        const pitchRad = math.toRadian(totalPitch);

        const yOffset = this.distance * Math.sin(pitchRad);
        const hDist = this.distance * Math.cos(pitchRad);

        const camPos = new Vec3(
            focusPoint.x + backDir.x * hDist,
            focusPoint.y + yOffset,
            focusPoint.z + backDir.z * hDist
        );

        // Chống kẹt đất
        if (camPos.y < this.minGroundHeight) {
            camPos.y = this.minGroundHeight;
        }

        this.node.setWorldPosition(camPos);

        // Hướng mắt nhìn về phía trước qua đầu nhân vật
        const lookTarget = focusPoint.clone().add(new Vec3(0, 0.2, 0));
        this.node.lookAt(lookTarget, Vec3.UP);
    }
}
