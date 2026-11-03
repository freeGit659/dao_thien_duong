import { _decorator, Component, Node, Vec3, input, Input, EventKeyboard, KeyCode, SkeletalAnimation, AnimationClip, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property({ tooltip: 'Tốc độ đi bộ bình thường khi ấn WASD (m/s)' })
    public walkSpeed: number = 2.5;

    @property({ tooltip: 'Tốc độ chạy khi giữ phím Shift (gấp đôi đi bộ = 5.0 m/s)' })
    public runSpeed: number = 5.0;

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
    private _isShiftDown: boolean = false;
    private _currentAnimState: string = '';

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
        this._isMoving = (this._inputDir.lengthSqr() > 0.01);

        if (this._isMoving) {
            const forward = new Vec3();
            const right = new Vec3();

            // DI CHUYỂN CHUẨN THEO HƯỚNG CỦA PLAYER:
            // Model Chibi này mặt hướng +Z trong local space nên Forward là (0, 0, 1) và Right là (-1, 0, 0)
            const modelFwd = new Vec3(0, 0, 1);
            const modelRight = new Vec3(-1, 0, 0);

            Vec3.transformQuat(forward, modelFwd, this.node.worldRotation);
            Vec3.transformQuat(right, modelRight, this.node.worldRotation);

            forward.y = 0;
            right.y = 0;
            forward.normalize();
            right.normalize();

            // Tốc độ di chuyển: Đi bộ bình thường = 2.5 m/s, Giữ Shift = 5.0 m/s (gấp đôi)
            const speed = this._isShiftDown ? this.runSpeed : this.walkSpeed;

            // Tính vận tốc theo từng trục:
            // vz: Vận tốc thẳng / lùi theo hướng Player
            // vx: Vận tốc ngang trái / phải theo hướng Player
            const vz = forward.multiplyScalar(this._inputDir.z * speed);
            const vx = right.multiplyScalar(this._inputDir.x * speed);

            // Vector vận tốc tổng hợp:
            // Khi đi chéo (W+A, W+D, S+A, S+D): tốc độ = sqrt(vz^2 + vx^2) = speed * sqrt(2) chuẩn Pytago!
            const velocity = vz.add(vx);

            // Cập nhật vị trí nhân vật
            const moveStep = velocity.clone().multiplyScalar(dt);
            this.node.setPosition(this.node.position.clone().add(moveStep));

            // Đổi animation: Giữ Shift -> Chạy (run), Đi bình thường -> Đi bộ (walk)
            if (this._isShiftDown) {
                this.playAnimation('run');
            } else {
                this.playAnimation('walk');
            }
        } else {
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
