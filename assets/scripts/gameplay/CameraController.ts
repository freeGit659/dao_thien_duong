import { _decorator, Component, Node, Vec3, input, Input, EventMouse, EventKeyboard, KeyCode, math, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {
    @property(Node)
    public target: Node | null = null;

    @property
    public distance: number = 6.5;

    @property
    public minDistance: number = 2.5;

    @property
    public maxDistance: number = 15.0;

    @property
    public sensitivity: number = 0.25;

    @property({ tooltip: 'Góc nghiêng tối thiểu từ trên xuống (độ), không bị xuyên đất' })
    public minPitch: number = 5.0;

    @property({ tooltip: 'Góc nghiêng tối đa từ trên đỉnh đầu xuống (độ)' })
    public maxPitch: number = 70.0;

    @property({ tooltip: 'Độ cao tối thiểu so với mặt đất (mét)' })
    public minGroundHeight: number = 0.5;

    @property
    public targetOffset: Vec3 = new Vec3(0, 1.2, 0);

    @property
    public invertY: boolean = false;

    // Góc nhìn chuẩn mặc định: Yaw = 0, Pitch = 26 độ (Góc nhìn thứ 3 chéo xuống sau lưng nhân vật)
    private _yaw: number = 0;
    private _pitch: number = 26;
    private _isAltDown: boolean = false;
    private _isRightMouseDown: boolean = false;

    public get isFreeLooking(): boolean {
        return this._isAltDown || this._isRightMouseDown;
    }

    protected onLoad() {
        // Lắng nghe chuột
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);

        // Lắng nghe phím
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        // Bổ sung lắng nghe Alt trên trình duyệt Web để chống trình duyệt cướp sự kiện
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.onWindowKeyDown.bind(this));
            window.addEventListener('keyup', this.onWindowKeyUp.bind(this));
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
        } else if (event.keyCode === KeyCode.KEY_C) {
            // Nhấn phím C để lập tức đưa Camera về sau lưng nhân vật
            this.resetBehindPlayer();
        }
    }

    private onKeyUp(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ALT_LEFT || event.keyCode === KeyCode.ALT_RIGHT) {
            this._isAltDown = false;
        }
    }

    private onMouseDown(event: EventMouse) {
        // Hỗ trợ cả Giữ Chuột Phải hoặc Giữ Phím Alt để xoay góc nhìn
        if (event.getButton() === EventMouse.BUTTON_RIGHT) {
            this._isRightMouseDown = true;
        }
    }

    private onMouseUp(event: EventMouse) {
        if (event.getButton() === EventMouse.BUTTON_RIGHT) {
            this._isRightMouseDown = false;
        }
    }

    private onMouseMove(event: EventMouse) {
        // CHỈ XOAY CAMERA KHI ĐANG GIỮ PHÍM ALT HOẶC GIỮ CHUỘT PHẢI (Chuẩn PUBG / Game TPS)
        if (this.isFreeLooking) {
            const dx = event.getDeltaX();
            const dy = event.getDeltaY();

            // Xoay ngang (Yaw)
            this._yaw -= dx * this.sensitivity;

            // Xoay dọc (Pitch)
            const pitchDelta = this.invertY ? (-dy * this.sensitivity) : (dy * this.sensitivity);
            this._pitch += pitchDelta;
            this._pitch = math.clamp(this._pitch, this.minPitch, this.maxPitch);
        }
    }

    private onMouseWheel(event: EventMouse) {
        const scroll = event.getScrollY();
        this.distance = math.clamp(this.distance - scroll * 0.005, this.minDistance, this.maxDistance);
    }

    /**
     * Đưa Camera quay lại thẳng sau lưng nhân vật
     */
    public resetBehindPlayer() {
        if (!this.target) return;
        this._yaw = this.target.eulerAngles.y;
        this._pitch = 26.0;
    }

    protected lateUpdate(dt: number) {
        if (!this.target) return;

        const focusPoint = this.target.worldPosition.clone().add(this.targetOffset);

        // Chuyển đổi tọa độ cầu sang tọa độ không gian 3D
        const yawRad = math.toRadian(this._yaw);
        const pitchRad = math.toRadian(this._pitch);

        const yOffset = this.distance * Math.sin(pitchRad);
        const hDist = this.distance * Math.cos(pitchRad);

        const xOffset = hDist * Math.sin(yawRad);
        const zOffset = hDist * Math.cos(yawRad);

        const camPos = new Vec3(
            focusPoint.x + xOffset,
            focusPoint.y + yOffset,
            focusPoint.z + zOffset
        );

        // Khóa va chạm mặt đất: Camera không bao giờ chui xuống dưới đất
        if (camPos.y < this.minGroundHeight) {
            camPos.y = this.minGroundHeight;
        }

        this.node.setWorldPosition(camPos);

        // Luôn luôn hướng mắt nhìn thẳng vào nhân vật
        this.node.lookAt(focusPoint, Vec3.UP);
    }
}
