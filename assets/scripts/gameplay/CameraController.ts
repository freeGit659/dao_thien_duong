import { _decorator, Component, Node, Vec3, Quat, input, Input, EventMouse, EventKeyboard, KeyCode, math, game, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {
    @property(Node)
    public target: Node | null = null;

    @property
    public distance: number = 5.5;

    @property
    public minDistance: number = 2.0;

    @property
    public maxDistance: number = 15.0;

    @property
    public sensitivity: number = 0.25;

    @property({ tooltip: 'Góc nghiêng mặc định nhìn từ trên chéo xuống sau gáy (độ)' })
    public basePitch: number = 22.0;

    @property({ tooltip: 'Tốc độ camera trả về sau gáy khi thả nút Alt' })
    public returnSpeed: number = 16.0;

    @property({ tooltip: 'Độ cao tối thiểu so với mặt đất (mét)' })
    public minGroundHeight: number = 0.4;

    @property
    public targetOffset: Vec3 = new Vec3(0, 1.3, 0);

    @property
    public invertY: boolean = false;

    // Góc lệch khi người chơi đè phím Alt (Free Look)
    private _freeLookYaw: number = 0;
    private _freeLookPitch: number = 0;
    private _isAltDown: boolean = false;
    private _isPointerLocked: boolean = false;

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

        if (typeof document !== 'undefined') {
            document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
            document.addEventListener('mozpointerlockchange', this.onPointerLockChange.bind(this));
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

        if (typeof document !== 'undefined') {
            document.removeEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
            document.removeEventListener('mozpointerlockchange', this.onPointerLockChange.bind(this));
        }
    }

    private onPointerLockChange() {
        if (typeof document !== 'undefined' && game.canvas) {
            this._isPointerLocked = (document.pointerLockElement === game.canvas);
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
        // Click chuột vào màn hình để khóa chuột (Pointer Lock)
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
            // ĐANG GIỮ ALT: Chỉ xoay Camera vòng quanh người (Free Look)
            this._freeLookYaw -= dx * this.sensitivity;

            const pitchDelta = this.invertY ? (-dy * this.sensitivity) : (dy * this.sensitivity);
            this._freeLookPitch += pitchDelta;
            this._freeLookPitch = math.clamp(this._freeLookPitch, -15.0, 45.0);
        } else {
            // KHÔNG GIỮ ALT: Di chuột làm xoay mặt nhân vật!
            // Camera gắn sau lưng nên tự động nhìn theo hướng mắt nhân vật giống thực tế!
            if (this.target) {
                const currentEuler = this.target.eulerAngles;
                const newYaw = currentEuler.y - dx * this.sensitivity;
                this.target.setRotationFromEuler(0, newYaw, 0);
            }

            // Điều chỉnh góc ngước lên / nhìn xuống
            const pitchDelta = this.invertY ? (-dy * this.sensitivity) : (dy * this.sensitivity);
            this.basePitch += pitchDelta;
            this.basePitch = math.clamp(this.basePitch, 5.0, 65.0);
        }
    }

    private onMouseWheel(event: EventMouse) {
        const scroll = event.getScrollY();
        this.distance = math.clamp(this.distance - scroll * 0.005, this.minDistance, this.maxDistance);
    }

    protected lateUpdate(dt: number) {
        if (!this.target) return;

        // Khi KHÔNG giữ Alt: trả góc Free Look mượt mà về 0 (góc nhìn thực tế sau gáy)
        if (!this._isAltDown) {
            this._freeLookYaw = math.lerp(this._freeLookYaw, 0, dt * this.returnSpeed);
            this._freeLookPitch = math.lerp(this._freeLookPitch, 0, dt * this.returnSpeed);
            if (Math.abs(this._freeLookYaw) < 0.05) this._freeLookYaw = 0;
            if (Math.abs(this._freeLookPitch) < 0.05) this._freeLookPitch = 0;
        }

        const focusPoint = this.target.worldPosition.clone().add(this.targetOffset);

        // Vector hướng sau lưng nhân vật (Backward vector)
        const backDir = new Vec3(0, 0, 1);
        Vec3.transformQuat(backDir, backDir, this.target.worldRotation);
        backDir.y = 0;
        backDir.normalize();

        // Xoay lệch khi đè phím Alt (hoặc lúc đang trả về từ Alt)
        if (this._freeLookYaw !== 0) {
            const rotY = new Quat();
            Quat.fromAxisAngle(rotY, Vec3.UP, math.toRadian(this._freeLookYaw));
            Vec3.transformQuat(backDir, backDir, rotY);
        }

        // Tính toán độ cao và khoảng cách lùi sau lưng
        const totalPitch = math.clamp(this.basePitch + this._freeLookPitch, 5.0, 75.0);
        const pitchRad = math.toRadian(totalPitch);

        const yOffset = this.distance * Math.sin(pitchRad);
        const hDist = this.distance * Math.cos(pitchRad);

        const camPos = new Vec3(
            focusPoint.x + backDir.x * hDist,
            focusPoint.y + yOffset,
            focusPoint.z + backDir.z * hDist
        );

        // Khóa va chạm mặt đất
        if (camPos.y < this.minGroundHeight) {
            camPos.y = this.minGroundHeight;
        }

        this.node.setWorldPosition(camPos);

        // Camera luôn hướng mắt vào nhân vật
        this.node.lookAt(focusPoint, Vec3.UP);
    }
}
