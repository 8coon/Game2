import BABYLON from "../../static/babylon";
import {RealmClass} from "../Realm/Realm";


declare const Realm: RealmClass;



export enum CameraMode {
    DIRECTION,
    FOLLOWING,
}


export enum CameraActionType {
    NONE,
    TURBULENCE,
}


export class CameraAction {
    public type: CameraActionType = CameraActionType.NONE;
    public duration: number = 1;  // milliseconds
}


export class Camera extends BABYLON.Mesh {

    public camera: BABYLON.ArcRotateCamera;

    private followsMesh: BABYLON.Mesh;
    public followLag: number = 50;
    public alignLag: number = 10;
    public rotationLag: number = 5;

    private mode: CameraMode = CameraMode.DIRECTION;
    private actions: CameraAction[];
    public alignAlpha: number = 0;
    private currentAlignAlpha: number;

    private xRotMatrix: BABYLON.Matrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y,  Math.PI / 2);
    private yRotMatrix: BABYLON.Matrix = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, -Math.PI / 2);


    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene);

        this.camera = new BABYLON.ArcRotateCamera('camera', 0, Math.PI / 2, 1, BABYLON.Vector3.Zero(), scene);
        this.camera.parent = this;
    }


    public follow(mesh: BABYLON.Mesh): void {
        this.mode = CameraMode.FOLLOWING;

        this.followsMesh = mesh;
    }

    public initLookAtDirection(alpha: number): void {
        this.lookAtDirection(alpha);

        this.currentAlignAlpha = alpha;
    }


    public lookAtDirection(alpha: number): void {
        this.mode = CameraMode.DIRECTION;

        this.followsMesh = undefined;
        this.alignAlpha = alpha;
    }


    public onRender(): void {
        switch (this.mode) {

            case CameraMode.DIRECTION: {
                this.position = BABYLON.Vector3.Zero();

                this.camera.alpha = Realm.calculateLag(this.camera.alpha, this.alignAlpha, this.alignLag);
                this.camera.beta = Realm.calculateLag(this.camera.beta, Math.PI / 2, this.alignLag);
            } break;


            case CameraMode.FOLLOWING: {

            } break;

        }
    }

}
