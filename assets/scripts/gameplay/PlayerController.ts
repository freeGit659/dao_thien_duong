import { _decorator, Component, Node, Vec3, Quat, input, Input, EventKeyboard, KeyCode, SkeletalAnimation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property
    public moveSpeed: number = 6.0;

    @property
    public rotateSpeed: number = 10.0;

    @property(Node)
    public cameraNode: Node | null = null;

    @property(SkeletalAnimation)
    public anim: SkeletalAnimation | null = null;

    private _inputDir: Vec3 = new Vec3();
    private _velocity: Vec3 = new Vec3();
    private _targetRotation: Quat = new Quat();
    private _isMoving: boolean = false;
    private _currentAnimState: string = 'idle';

    public get isMoving(): boolean {
        return this._isMoving;
    }

    protected onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        if (!this.anim) {
            this.anim = this.getComponentInChildren(SkeletalAnimation);
        }
    }

    protected onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this._inputDir.z = 1;
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this._inputDir.z = -1;
                break;
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                this._inputDir.x = -1;
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                this._inputDir.x = 1;
                break;
        }
    }

    private onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                if (this._inputDir.z > 0) this._inputDir.z = 0;
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                if (this._inputDir.z < 0) this._inputDir.z = 0;
                break;
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                if (this._inputDir.x < 0) this._inputDir.x = 0;
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                if (this._inputDir.x > 0) this._inputDir.x = 0;
                break;
        }
    }

    protected update(dt: number) {
        this._isMoving = (this._inputDir.lengthSqr() > 0.01);

        if (this._isMoving) {
            // Tính toán hướng di chuyển tương đối theo Camera
            let moveDir = new Vec3(this._inputDir.x, 0, this._inputDir.z).normalize();

            if (this.cameraNode) {
                const forward = new Vec3();
                const right = new Vec3();
                this.cameraNode.getForward(forward);
                this.cameraNode.getRight(right);

                forward.y = 0;
                right.y = 0;
                forward.normalize();
                right.normalize();

                moveDir = right.multiplyScalar(this._inputDir.x).add(forward.multiplyScalar(this._inputDir.z)).normalize();
            }

            // Di chuyển vị trí Node
            const moveStep = moveDir.clone().multiplyScalar(this.moveSpeed * dt);
            this.node.setPosition(this.node.position.clone().add(moveStep));

            // Xoay nhân vật mượt mà theo hướng đi
            Quat.fromViewUp(this._targetRotation, moveDir, Vec3.UP);
            const currentRot = this.node.rotation;
            const newRot = new Quat();
            Quat.slerp(newRot, currentRot, this._targetRotation, dt * this.rotateSpeed);
            this.node.setRotation(newRot);

            this.playAnimation('run');
        } else {
            this.playAnimation('idle');
        }
    }

    private playAnimation(name: string) {
        if (this._currentAnimState === name) return;
        this._currentAnimState = name;

        if (this.anim) {
            // Tự động tìm clip phù hợp nếu có
            const clips = this.anim.clips;
            if (clips && clips.length > 0) {
                const targetClip = clips.find(c => c && c.name.toLowerCase().includes(name));
                if (targetClip) {
                    this.anim.play(targetClip.name);
                }
            }
        }
    }
}
