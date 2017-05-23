import BABYLON from "../../static/babylon";
import {Animator, AnimationAction} from "../Animation/Animator";
import {RealmClass} from "../Realm/Realm";


declare const Realm: RealmClass;



export enum CameraMode {
    DIRECTION,
    FOLLOWING,
}


export class ExplosionAnimationAction {

    private amplitude: number = 0;
    private maxAmplitude: number;
    private amplitudeStep: number;
    private lag: number = 0.2;
    private vectorLag: number = 50;

    private srcPosition: BABYLON.Vector3;
    private calcPosition: BABYLON.Vector3;
    private lastCalcPosition: BABYLON.Vector3;
    private nTimes: number = 3;
    private n: number = this.nTimes;


    public static create(power: number, duration: number): AnimationAction {
        const action: ExplosionAnimationAction = new ExplosionAnimationAction();
        action.maxAmplitude = power;
        action.amplitudeStep = power / (duration * action.lag * 60);

        return new AnimationAction(action, duration);
    }


    private animateAmplitude(): void {
        /*this.amplitude = this.maxAmplitude * Math.sin(0.5 * Math.PI * (<AnimationAction> (<any> this)).time /
                (<AnimationAction> (<any> this)).duration);*/
        if (this.amplitude === 0) {
            this.amplitude = this.maxAmplitude;
        }

        this.amplitude = Realm.calculateLag(this.amplitude, 0, 20);
    }


    public animateFrame(mesh: BABYLON.Mesh): void {
        this.animateAmplitude();

        if ((<AnimationAction> (<any> this)).animatingLastFrames(this.nTimes)) {
            mesh.position = Realm.calculateVectorAnim(this.calcPosition, mesh.position, this.srcPosition,
                    this.nTimes);
            return;
        }

        if (this.n === this.nTimes) {
            this.n = 0;

            this.lastCalcPosition = this.calcPosition || mesh.position;

            this.calcPosition = new BABYLON.Vector3(
                this.srcPosition.x + this.getRandom(),
                this.srcPosition.y + this.getRandom(),
                this.srcPosition.z + this.getRandom(),
            );
        }

        this.n++;
        mesh.position = Realm.calculateVectorAnim(this.lastCalcPosition, mesh.position, this.calcPosition, this.nTimes);
    }

    public getRandom(): number {
        return Math.random() * (this.amplitude * 2) - this.amplitude;
    }

    public onBefore(mesh: BABYLON.Mesh): void {
        this.srcPosition = mesh.position.clone();
    }

    public onAfter(mesh: BABYLON.Mesh): void {
        mesh.position = this.srcPosition;
    }

}


export class Camera extends BABYLON.Mesh {

    public camera: BABYLON.ArcRotateCamera;

    private followsMesh: BABYLON.Mesh;
    public followLag: number = 50;
    public alignLag: number = 10;
    public rotationLag: number = 5;

    private mode: CameraMode = CameraMode.DIRECTION;
    public alignAlpha: number = 0;
    private currentAlignAlpha: number;
    public animator: Animator;


    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene);

        this.camera = new BABYLON.ArcRotateCamera('camera', 0, Math.PI / 2, 1, BABYLON.Vector3.Zero(), scene);
        this.camera.parent = this;
        this.animator = new Animator(this);
    }


    public follow(mesh: BABYLON.Mesh): void {
        this.mode = CameraMode.FOLLOWING;

        this.followsMesh = mesh;
    }

    public initLookAtDirection(alpha: number): void {
        this.lookAtDirection(alpha);

        this.currentAlignAlpha = -alpha;
    }


    public lookAtDirection(alpha: number): void {
        this.mode = CameraMode.DIRECTION;

        this.followsMesh = undefined;
        this.alignAlpha = -alpha;
    }


    public onRender(): void {
        this.animator.onRender();

        switch (this.mode) {

            case CameraMode.DIRECTION: {
                this.position = Realm.calculateVectorLag(this.position, BABYLON.Vector3.Zero(), this.alignLag);

                this.camera.alpha = Realm.calculateLag(this.camera.alpha, this.alignAlpha, this.alignLag);
                this.camera.beta = Realm.calculateLag(this.camera.beta, Math.PI / 2, this.alignLag);
            } break;


            case CameraMode.FOLLOWING: {

            } break;

        }
    }


    public vibrate(power: number, duration: number): void {
        this.animator.addAnimationAction(ExplosionAnimationAction.create(power, duration));
    }

}
