import BABYLON from "../../static/babylon";
import {StarShip} from "../Models/StarShip";
import {RealmClass} from "./Realm";
import {IObject} from "../ObjectFactory/ObjectFactory";


declare const Realm: RealmClass;


export class RealmScene extends BABYLON.Scene {

    public loader: BABYLON.AssetsManager;


    constructor(engine: BABYLON.Engine) {
        super(engine);

        this.loader = new BABYLON.AssetsManager(this);
    }


    public load(): void {
        this.loader.load();
    }


}
