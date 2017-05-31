import BABYLON from "../../../static/babylon";
import {RealmClass} from "../../Realm/Realm";
import {IObject} from "../../ObjectFactory/ObjectFactory";
import {TrafficLine} from "./TrafficLine";
import {TrafficSection} from "./TrafficSection";
import {Building} from "../Building";
import {Random} from "../../Utils/Random";
import StandardMaterial = BABYLON.StandardMaterial;


declare const Realm: RealmClass;


export class MainTrafficSection extends TrafficSection implements IObject {

    public static readonly ACTIVE_COLOR: BABYLON.Color3 = new BABYLON.Color3(211/255, 42/255, 156/255);
    public static readonly INACTIVE_COLOR: BABYLON.Color3 = new BABYLON.Color3(99/255, 43/255, 94/255);

    //public colorProgressStep: number = 0;

    private static shape: BABYLON.Mesh;


    public buildings: Building[] = [];
    //public leftShape: BABYLON.Mesh;
    //public rightShape: BABYLON.Mesh;


    constructor(name: string, scene: BABYLON.Scene, parent: TrafficLine, length: number, random: Random) {
        super(name, scene, parent, 4, random);
        this.shape.isVisible = true;

        /*if (MainTrafficSection.shape) {
            const shapeInstance: BABYLON.Mesh = MainTrafficSection.shape.clone('shape', this);
            shapeInstance.material = MainTrafficSection.shape.material.clone('material');

            this.shape = shapeInstance;
            return;
        }*/

        const leftShape: BABYLON.Mesh = this.shape.clone('leftShape', this);
        const rightShape: BABYLON.Mesh = this.shape.clone('rightShape', this);

        /*const borderIndices: number = leftShape.getTotalIndices() * 2;
        const borderVertices: number = leftShape.getTotalVertices() * 2;*/

        const bottomShape: BABYLON.Mesh = BABYLON.Mesh.CreateGround('bottomShape',
            this.trueLength, // width
            30, // height
            1, // subdivisions
            scene,
            true, // updatable
        );
        /*const bottomIndices: number = bottomShape.getTotalIndices();
        const bottomVertices: number = bottomShape.getTotalVertices();*/

        bottomShape.position.y = -0.8;

        leftShape.position.z = -15;
        rightShape.position.z = 15;

        const newShape: BABYLON.Mesh = BABYLON.Mesh.MergeMeshes([leftShape, rightShape, bottomShape], true);
        newShape.parent = this;

        /*newShape.subMeshes = [];
        newShape.subMeshes.push(new BABYLON.SubMesh(0, 0, borderVertices, 0, borderIndices, newShape));
        newShape.subMeshes.push(new BABYLON.SubMesh(1, borderVertices, bottomVertices, borderIndices,
                bottomIndices, newShape));*/

        /*newShape.material = new BABYLON.MultiMaterial('multi', scene);
        (<any> newShape.material).subMaterials = [];
        (<any> newShape.material).subMaterials.push(this.getSideMaterial());
        (<any> newShape.material).subMaterials.push(this.getBottomMaterial());*/
        newShape.material = this.getSideMaterial();

        this.shape.dispose();
        this.shape = newShape;
        //MainTrafficSection.shape = newShape;
    }


    protected getSideMaterial(): BABYLON.Material {
        const material: any = new BABYLON.StandardMaterial('sideMaterial', this.getScene());

        material.diffuseColor = TrafficSection.INACTIVE_COLOR;
        material.emissiveColor = TrafficSection.ACTIVE_COLOR;
        material.emissiveIntensity = 0.0;

        return material;
    }


    protected getBottomMaterial(): BABYLON.Material {
        const material: any = new BABYLON.StandardMaterial('bottomMaterial', this.getScene());

        material.diffuseColor = TrafficSection.INACTIVE_COLOR;
        material.emissiveColor = TrafficSection.INACTIVE_COLOR;
        material.emissiveIntensity = 0.3;

        return material;
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

            if (BABYLON.Vector3.DistanceSquared(building.position, this.position) < 1800 &&
                        building.height + this.position.y + yPos + 10 > this.position.y) {
                building.setEnabled(false);
            }

            // building.position.y = (this.position.y - 50 < yPos) ? this.position.y - 50 : yPos;
            building.position.y = this.position.y + yPos;
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


    public onRender(): void {
        this.isVisible = true;

        if (BABYLON.Vector3.DistanceSquared(this.position, Realm.camera.position) > 100) {
            this.isVisible = false;
        }


        let ratio: number = Math.sin(1.1 * this.colorProgress);
        ratio = Math.round(ratio * 3) / 3;

        super.onRender();

        (<any> this.shape.material)/*.subMaterials[0]*/.emissiveIntensity = ratio;
        (<any> this.shape.material)/*.subMaterials[0]*/.emissiveColor = Realm.mixColors(
            TrafficSection.INACTIVE_COLOR,
            TrafficSection.ACTIVE_COLOR,
            ratio,
        );
    }

}
