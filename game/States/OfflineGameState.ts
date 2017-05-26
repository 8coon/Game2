import BABYLON from "../../static/babylon";
import {RealmClass} from "../Realm/Realm";
import {RealmState} from "../Realm/RealmState";
import {StarShip} from "../Models/StarShip";
import {IObject} from "../ObjectFactory/ObjectFactory";
import {HumanPilot} from "../Pilots/HumanPilot";


declare const Realm: RealmClass;


export class OfflineGameState extends RealmState {

    public offlinePlayer: StarShip;


    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene);

        Realm.objects.addObject('offlinePlayer', 1, (): IObject => {
            const starShip: StarShip = new StarShip('offlinePlayer', scene);
            starShip.pilot = new HumanPilot(starShip);

            return starShip;
        });

        this.alpha = 0;
        this.repositionOnAlpha();
    }


    public onEnter() {
        this.offlinePlayer = <StarShip> Realm.objects.grab('offlinePlayer');
        (<HumanPilot> this.offlinePlayer.pilot).grabShip();
    }


    public onLeave() {
        Realm.objects.free('offlinePlayer', this.offlinePlayer);
    }

}