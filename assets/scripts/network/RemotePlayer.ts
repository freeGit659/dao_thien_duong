import { _decorator, Component, Node, Vec3, Quat, SkeletalAnimation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RemotePlayer')
export class RemotePlayer extends Component {
    @property
    public playerId: string = '';

    @property
    public playerName: string = '';

    @property
    public interpolateSpeed: number = 12.0;

    @property(SkeletalAnimation)
    public anim: SkeletalAnimation | null = null;

    private _targetPosition: Vec3 = new Vec3();
    private _targetRotation: Quat = new Quat();
    private _targetSpeed: number = 0;

    protected onLoad() {
        if (!this.anim) {
            this.anim = this.getComponentInChildren(SkeletalAnimation);
        }
        this._targetPosition.set(this.node.worldPosition);
        this._targetRotation.set(this.node.worldRotation);
    }

    public init(id: string, name: string, pos: Vec3, rotY: number) {
        this.playerId = id;
        this.playerName = name;
        this.node.setWorldPosition(pos);
        Quat.fromEuler(this._targetRotation, 0, rotY, 0);
        this.node.setWorldRotation(this._targetRotation);

        this._targetPosition.set(pos);
    }

    public updateState(pos: Vec3, rotY: number, speed: number) {
        this._targetPosition.set(pos);
        Quat.fromEuler(this._targetRotation, 0, rotY, 0);
        this._targetSpeed = speed;
    }

    protected update(dt: number) {
        // Nội suy mượt mà
        const curPos = this.node.worldPosition;
        const newPos = new Vec3();
        Vec3.lerp(newPos, curPos, this._targetPosition, dt * this.interpolateSpeed);
        this.node.setWorldPosition(newPos);

        const curRot = this.node.worldRotation;
        const newRot = new Quat();
        Quat.slerp(newRot, curRot, this._targetRotation, dt * this.interpolateSpeed);
        this.node.setWorldRotation(newRot);

        // Chạy animation
        if (this.anim) {
            const clipName = this._targetSpeed > 0.1 ? 'run' : 'idle';
            const clips = this.anim.clips;
            if (clips && clips.length > 0) {
                const target = clips.find(c => c && c.name.toLowerCase().includes(clipName));
                if (target && !this.anim.getState(target.name).isPlaying) {
                    this.anim.play(target.name);
                }
            }
        }
    }
}
