import BABYLON from "../../static/babylon";
import ShaderMaterial = BABYLON.ShaderMaterial;
import AbstractMesh = BABYLON.AbstractMesh;
import {RealmClass} from "../Realm/Realm";
import {IObject} from "../ObjectFactory/ObjectFactory";
import {Pilot} from "../Pilots/Pilot";
import {AnimatedValue, Animation} from "../Animation/AnimatedValue";


declare const Realm: RealmClass;


export class StarShip extends BABYLON.Mesh implements IObject {

    private readonly modelName: 'spaceship';
    public ship: BABYLON.Mesh;
    public light: BABYLON.Light;
    public pilot: Pilot;

    public speed: number = 0;
    public maxSpeed: number = 0.07 * 3;
    public aimLag: number = 20;
    public aimFrames: number = 60;
    public aimTime: number = 1500;

    public direction: BABYLON.Vector3 = BABYLON.Axis.X.scale(-1);
    private _aim: BABYLON.Vector3 = BABYLON.Axis.X.scale(-1);
    private localRealAim: AnimatedValue<BABYLON.Vector3> = AnimatedValue.resolve(BABYLON.Axis.X.scale(-1));
    private lastLocalRealAim: BABYLON.Vector3 = BABYLON.Axis.X.scale(-1);
    private zRotation: number = 0;
    private zNextRotation: number = 0;
    private aimResolve;
    private hasLight: boolean;


    constructor(name: string, scene: BABYLON.Scene, hasLight: boolean = true) {
        super(name, scene);
        this.hasLight = hasLight;

        Realm.meshesLoader.queue(this.modelName, '/static/models/', 'spaceship.obj');
    }


    public get aim(): BABYLON.Vector3 {
        return this._aim;
    }

    public set aim(value: BABYLON.Vector3) {
        this._aim = value;

        const newLocalAim: BABYLON.Vector3 = this._aim.subtract(this.position);
        this.localRealAim = new AnimatedValue<BABYLON.Vector3>(this.localRealAim.value, newLocalAim, this.aimTime,
                Animation.LINEAR);
    }


    public onCreate(): void {
        this.ship = Realm.meshesLoader.retrieve(this.modelName).clone('ship');
        this.ship.parent = this;
        this.ship.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
        this.ship.rotation = new BABYLON.Vector3(Math.PI, 0.5 * Math.PI, 0.5 * Math.PI);
        this.ship.setEnabled(true);

        if (this.hasLight) {
            this.light = new BABYLON.HemisphericLight(
                'light',
                new BABYLON.Vector3(0, 5, 1),
                this.getScene(),
            );

            this.light.parent = this;
            this.light.diffuse = new BABYLON.Color3(69 / 255, 110 / 255, 203 / 255);
            this.light.intensity = 0.9;
        }
    }


    public atAim(): Promise<any> {
        return new Promise<any>((resolve) => {
            this.aimResolve = () => {
                this.aimResolve = undefined;
                resolve();
            };
        });
    }


    public setImmediateAim(aim: BABYLON.Vector3): void {
        this.aim = aim;
        this.localRealAim = AnimatedValue.resolve(this.localRealAim.endValue);
    }


    public mixAim(aim: BABYLON.Vector3): void {
        this.setImmediateAim(Realm.calculateVectorLag(this.aim, aim, 1));
    }


    public setRoll(roll: number): void {
        if (Math.abs(roll) < 5) {
            roll = 0;
        }

        this.zNextRotation = 1.7 * roll;

        if (this.zNextRotation > Math.PI * 0.4) {
            this.zNextRotation = Math.PI * 0.4;
        }

        if (this.zNextRotation < -Math.PI * 0.4) {
            this.zNextRotation = -Math.PI * 0.4;
        }
    }


    public onRender(): void {
        if (this.pilot) {
            this.pilot.think();
        }

        this.localRealAim.onRender();
        this.lastLocalRealAim = this.localRealAim.value;

        if (this.aimResolve) {
            const newGlobalAim: BABYLON.Vector3 = this.position.add(this.lastLocalRealAim);
            const correct: BABYLON.Vector3 = this._aim.subtract(newGlobalAim);

            this.lastLocalRealAim.addInPlace(correct.scale(0.05 * Math.min(1,
                    this.localRealAim.progress * 1.5)));
        }

        this.direction = Realm.calculateVectorLag(this.direction, this.lastLocalRealAim.clone().normalize(),
                100);

        this.rotation = Realm.rotationFromDirection(this.direction);

        if (!this.aimResolve) {
            this.zRotation = Realm.calculateLag(this.zRotation, this.zNextRotation, 20);
            this.zNextRotation = Realm.calculateLag(this.zNextRotation, 0, 5);
            this.ship.rotation.x = Realm.calculateLag(this.ship.rotation.x, Math.PI + this.zRotation, 10);

            if (this.rotation.z > 0) {
                this.rotation.z = 0.5 * Math.PI;
            } else {
                this.rotation.z = -0.5 * Math.PI;
            }
        }

        this.direction.scaleInPlace(this.speed * Realm.animModifier);
        this.position.addInPlace(this.direction);

        if (this.aimResolve && this.position.equalsWithEpsilon(this.aim, 0.5)) {
            this.aimResolve();
        }
    }


    public onGrab(): void {
        this.setEnabled(true);
    }


    public onFree(): void {
        this.setEnabled(false);
    }

    public onDelete(): void {
        this.dispose(true);
    }

}
