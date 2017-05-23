import BABYLON from "../../static/babylon";
import {RealmClass} from "../Realm/Realm";
import {RealmState} from "../Realm/RealmState";
import {StarShip} from "../Models/StarShip";
import {IObject} from "../ObjectFactory/ObjectFactory";


declare const Realm: RealmClass;


export class OfflineGameState extends RealmState {

    public offlinePlayer: StarShip;


    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene);

        Realm.objects.addObject('offlinePlayer', 1, (): IObject => {
            return new StarShip('offlinePlayer', scene);
        });

        this.alpha = 0;
        this.repositionOnAlpha();
    }


    public onEnter() {
        this.offlinePlayer = <StarShip> Realm.objects.grab('offlinePlayer');
    }


    public onLeave() {
        Realm.objects.free('offlinePlayer', this.offlinePlayer);
    }

}