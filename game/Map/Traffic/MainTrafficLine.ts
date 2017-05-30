import BABYLON from "../../../static/babylon";
import {RealmClass} from "../../Realm/Realm";
import {IObject} from "../../ObjectFactory/ObjectFactory";
import {TrafficLine} from "./TrafficLine";
import {Random} from "../../Utils/Random";
import {OfflineMap} from "../OfflineMap";
import {TrafficSection} from "./TrafficSection";
import {MainTrafficSection} from "./MainTrafficSection";


declare const Realm: RealmClass;


export class MainTrafficLine extends TrafficLine implements IObject{

    public sections: MainTrafficSection[] = [];
    public sectionProto = MainTrafficSection;


    constructor(name: string, scene: BABYLON.Scene, parent: OfflineMap, random: Random) {
        super(name, scene, parent, random, false, 101, 3, false);
        this.hasNPCs = false;
    }


    public onRender(): void {
        super.onRender();
    }


    public onGrab(): void {
        this.reposition();
    }


    public generateNextSection(): void {
        Realm.objects.free(`${this.name}__mapSection`, this.sections[0]);

        const next: TrafficSection = <TrafficSection> Realm.objects.grab(`${this.name}__mapSection`);
        next.afterSection(this.sections[this.sections.length - 1], this.nextVector());

        if (this.sections.splice(0, 1)[0]['_vectorStart']) {
            this.vectors.splice(0, 1);
        }

        this.pushSection(next);
    }


    public getLastSection(): MainTrafficSection {
        return this.sections[this.sectionCount - 1];
    }

}
