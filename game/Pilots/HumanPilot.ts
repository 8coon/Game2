import BABYLON from "../../static/babylon";
import {Pilot} from "./Pilot";
import {StarShip} from "../Models/StarShip";
import {RealmClass} from "../Realm/Realm";


declare const Realm: RealmClass;


export class HumanPilot extends Pilot {

    public canControl: boolean = false;

    public movementLag: number = 50;
    private movementX: number = 0;
    private movementY: number = 0;


    constructor(ship: StarShip) {
        super(ship);

        document.addEventListener('keydown', () => { this.onKeyDown(); });
        document.addEventListener('mousemove', (ev) => { this.onMouseMove(ev); });
    }


    public grabShip(): void {
        this.canControl = true;
        Realm.camera.follow(this.ship);
        this.ship.speed = this.ship.maxSpeed;

        /*Promise.resolve().then(() => {
            this.ship.position = new BABYLON.Vector3(5, 0, 0);
            this.ship.setImmediateAim(new BABYLON.Vector3(-10, -1, 0));
            this.ship.speed = this.ship.maxSpeed;

            return this.ship.atAim();
        }).then(() => {
            this.canControl = true;
            Realm.camera.follow(this.ship);
        });*/

        //this.canControl = false;

        /*Promise.resolve().then(() => {
            this.ship.position = new BABYLON.Vector3(5, -4, -3);
            this.ship.setImmediateAim(new BABYLON.Vector3(-2, 0, 0.8));

            this.ship.speed = this.ship.maxSpeed;

            return this.ship.atAim();
        }).then(() => {
            this.ship.aim = new BABYLON.Vector3(-7, -0.5, 0);

            return this.ship.atAim();
        }).then(() => {
            this.ship.aim = new BABYLON.Vector3(-12, 0.5, 0);
            Realm.camera.follow(this.ship);

            return this.ship.atAim();
        }).then(() => {
            this.ship.aim = new BABYLON.Vector3(-20, 0, 0);
            this.canControl = true;
        })*/
    }


    protected onKeyDown(): void {
    }


    protected onMouseMove(event: MouseEvent): void {
        if (!this.canControl || !Realm.pointerLocked) {
            return;
        }

        const movX: number = event.movementX ||
                (<any> event).mozMovementX ||
                (<any> event).webkitMovementX || 0;
        const movY: number = event.movementY ||
            (<any> event).mozMovementY ||
            (<any> event).webkitMovementY || 0;

        this.movementX = Realm.calculateLag(this.movementX, this.movementX + movX * 0.5, this.movementLag);
        this.movementY = Realm.calculateLag(this.movementY, this.movementY + movY * 0.9, this.movementLag);
        this.ship.setRoll(movX * 0.2);
    }


    public think(): void {
        if (this.canControl) {
            this.ship.mixAim(this.ship.position.add(new BABYLON.Vector3(
                -1,
                -this.movementY,
                this.movementX,
            )));
        }
    }

}
