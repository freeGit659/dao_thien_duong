import { _decorator, Component, Node, Vec3, input, Input, EventMouse, math, game, find } from 'cc';
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

    @property({ tooltip: 'Góc nhìn tối thiểu từ trên xuống (độ), luôn > 0 để không bị xuyên đất' })
    public minPitch: number = 5.0;

    @property({ tooltip: 'Góc nhìn tối đa từ trên đỉnh đầu xuống (độ)' })
    public maxPitch: number = 75.0;

    @property({ tooltip: 'Độ cao tối thiểu so với mặt đất (mét)' })
    public minGroundHeight: number = 0.5;

    @property
    public targetOffset: Vec3 = new Vec3(0, 1.2, 0);

    @property
    public invertY: boolean = false;

    // Khởi tạo góc nhìn chuẩn: Yaw = 0, Pitch = 25 độ (nhìn từ trên chéo xuống sau lưng nhân vật)
    private _yaw: number = 0;
    private _pitch: number = 25;
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

            // Xoay ngang (Yaw)
            this._yaw -= dx * this.sensitivity;

            // Xoay dọc (Pitch): nhìn từ trên xuống
            // Di chuột lên -> nhìn ngước lên (pitch giảm về phía chân trời)
            // Di chuột xuống -> nhìn chúc xuống (pitch tăng nhìn từ trên đỉnh đầu)
            const pitchDelta = this.invertY ? (-dy * this.sensitivity) : (dy * this.sensitivity);
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

        const focusPoint = this.target.worldPosition.clone().add(this.targetOffset);

        // Chuyển đổi tọa độ cầu: Yaw (ngang) và Pitch (dọc)
        const yawRad = math.toRadian(this._yaw);
        const pitchRad = math.toRadian(this._pitch);

        // Tính khoảng cách theo góc nhìn từ trên chéo xuống
        const yOffset = this.distance * Math.sin(pitchRad);
        const hDist = this.distance * Math.cos(pitchRad);

        const xOffset = hDist * Math.sin(yawRad);
        const zOffset = hDist * Math.cos(yawRad);

        const camPos = new Vec3(
            focusPoint.x + xOffset,
            focusPoint.y + yOffset,
            focusPoint.z + zOffset
        );

        // Giới hạn mặt đất: Camera KHÔNG BAO GIỜ bị tụt xuống dưới mặt đất
        if (camPos.y < this.minGroundHeight) {
            camPos.y = this.minGroundHeight;
        }

        this.node.setWorldPosition(camPos);

        // Camera luôn hướng thẳng mắt vào nhân vật
        this.node.lookAt(focusPoint, Vec3.UP);
    }
}
