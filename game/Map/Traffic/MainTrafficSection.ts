import BABYLON from "../../../static/babylon";
import {RealmClass} from "../../Realm/Realm";
import {IObject} from "../../ObjectFactory/ObjectFactory";
import {TrafficLine} from "./TrafficLine";
import {TrafficSection} from "./TrafficSection";


declare const Realm: RealmClass;


export class MainTrafficSection extends TrafficSection implements IObject {

    public static readonly ACTIVE_COLOR: BABYLON.Color3 = new BABYLON.Color3(211/255, 42/255, 156/255);
    public static readonly INACTIVE_COLOR: BABYLON.Color3 = new BABYLON.Color3(99/255, 43/255, 94/255);


    constructor(name: string, scene: BABYLON.Scene, parent: TrafficLine) {
        super(name, scene, parent);
        this.shape.isVisible = true;
    }

}
