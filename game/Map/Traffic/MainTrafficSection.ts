import BABYLON from "../../../static/babylon";
import {RealmClass} from "../../Realm/Realm";
import {IObject} from "../../ObjectFactory/ObjectFactory";
import {TrafficLine} from "./TrafficLine";
import {TrafficSection} from "./TrafficSection";
import {Building} from "../Building";
import {Random} from "../../Utils/Random";


declare const Realm: RealmClass;


export class MainTrafficSection extends TrafficSection implements IObject {

    public static readonly ACTIVE_COLOR: BABYLON.Color3 = new BABYLON.Color3(211/255, 42/255, 156/255);
    public static readonly INACTIVE_COLOR: BABYLON.Color3 = new BABYLON.Color3(99/255, 43/255, 94/255);

    public buildings: Building[] = [];


    constructor(name: string, scene: BABYLON.Scene, parent: TrafficLine, length: number, random: Random) {
        super(name, scene, parent, 3, random);
        this.shape.isVisible = true
    }


    public generateBuildings(): void {
        const buildingName: string = (<any> this.parent).getBuildingName();
        const max = this.random.range(6, 9);

        for (let i = 0; i < max; i++) {
            const building: Building = <Building> Realm.objects.grabRandom(buildingName, this.random);
            const yPos: number = -180;

            building.position = this.position.add(new BABYLON.Vector3(
                this.random.range(-10, 10, false),
                0,
                (i - 0.5 * max) * 50 + this.random.range(-10, 10, false),
            ));

            const scaling = this.random.range(0.4, 0.6, false);
            building.scaling = new BABYLON.Vector3(scaling, scaling, scaling);

            building.rotation = new BABYLON.Vector3(
                0,
                this.random.range(0, Math.PI, false),
                0,
            );

            building.setEnabled(true);

            if (BABYLON.Vector3.DistanceSquared(building.position, this.position) < 1600 &&
                        building.height + building.position.y + yPos + 10 > this.position.y) {
                building.setEnabled(false);
            }

            building.position.y = yPos;
            this.buildings.push(building);
        }
    }


    public onFree(): void {
        const buildingName: string = (<any> this.parent).getBuildingName();

        if (this.buildings.length === 0) {
            return;
        }

        this.buildings.forEach((building: Building) => {
            Realm.objects.free(buildingName, building);
        });

        this.buildings = [];

        /*window.setTimeout(() => {
            const newBuilding: Building = new Building(0, buildingName, this.getScene(), undefined);
            newBuilding.renderingGroupId = 1;

            Realm.objects.replaceFreeObject(buildingName, newBuilding);
        }, 1);*/
    }

}
