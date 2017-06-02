import BABYLON from "../../static/babylon";
import {StarShip} from "../Models/StarShip";
import {RealmClass} from "./Realm";
import {IObject} from "../ObjectFactory/ObjectFactory";


declare const Realm: RealmClass;


export class RealmScene extends BABYLON.Scene {

    public loader: BABYLON.AssetsManager;
    public bonusSound: BABYLON.Sound;
    public engineSound: BABYLON.Sound;
    public menuMusic: BABYLON.Sound;
    public gameMusic: BABYLON.Sound;


    constructor(engine: BABYLON.Engine) {
        super(engine);

        this.loader = new BABYLON.AssetsManager(this);
        let task;

        task = this.loader.addBinaryFileTask('bonus task', '/static/sounds/bonus.ogg');
        task.onSuccess = (task) => {
            this.bonusSound = new BABYLON.Sound('bonus', task.data, this, null,
                    { loop: false, autoplay: false });
        };

        task = this.loader.addBinaryFileTask('engine task', '/static/sounds/ship.ogg');
        task.onSuccess = (task) => {
            this.engineSound = new BABYLON.Sound('ship', task.data, this, null,
                { loop: true, autoplay: false });
            this.engineSound.setVolume(0.0);
        };

        task = this.loader.addBinaryFileTask('menu task', '/static/music/menu.ogg');
        task.onSuccess = (task) => {
            this.menuMusic = new BABYLON.Sound('menu', task.data, this, null,
                { loop: true, autoplay: false });
            this.menuMusic.setVolume(1.0);
        };

        task = this.loader.addBinaryFileTask('game task', '/static/music/game.ogg');
        task.onSuccess = (task) => {
            this.gameMusic = new BABYLON.Sound('game', task.data, this, null,
                { loop: true, autoplay: false });
            this.gameMusic.setVolume(0.17);
        };

    }


    public load(): void {
        this.loader.load();
    }


}
