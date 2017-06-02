
import BABYLON from "../../static/babylon";
import {RealmClass} from "../Realm/Realm";
import {IObject} from "../ObjectFactory/ObjectFactory";
import {OfflineGameState} from "../States/OfflineGameState";

declare const Realm: RealmClass;

export class Explosion extends BABYLON.Mesh implements IObject {

    public sphere : any;

    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene);

        this.sphere = BABYLON.Mesh.CreateSphere(
            'explosion',
            100,
            30,
            scene,
        );

        this.sphere.parent = this;
        this.sphere.material = new BABYLON.StandardMaterial('expl', scene);
        this.sphere.material.emissiveColor = new BABYLON.Color3(1, 1, 1);

        this.sphere.scaling = new BABYLON.Vector3(1, 1, 1);
    }

    onCreate(): void {
        // throw new Error("Method not implemented.");
    }

    onGrab(): void {
        this.setEnabled(true);
    }

    onFree(): void {
        this.setEnabled(false);
    }

    onRender(): void {

    }

    onDelete(): void {
        this.dispose(true);
    }

}