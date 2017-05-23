import BABYLON from "../../static/babylon";
import {RealmClass} from "./Realm";


declare const Realm: RealmClass;


export abstract class RealmState extends BABYLON.Mesh {

    public alpha: number = 0;


    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene);
    }


    public abstract onEnter();
    public abstract onLeave();


    protected repositionOnAlpha(): void {
        this.rotation.y = this.alpha;
    }

}
