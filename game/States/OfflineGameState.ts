import BABYLON from "../../static/babylon";
import {RealmClass} from "../Realm/Realm";
import {RealmState} from "../Realm/RealmState";
import {StarShip} from "../Models/StarShip";
import {IObject} from "../ObjectFactory/ObjectFactory";
import {HumanPilot} from "../Pilots/HumanPilot";
import {Building} from "../Map/Building";
import {MainTrafficLine} from "../Map/Traffic/MainTrafficLine";
import {NPCStarShip} from "../Models/NPCStarShip";
import {Random} from "../Utils/Random";
import {OfflineMap} from "../Map/OfflineMap";


declare const Realm: RealmClass;


export class OfflineGameState extends RealmState {

    public offlinePlayer: StarShip;
    public offlineMap: OfflineMap;
    public random: Random;
    public ships: StarShip[] = [];
    public HUD: HTMLElement;

    private score: number = 0;
    private lastPlayerXPos: number = 0;


    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene);
        this.random = new Random(Math.random() * 10000000);

        this.HUD = <HTMLElement> document.querySelector('#game-hud');

        Realm.objects.addObject('offlinePlayer', 1, (): IObject => {
            const starShip: StarShip = new StarShip('offlinePlayer', scene);
            starShip.pilot = new HumanPilot(starShip);

            return starShip;
        });

        Realm.objects.addObject('offlineMap', 1, (): IObject => {
            return new OfflineMap('offlineMap', scene, this, this.random);
        });

        this.alpha = 0;
        this.repositionOnAlpha();
    }


    public onEnter() {
        this.ships = [];
        this.offlinePlayer = <StarShip> Realm.objects.grab('offlinePlayer');
        this.offlineMap = <OfflineMap> Realm.objects.grab('offlineMap');

        const seed = this.random.number * 1000000;
        this.offlineMap.grabResources(seed);

        Realm.objects.load().then(() => {
            Realm.toggleLoading(false);
            Realm.flashHUD();

            this.offlineMap.startMap();
            this.offlineMap.mainTrafficLine.connectShip(this.offlinePlayer);
            (<HumanPilot> this.offlinePlayer.pilot).grabShip();

            this.lastPlayerXPos = Math.floor(this.getLeadingPlayerPos().x);
        });
    }


    public onLeave() {
        Realm.toggleHUD(false);

        this.ships = [];
        Realm.objects.free('offlinePlayer', this.offlinePlayer);
        Realm.objects.free('offlineMap', this.offlineMap);
    }


    public onRender() {
        Realm.drawSpeedometer(this.getLeadingPlayer().speed / this.getLeadingPlayer().maxSpeed);
        Realm.setPlace(1, 1);

        this.score += Math.floor(this.lastPlayerXPos - this.getLeadingPlayerPos().x);
        this.lastPlayerXPos = this.getLeadingPlayerPos().x;
        Realm.setScore(this.score);
    }


    public getLeadingPlayer(): StarShip {
        return this.offlinePlayer
    }


    public getLeadingPlayerPos(): BABYLON.Vector3 {
        return this.getLeadingPlayer().position;
    }

}