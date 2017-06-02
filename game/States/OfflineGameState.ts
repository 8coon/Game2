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

    private hudSpeedometer: HTMLCanvasElement;
    private speedCtx: CanvasRenderingContext2D;


    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene);
        this.random = new Random(Math.random() * 10000000);

        this.HUD = <HTMLElement> document.querySelector('#game-hud');
        this.initSpeedometer();

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


    private initSpeedometer(): void {
        this.hudSpeedometer = <HTMLCanvasElement> document.querySelector('#hud-speedometer');
        this.speedCtx = this.hudSpeedometer.getContext('2d');
    }


    // Speed normalized, i.e. between 0 and 1
    public drawSpeedometer(speed: number): void {
        this.speedCtx.clearRect(0, 0, this.hudSpeedometer.width, this.hudSpeedometer.height);

        const minStripeLen: number = 10;
        const maxStripeLen: number = 110;
        const stripeCount: number = 8;

        const stripeDelta = maxStripeLen - minStripeLen;
        speed *= stripeCount;

        for (let i = 0; i < stripeCount; i++) {
            const curStripeLen = minStripeLen + stripeDelta *
                    (1 - Math.sin((i / stripeCount + 1) * Math.PI * 0.5));

            this.speedCtx.fillStyle = (i < speed) ? 'rgb(211, 42, 156)' : 'rgb(200, 200, 200)';
            this.speedCtx.strokeStyle = 'rgb(255, 255, 255)';
            this.speedCtx.lineWidth = 2;
            this.speedCtx.strokeRect(this.hudSpeedometer.width - curStripeLen - 11,
                (stripeCount - i) * 14 - 1, curStripeLen + 2, 5 + 2);
            this.speedCtx.fillRect(this.hudSpeedometer.width - curStripeLen - 10,
                    (stripeCount - i) * 14, curStripeLen, 5);
            this.speedCtx.fillStyle = 'rgba(0, 0, 0, 0)';
        }
    }


    public onEnter(seed?: number) {
        this.ships = [];
        this.offlinePlayer = <StarShip> Realm.objects.grab('offlinePlayer');
        this.offlineMap = <OfflineMap> Realm.objects.grab('offlineMap');

        if (!seed) {
            seed = this.random.number * 1000000;
        }

        this.offlineMap.grabResources(seed);

        Realm.objects.load().then(() => {
            this.offlineMap.startMap();
            this.offlineMap.mainTrafficLine.connectShip(this.offlinePlayer);
            (<HumanPilot> this.offlinePlayer.pilot).grabShip();
        });
    }


    public onLeave() {
        this.ships = [];
        Realm.objects.free('offlinePlayer', this.offlinePlayer);
        Realm.objects.free('offlineMap', this.offlineMap);
    }


    public onRender() {
        this.drawSpeedometer(this.getLeadingPlayer().speed / this.getLeadingPlayer().maxSpeed);
    }


    public getLeadingPlayer(): StarShip {
        return this.offlinePlayer
    }


    public getLeadingPlayerPos(): BABYLON.Vector3 {
        return this.getLeadingPlayer().position;
    }

}