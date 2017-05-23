import BABYLON from "../../static/babylon";
import ShaderMaterial = BABYLON.ShaderMaterial;
import AbstractMesh = BABYLON.AbstractMesh;
import {RealmClass} from "../Realm/Realm";
import {IObject} from "../ObjectFactory/ObjectFactory";


declare const Realm: RealmClass;


export class StarShip extends BABYLON.Mesh implements IObject {

    private readonly modelName: 'spaceship';
    public shipHolderX: any;
    public shipHolderZ: any;
    public ship: any;
    public camera: any;
    public light: any;
    public joystick: any;
    public target: any;

    public speed: number = 0.2;

    private angleX: number = 0;
    private angleY: number = 0;
    private direction: any;


    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene);

        Realm.meshesLoader.queue(this.modelName, '/static/models/', 'spaceship.obj');

        this.registerBeforeRender(() => { this.onRender(); });
    }


    public onLoad(): void {
        this.shipHolderZ = BABYLON.Mesh.CreateBox(
            'shipHolderZ',
            0.1,
            this.getScene(),
        );
        this.shipHolderZ.parent = this;
        this.shipHolderZ.isVisible = false;

        this.shipHolderX = BABYLON.Mesh.CreateBox(
            'shipHolderX',
            0.1,
            this.getScene(),
        );
        this.shipHolderX.parent = this.shipHolderZ;
        this.shipHolderX.isVisible = false;

        this.ship = Realm.meshesLoader.retrieve(this.modelName).clone('ship');
        this.ship.parent = this.shipHolderX;
        this.ship.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        this.ship.rotation = new BABYLON.Vector3(3 * Math.PI / 2, 0, Math.PI);
        this.ship.setEnabled(true);

        /* this.camera = new BABYLON.TargetCamera(
            'camera',
            new BABYLON.Vector3(0, 0, 0),
            this.getScene(),
        );
        this.camera.parent = this;
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.position = new BABYLON.Vector3(0, 1, -5);
        this.camera.noRotationConstraint = true; */

        this.joystick = BABYLON.Mesh.CreateBox(
            'joystick',
            0.1,
            this.getScene(),
        );
        this.joystick.parent = this;
        this.joystick.position = new BABYLON.Vector3(0, 0, 5);
        this.joystick.isVisible = false;

        this.target = BABYLON.Mesh.CreateBox(
            'target',
            0.1,
            this.getScene(),
        );
        this.target.parent = this.shipHolderX;
        this.target.position = new BABYLON.Vector3(0, 0, 5);

        this.light = new BABYLON.HemisphericLight(
            'light',
            new BABYLON.Vector3(0, 5, 1),
            this.getScene(),
        );
        this.light.parent = this;
        this.light.intensity = 0.7;
    }


    public onRender(): void {

    }


    public onGrab(): void {
        this.setEnabled(true);
    }


    public onFree(): void {
        this.setEnabled(false);
    }


    /* private calculateMovement(modifier: number = 1) {
        const xMatrix = Realm.getTranslationMatrix(this.shipHolderX);
        const zMatrix = Realm.getTranslationMatrix(this.shipHolderZ);

        this.direction = new BABYLON.Vector3(0, 0, modifier * this.speed);
        // direction.addInPlace(new BABYLON.Vector3(0, this.joystick.position.y / 4 * 0.5, 0));

        this.direction = BABYLON.Vector3.TransformCoordinates(this.direction, xMatrix);
        this.direction = BABYLON.Vector3.TransformCoordinates(this.direction, zMatrix);

        (<any> this).position.x += this.direction.x;// * this.speed;
        (<any> this).position.y += this.direction.y;// * this.speed;
        (<any> this).position.z += this.direction.z;// * this.speed;
    } */


    /* public static acos(angle: number) {
        angle = (angle < -1) ? -1 : angle;
        angle = (angle > 1) ? 1 : angle;

        return Math.acos(angle);
    } */


    /* public onRender() {
        this.angleY = Entity.acos(-(this.joystick.position.y / this.joystick.position.z));
        this.angleX = Entity.acos( (this.joystick.position.x / this.joystick.position.z) * 1.3);

        this.shipHolderX.rotation.x = Entity.slowMo(
            this.shipHolderX.rotation.x,  Math.PI / 2 - this.angleY);
        this.shipHolderZ.rotation.z = Entity.slowMo(
            this.shipHolderZ.rotation.z, -Math.PI / 2 + this.angleX);

        (<any> this).rotation.x = Entity.slowMo((<any> this).rotation.x, this.shipHolderX.rotation.x);

        this.calculateMovement(1);
    } */


    /* public static limitTarget(vector, distX, distY) {
        if (vector.x < -distX) vector.x = -distX;
        if (vector.y < -distY) vector.y = -distY;
        if (vector.x >  distX) vector.x =  distX;
        if (vector.y >  distY) vector.y =  distY;
    } */


    /* public joystickMoved(x: number, y: number) {
        this.joystick.position.x +=  x * 0.01;
        this.joystick.position.y += -y * 0.01;

        Entity.limitTarget(this.joystick.position, 4, 4);
    } */


    /* public joystickPressed() {
        (<any> this).getScene().bulletManager.fire(
            this.ship.getAbsolutePosition(),
            this.direction,
            this.speed + 10,
            100,
        );
    } */


    public getCurrentPosition() {
        return this.ship.getAbsolutePosition();
    }

}
