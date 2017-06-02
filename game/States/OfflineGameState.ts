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
import {Explosion} from "../Models/Explosion";


declare const Realm: RealmClass;


export class OfflineGameState extends RealmState {

    public offlinePlayer: StarShip;
    public offlineMap: OfflineMap;
    public random: Random;
    public ships: StarShip[] = [];
    public HUD: HTMLElement;

    private score: number = 0;
    private lastPlayerXPos: number = 0;
    private comboCount: number = 0;


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

        Realm.objects.addObject('explosion', 10, (): IObject => {
            return new Explosion('explosion', scene);
        });

        this.alpha = 0;
        this.repositionOnAlpha();
    }


    public bonusCollected(): void {
        this.comboCount++;
        Realm.toggleCombo(this.comboCount);
    }


    public bonusMissed(): void {
        const combo: number = this.comboCount;
        this.comboCount = 0;

        if (combo === 0) {
            return;
        }

        Realm.flashCombo().then(() => {
            this.score += this.score * (0.01 * combo);

            Realm.toggleCombo(0);
            Realm.flashScore();
        });
    }


    public onEnter() {
        this.ships = [];
        this.offlinePlayer = <StarShip> Realm.objects.grab('offlinePlayer');
        this.offlineMap = <OfflineMap> Realm.objects.grab('offlineMap');

        const seed = this.random.number * 1000000;
        this.offlineMap.grabResources(seed);

        Realm.objects.load().then(() => {
            Realm.toggleLoading(false);
            Realm.toggleCountdown(false, '');
            Realm.toggleTimer(false, '');
            Realm.toggleCombo(0);
            Realm.camera.limited = true;

            this.offlineMap.startMap();
            this.offlineMap.mainTrafficLine.connectShip(this.offlinePlayer);
            (<HumanPilot> this.offlinePlayer.pilot).grabShip();
            this.lastPlayerXPos = this.getLeadingPlayerPos().x;

            Realm.flashHUD().then(() => {
                Promise.resolve().then(() => {
                    return new Promise((resolve) => {
                        Realm.toggleCountdown(true, '3');
                        window.setTimeout(() => resolve(), 1000);
                    });
                }).then(() => {
                    return new Promise((resolve) => {
                        Realm.toggleCountdown(true, '2');
                        window.setTimeout(() => resolve(), 1000);
                    });
                }).then(() => {
                    return new Promise((resolve) => {
                        Realm.toggleCountdown(true, '1');
                        window.setTimeout(() => resolve(), 1000);
                    });
                }).then(() => {
                    Realm.toggleCountdown(true, 'СТАРТ');
                    this.getLeadingPlayer().canMove = true;
                    (<HumanPilot> this.offlinePlayer.pilot).toggleControl(true);
                    Realm.camera.limited = false;

                    return Realm.flashCountdown();
                }).then(() => {
                    Realm.toggleCountdown(false, '');
                })
            });
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

        this.score += (this.lastPlayerXPos - this.getLeadingPlayerPos().x) * 0.5;
        this.lastPlayerXPos = this.getLeadingPlayerPos().x;

        Realm.setScore(Math.floor(this.score));
    }


    public getLeadingPlayer(): StarShip {
        return this.offlinePlayer
    }


    public getLeadingPlayerPos(): BABYLON.Vector3 {
        return this.getLeadingPlayer().position;
    }

    public explodeAt(position: BABYLON.Vector3) {
        const expl: Explosion = (<Explosion> Realm.objects.grab('explosion'));
        expl.position = position.clone();

        window.setTimeout(() => {
            Realm.objects.free('explosion', expl);
        }, 1500)
    }

}