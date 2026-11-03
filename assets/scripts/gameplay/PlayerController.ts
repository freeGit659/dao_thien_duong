import { _decorator, Component, Node, Vec3, input, Input, EventKeyboard, KeyCode, SkeletalAnimation, AnimationClip, find, math } from 'cc';
import { CameraController } from './CameraController';
const { ccclass, property } = _decorator;

function lerpAngleDeg(current: number, target: number, t: number): number {
    let diff = (target - current) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return current + diff * math.clamp01(t);
}

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property({ tooltip: 'Tốc độ đi bộ bình thường khi ấn WASD (m/s)' })
    public walkSpeed: number = 2.5;

    @property({ tooltip: 'Tốc độ chạy khi giữ phím Shift (gấp đôi đi bộ = 5.0 m/s)' })
    public runSpeed: number = 5.0;

    @property({ tooltip: 'Tốc độ xoay mặt nhân vật theo hướng di chuyển' })
    public turnSpeed: number = 20.0;

    @property(Node)
    public cameraNode: Node | null = null;

    @property(SkeletalAnimation)
    public anim: SkeletalAnimation | null = null;

    @property({ type: AnimationClip, tooltip: 'Animation đứng thở/chờ (m_idle_A)' })
    public idleClip: AnimationClip | null = null;

    @property({ type: AnimationClip, tooltip: 'Animation chạy nhanh (m_run)' })
    public runClip: AnimationClip | null = null;

    @property({ type: AnimationClip, tooltip: 'Animation đi bộ (m_walk)' })
    public walkClip: AnimationClip | null = null;

    private _inputDir: Vec3 = new Vec3();
    private _isMoving: boolean = false;
    private _wasMoving: boolean = false;
    private _isShiftDown: boolean = false;
    private _currentAnimState: string = '';
    private _cameraCtrl: CameraController | null = null;

    public get isMoving(): boolean {
        return this._isMoving;
    }

    public get isRunning(): boolean {
        return this._isShiftDown;
    }

    protected onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        // Lắng nghe Shift trên Window trình duyệt để không bao giờ bị trượt phím
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Shift') this._isShiftDown = true;
            });
            window.addEventListener('keyup', (e) => {
                if (e.key === 'Shift') this._isShiftDown = false;
            });
        }

        if (!this.anim) {
            this.anim = this.getComponent(SkeletalAnimation) || this.getComponentInChildren(SkeletalAnimation);
        }
    }

    protected start() {
        if (!this.cameraNode) {
            const cam = find('Main Camera') || this.node.scene?.getChildByName('Main Camera');
            if (cam) {
                this.cameraNode = cam;
                console.log('✅ [PlayerController] Đã tự động gán Camera Node là Main Camera!');
            }
        }

        if (this.cameraNode) {
            this._cameraCtrl = this.cameraNode.getComponent(CameraController);
        }

        if (this.anim) {
            // Tắt Baked Animation để hỗ trợ nạp Animation từ các file FBX bên ngoài
            this.anim.useBakedAnimation = false;

            // Đăng ký các Clip với tên chuẩn 'idle', 'run', 'walk' và đặt chế độ Loop
            if (this.idleClip) {
                this.anim.addClip(this.idleClip, 'idle');
                const state = this.anim.getState('idle');
                if (state) state.wrapMode = AnimationClip.WrapMode.Loop;
            }
            if (this.runClip) {
                this.anim.addClip(this.runClip, 'run');
                const state = this.anim.getState('run');
                if (state) state.wrapMode = AnimationClip.WrapMode.Loop;
            }
            if (this.walkClip) {
                this.anim.addClip(this.walkClip, 'walk');
                const state = this.anim.getState('walk');
                if (state) state.wrapMode = AnimationClip.WrapMode.Loop;
            }

            // Bắt đầu bằng Animation Idle
            this.playAnimation('idle');
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
            case KeyCode.SHIFT_LEFT:
            case KeyCode.SHIFT_RIGHT:
                this._isShiftDown = true;
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
            case KeyCode.SHIFT_LEFT:
            case KeyCode.SHIFT_RIGHT:
                this._isShiftDown = false;
                break;
        }
    }

    protected update(dt: number) {
        if (!this._cameraCtrl && this.cameraNode) {
            this._cameraCtrl = this.cameraNode.getComponent(CameraController);
        }

        this._isMoving = (this._inputDir.lengthSqr() > 0.01);

        if (this._isMoving) {
            // Xác định góc lệch (offset) theo hướng phím ấn:
            let offset = 0;
            let isDiagonal = false;

            if (this._inputDir.z > 0 && this._inputDir.x === 0) {
                // W: Đi thẳng
                offset = 0;
            } else if (this._inputDir.z < 0 && this._inputDir.x === 0) {
                // S: Quay mặt ra sau lưng 180 độ
                offset = 180;
            } else if (this._inputDir.z === 0 && this._inputDir.x > 0) {
                // D: Quay mặt sang phải 90 độ
                offset = -90;
            } else if (this._inputDir.z === 0 && this._inputDir.x < 0) {
                // A: Quay mặt sang trái 90 độ
                offset = 90;
            } else if (this._inputDir.z > 0 && this._inputDir.x > 0) {
                // W + D: Quay mặt chéo trước - phải 45 độ
                offset = -45;
                isDiagonal = true;
            } else if (this._inputDir.z > 0 && this._inputDir.x < 0) {
                // W + A: Quay mặt chéo trước - trái 45 độ
                offset = 45;
                isDiagonal = true;
            } else if (this._inputDir.z < 0 && this._inputDir.x > 0) {
                // S + D: Quay mặt chéo sau - phải 135 độ
                offset = -135;
                isDiagonal = true;
            } else if (this._inputDir.z < 0 && this._inputDir.x < 0) {
                // S + A: Quay mặt chéo sau - trái 135 độ
                offset = 135;
                isDiagonal = true;
            }

            // Hướng mặt mục tiêu = Hướng nhìn cơ sở của Camera + Góc lệch
            const baseYaw = this._cameraCtrl ? this._cameraCtrl.baseYaw : 0;
            const targetYaw = baseYaw + offset;

            // Xoay mặt nhân vật mượt mà theo hướng di chuyển:
            const currentEuler = this.node.eulerAngles;
            const newYaw = lerpAngleDeg(currentEuler.y, targetYaw, dt * this.turnSpeed);
            this.node.setRotationFromEuler(0, newYaw, 0);

            // Vector hướng di chuyển: Hướng trước mặt nhân vật (Model Chibi mặt hướng +Z)
            const forward = new Vec3(0, 0, 1);
            Vec3.transformQuat(forward, forward, this.node.worldRotation);
            forward.y = 0;
            forward.normalize();

            // Tốc độ di chuyển: Đi bộ = 2.5 m/s, Giữ Shift = 5.0 m/s (gấp đôi)
            const baseSpeed = this._isShiftDown ? this.runSpeed : this.walkSpeed;

            // Tốc độ đi chéo theo định lý Pytago: v_diagonal = sqrt(v^2 + v^2) = v * sqrt(2)
            const currentSpeed = isDiagonal ? (baseSpeed * Math.SQRT2) : baseSpeed;

            // Di chuyển vị trí nhân vật
            const velocity = forward.multiplyScalar(currentSpeed);
            const moveStep = velocity.clone().multiplyScalar(dt);
            this.node.setPosition(this.node.position.clone().add(moveStep));

            // Đổi animation: Giữ Shift -> Chạy (run), Đi bình thường -> Đi bộ (walk)
            if (this._isShiftDown) {
                this.playAnimation('run');
            } else {
                this.playAnimation('walk');
            }

            this._wasMoving = true;
        } else {
            // Khi dừng di chuyển:
            if (this._wasMoving) {
                // Đồng bộ lại hướng cơ sở của Camera theo hướng mặt hiện tại sau khi dừng
                if (this._cameraCtrl) {
                    this._cameraCtrl.baseYaw = this.node.eulerAngles.y;
                }
                this._wasMoving = false;
            } else {
                // Khi đứng yên và người chơi di chuột: Xoay mặt nhân vật theo chuột
                if (this._cameraCtrl && !this._cameraCtrl.isFreeLooking) {
                    this.node.setRotationFromEuler(0, this._cameraCtrl.baseYaw, 0);
                }
            }

            // Đứng yên -> Thở (idle)
            this.playAnimation('idle');
        }
    }

    private playAnimation(name: string) {
        if (this._currentAnimState === name) return;
        this._currentAnimState = name;

        if (this.anim) {
            const state = this.anim.getState(name);
            if (state) {
                if (!state.isPlaying) {
                    this.anim.play(name);
                }
            } else {
                // Tự động tìm clip theo tên nếu có sẵn trong component
                const clips = this.anim.clips;
                if (clips && clips.length > 0) {
                    const found = clips.find(c => c && c.name.toLowerCase().includes(name));
                    if (found) {
                        this.anim.play(found.name);
                    } else {
                        this.anim.play(clips[0].name);
                    }
                }
            }
        }
    }
}
