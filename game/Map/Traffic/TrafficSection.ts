import BABYLON from "../../../static/babylon";
import {RealmClass} from "../../Realm/Realm";
import {IObject} from "../../ObjectFactory/ObjectFactory";

declare const Realm: RealmClass;


export class TrafficSection extends BABYLON.Mesh implements IObject {

    public static readonly ACTIVE_COLOR: BABYLON.Color3 = new BABYLON.Color3(211/255, 42/255, 156/255);
    public static readonly INACTIVE_COLOR: BABYLON.Color3 = new BABYLON.Color3(99/255, 43/255, 94/255);

    public shape: BABYLON.Mesh;
    public border: BABYLON.Mesh;
    public length: number;
    public colorProgressStep: number = 0.3;
    public colorProgress: number = 0;


    constructor(name: string, scene: BABYLON.Scene, parent: BABYLON.Node, length: number = 3) {
        super(name, scene, parent);
        this.length = length;
        const trueLength: number = this.length * 1.1;

        this.shape = BABYLON.Mesh.CreateCylinder(
            'shape',
            trueLength,  // height
            0.6, 0.6,  // diameterTop, diameterBottom
            6,  // tessellation
            1,  // subdivisions
            scene,
        );

        this.shape.position.x = -this.length;
        this.shape.rotation.z = 0.5 * Math.PI;
        this.shape.material = new BABYLON.StandardMaterial('shapeMaterial', scene);
        this.shape.parent = this;
        (<any> this.shape.material).diffuseColor = TrafficSection.INACTIVE_COLOR;
        (<any> this.shape.material).emissiveColor = TrafficSection.ACTIVE_COLOR;
        (<any> this.shape.material).emissiveIntensity = 0.0;
        // (<any> this.shape.material).alpha = 0.9;

        this.shape.isVisible = false;
    }


    public afterSection(lastSection: TrafficSection, rotation: BABYLON.Vector3): void {
        this.rotation = rotation;
        this.position = lastSection.position.add(lastSection.getEndVector());

        this.colorProgress = lastSection.colorProgress - lastSection.colorProgressStep;
        if (this.colorProgress < 0) {
            this.colorProgress = Math.PI;
        }
    }


    public getEndVector(): BABYLON.Vector3 {
        const matrix: BABYLON.Matrix = Realm.getTranslationMatrix(this, null, null, BABYLON.Vector3.Zero());
        const vector: BABYLON.Vector3 = new BABYLON.Vector3(-this.length, 0, 0);

        return BABYLON.Vector3.TransformCoordinates(vector, matrix);
    }


    public onCreate(): void {
    }

    public onGrab(): void {
        this.isVisible = true;
    }

    public onFree(): void {
        this.isVisible = false;
    }

    public onDelete(): void {
        this.dispose(true);
    }

    public onRender(): void {
        let ratio: number = Math.sin(1.1 * this.colorProgress);
        ratio = Math.round(ratio * 3) / 3;

        (<any> this.shape.material).emissiveIntensity = ratio;
        // (<any> this.shape.material).alpha = 1 - ratio * 0.7;
        (<any> this.shape.material).emissiveColor = Realm.mixColors(
            TrafficSection.INACTIVE_COLOR,
            TrafficSection.ACTIVE_COLOR,
            ratio,
        );

        this.colorProgress += this.colorProgressStep;

        if (this.colorProgress > Math.PI) {
            this.colorProgress = 0;
        }
    }

}
