import { _decorator, Component, Node, Vec3, Quat, input, Input, EventMouse, math, game, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {
    @property(Node)
    public target: Node | null = null;

    @property
    public distance: number = 7.0;

    @property
    public minDistance: number = 2.5;

    @property
    public maxDistance: number = 15.0;

    @property
    public sensitivity: number = 0.2;

    @property
    public minPitch: number = -15;

    @property
    public maxPitch: number = 65;

    @property
    public targetOffset: Vec3 = new Vec3(0, 1.2, 0);

    @property
    public invertY: boolean = false;

    private _yaw: number = 0;
    private _pitch: number = 20;
    private _isMouseDown: boolean = false;
    private _isPointerLocked: boolean = false;

    protected onLoad() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);

        // Lắng nghe sự kiện Pointer Lock của trình duyệt Web (Khóa và ẩn chuột chuẩn như Unity)
        if (typeof document !== 'undefined') {
            document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
            document.addEventListener('mozpointerlockchange', this.onPointerLockChange.bind(this));
        }
    }

    protected start() {
        // Tự động tìm Player nếu chưa kéo vào Inspector
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
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.off(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);

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

    /**
     * Bấm chuột vào màn hình game để khóa chuột và ẩn con trỏ (chuẩn Unity CursorLockMode.Locked)
     */
    public requestLock() {
        if (typeof document !== 'undefined' && game.canvas) {
            try {
                if (document.pointerLockElement !== game.canvas) {
                    game.canvas.requestPointerLock();
                }
            } catch (err) {
                console.warn('[CameraController] requestPointerLock lỗi:', err);
            }
        }
    }

    private onMouseDown(event: EventMouse) {
        if (event.getButton() === EventMouse.BUTTON_LEFT || event.getButton() === EventMouse.BUTTON_RIGHT) {
            this._isMouseDown = true;
            // Tự động khóa và ẩn chuột khi click vào màn hình game
            this.requestLock();
        }
    }

    private onMouseUp() {
        this._isMouseDown = false;
    }

    private onMouseMove(event: EventMouse) {
        // Cho phép xoay khi chuột đang khóa ẩn HOẶC đang giữ chuột
        if (this._isPointerLocked || this._isMouseDown) {
            const dx = event.getDeltaX();
            const dy = event.getDeltaY();

            this._yaw -= dx * this.sensitivity;

            const pitchDelta = this.invertY ? (dy * this.sensitivity) : (-dy * this.sensitivity);
            this._pitch += pitchDelta;
            this._pitch = math.clamp(this._pitch, this.minPitch, this.maxPitch);
        }
    }

    private onMouseWheel(event: EventMouse) {
        const scroll = event.getScrollY();
        this.distance = math.clamp(this.distance - scroll * 0.005, this.minDistance, this.maxDistance);
    }

    protected lateUpdate(dt: number) {
        if (!this.target) return;

        // Tính toán vị trí Camera quay quanh tâm hình cầu theo Yaw & Pitch
        const rotation = new Quat();
        Quat.fromEuler(rotation, this._pitch, this._yaw, 0);

        const focusPoint = this.target.worldPosition.clone().add(this.targetOffset);
        const offset = new Vec3(0, 0, this.distance);
        Vec3.transformQuat(offset, offset, rotation);

        this.node.setWorldPosition(focusPoint.add(offset));
        this.node.setWorldRotation(rotation);
    }
}
