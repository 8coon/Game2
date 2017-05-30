import BABYLON from "../../static/babylon";
import {RealmClass} from "../Realm/Realm";
import {IObject} from "../ObjectFactory/ObjectFactory";
import {OfflineGameState} from "../States/OfflineGameState";
import {Random} from "../Utils/Random";
import {TrafficLine} from "./Traffic/TrafficLine";
import {MainTrafficLine} from "./Traffic/MainTrafficLine";
import {StarShip} from "../Models/StarShip";
import {NPCStarShip} from "../Models/NPCStarShip";


declare const Realm: RealmClass;


export class OfflineMap extends BABYLON.Mesh implements IObject{

    public random: Random;
    public trafficLines: TrafficLine[] = [];
    public trafficLineCount: number = 4;
    public mainTrafficLine: MainTrafficLine;
    public NPCName: string;


    constructor(name: string, scene: BABYLON.Scene, parent: OfflineGameState, random: Random) {
        super(name, scene, parent);
        this.random = random;
        this.NPCName = `${name}_NPC`;
        let i = 0;

        Realm.objects.addObject(`${name}_trafficLine`, this.trafficLineCount, (): IObject => {
            return new TrafficLine(`${name}_${i++}_trafficLine`, scene, this, this.random, true,
                    undefined, 3);
        });

        Realm.objects.addObject(`${name}_mainTrafficLine`, 1, (): IObject => {
            return new MainTrafficLine(`${name}_mainTrafficLine`, scene, this, this.random);
        });

        Realm.objects.addObject(this.NPCName, 100, (): IObject => {
            return new NPCStarShip(this.NPCName, scene);
        });
    }


    public onLoad(): void {
    }


    public onGrab(): void {
        this.mainTrafficLine = <MainTrafficLine> Realm.objects.grab(`${this.name}_mainTrafficLine`);

        for (let i = 0; i < this.trafficLineCount; i++) {
            const trafficLine: TrafficLine = <TrafficLine> Realm.objects.grab(`${this.name}_trafficLine`);

            this.placeTrafficLine(trafficLine, i);
            this.trafficLines.push(trafficLine);
        }
    }


    protected placeTrafficLine(line: TrafficLine, index: number, secondary: boolean = false): void {
        if (secondary && index < 2) {
            index += 2;
        }

        const xDistCf: number = (index > 1) ? 1 : 0.5;
        const length = this.mainTrafficLine.sections.length;
        const position: BABYLON.Vector3 = this.mainTrafficLine.sections[
                    Math.floor(xDistCf * length) - (index % 2) * 3 - 3
            ].position;

        line.position = position.subtract(new BABYLON.Vector3(0, 0, 0.5 * 145.455));
        line.direction = index % 2 === 0 ? 1 : -1;
        line.reposition();
    }


    public getLeadingPlayer(): StarShip {
        return (<OfflineGameState> this.parent).getLeadingPlayer();
    }


    public getLeadingPlayerPos(): BABYLON.Vector3 {
        return this.getLeadingPlayer().position;
    }


    public onFree(): void {
        Realm.objects.freeAll(this.NPCName);
        Realm.objects.free(`${this.name}_mainTrafficLine`, this.mainTrafficLine);
        this.trafficLines.forEach((line, i) => Realm.objects.free(`${this.name}_${i}_trafficLine`, line));
        this.trafficLines = [];
    }


    public onRender(): void {
        this.trafficLines.forEach((line: TrafficLine, index: number) => {
            if ((<OfflineGameState> this.parent).getLeadingPlayerPos().x - line.position.x < -10) {
                Realm.objects.free(`${this.name}_trafficLine`, line);

                this.trafficLines[index] = <TrafficLine> Realm.objects.grab(`${this.name}_trafficLine`);
                this.placeTrafficLine(this.trafficLines[index], index, true);
            }
        });

        if ((<OfflineGameState> this.parent).getLeadingPlayerPos().x -
                    this.mainTrafficLine.sections[0].position.x < -40) {
            this.mainTrafficLine.generateNextSection();
        }
    }


}
