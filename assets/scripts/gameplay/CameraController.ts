import { _decorator, Component, Node, Vec3, Quat, input, Input, EventMouse, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {
    @property(Node)
    public target: Node | null = null;

    @property
    public distance: number = 7.0;

    @property
    public minDistance: number = 3.0;

    @property
    public maxDistance: number = 15.0;

    @property
    public sensitivity: number = 0.25;

    @property
    public targetOffset: Vec3 = new Vec3(0, 1.2, 0);

    private _yaw: number = 0;
    private _pitch: number = 25;
    private _isMouseDown: boolean = false;

    protected onLoad() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
    }

    protected onDestroy() {
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.off(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
    }

    private onMouseDown(event: EventMouse) {
        if (event.getButton() === EventMouse.BUTTON_LEFT || event.getButton() === EventMouse.BUTTON_RIGHT) {
            this._isMouseDown = true;
        }
    }

    private onMouseUp() {
        this._isMouseDown = false;
    }

    private onMouseMove(event: EventMouse) {
        if (this._isMouseDown) {
            const dx = event.getDeltaX();
            const dy = event.getDeltaY();

            this._yaw -= dx * this.sensitivity;
            this._pitch += dy * this.sensitivity;
            this._pitch = math.clamp(this._pitch, -10, 70);
        }
    }

    private onMouseWheel(event: EventMouse) {
        const scroll = event.getScrollY();
        this.distance = math.clamp(this.distance - scroll * 0.005, this.minDistance, this.maxDistance);
    }

    protected lateUpdate(dt: number) {
        if (!this.target) return;

        // Tính toán vị trí Camera quay quanh tâm hình cầu
        const rotation = new Quat();
        Quat.fromEuler(rotation, this._pitch, this._yaw, 0);

        const focusPoint = this.target.worldPosition.clone().add(this.targetOffset);
        const offset = new Vec3(0, 0, this.distance);
        Vec3.transformQuat(offset, offset, rotation);

        this.node.setWorldPosition(focusPoint.add(offset));
        this.node.setWorldRotation(rotation);
    }
}
