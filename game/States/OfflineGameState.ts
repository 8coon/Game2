import BABYLON from "../../static/babylon";
import {RealmClass} from "../Realm/Realm";
import {RealmState} from "../Realm/RealmState";
import {StarShip} from "../Models/StarShip";
import {IObject} from "../ObjectFactory/ObjectFactory";
import {HumanPilot} from "../Pilots/HumanPilot";
import {OfflineMap, MapSection} from "../Map/OfflineMap";
import {Building} from "../Map/Building";


declare const Realm: RealmClass;


export class OfflineGameState extends RealmState {

    public offlinePlayer: StarShip;
    public offlineMap: OfflineMap;


    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene);

        Realm.objects.addObject('offlinePlayer', 1, (): IObject => {
            const starShip: StarShip = new StarShip('offlinePlayer', scene);
            starShip.pilot = new HumanPilot(starShip);

            return starShip;
        });

        Realm.objects.addObject('offlineMap', 1, (): IObject => {
            return <IObject> new OfflineMap('offlineMap', scene, this, Math.random());
        });

        // Realm.objects.addObject('testBuilding', 1, (): IObject => {
        //     return <IObject> new Building(Math.random(), 'testBuilding', scene, this);
        // });

        this.alpha = 0;
        this.repositionOnAlpha();
    }


    public onEnter() {
        this.offlinePlayer = <StarShip> Realm.objects.grab('offlinePlayer');
        this.offlineMap = <OfflineMap> Realm.objects.grab('offlineMap');

        // const building: Building = <Building> Realm.objects.grab('testBuilding');
        // building.position.x = -100;
        // building.position.y = -60;
        // building.scaling = new BABYLON.Vector3(0.35, 0.35, 0.35);

        (<HumanPilot> this.offlinePlayer.pilot).grabShip();
    }


    public onLeave() {
        Realm.objects.free('offlinePlayer', this.offlinePlayer);
        Realm.objects.free('offlineMap', this.offlineMap);
    }


    public onRender() {
        if (this.offlinePlayer.position.x - this.offlineMap.sections[0].position.x < -10) {
            this.offlineMap.generateNextSection();
        }
    }

}