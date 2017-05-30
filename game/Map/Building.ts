import BABYLON from "../../static/babylon";
import {RealmClass} from "../Realm/Realm";
import {IObject} from "../ObjectFactory/ObjectFactory";
import Vector2 = BABYLON.Vector2;
import Vector3 = BABYLON.Vector3;
import Matrix = BABYLON.Matrix;
import Color4 = BABYLON.Color4;
import StandardMaterial = BABYLON.StandardMaterial;
import {
    BuildingShapeBuilder, RectangularBuildingShapeBuilder,
    SquareBuildingShapeBuilder, HexagonBuildingShapeBuilder, Complex1BuildingShapeBuilder
} from "./BuildingShapeBuilder";
import {Random} from "../Utils/Random";


declare const Realm: RealmClass;


export enum BuildingShape {
    RECTANGULAR,
    SQUARE,
    HEXAGON,
    COMPLEX_1,
}


export enum SideType {
    BLANK,
    BLANK_WALL,
    VERTICAL_WALL,
    HORIZONTAL_WALL,
    PLATFORM,
}


export enum PlatformShape {
    ROUND,
}


export enum AntennaType {
    THIN_CUSTOMIZABLE,
    COMPLEX_1,
}



export class BuildingSectionScaffold extends BABYLON.Mesh {

    public darks: BABYLON.VertexData = Building.VertexData();
    public lights: BABYLON.VertexData = Building.VertexData();

    public floors: number;
    public isSmall: boolean = true;
    public shape: BuildingShapeBuilder;

    public darksMesh: BABYLON.Mesh;
    public lightsMesh: BABYLON.Mesh;
    public height: number;

    public random: Random;


    constructor(random: Random, name: string, scene: BABYLON.Scene, parent: BABYLON.Mesh,
                isSmall: boolean, args: object) {
        super(name, scene, parent);
        this.random = random;
        this.isSmall = isSmall;

        this.floors = this.random.range(30, 40);
        args['floors'] = this.floors;

        let shapes: any[] = [RectangularBuildingShapeBuilder, SquareBuildingShapeBuilder];

        if (!this.isSmall) {
            shapes.concat([HexagonBuildingShapeBuilder, Complex1BuildingShapeBuilder]);

            args['minXParam'] = 25;
            args['minZParam'] = args['minXParam'];

            args['maxXParam'] = 40;
            args['maxZParam'] = args['maxXParam'];
        }

        this.shape = new (this.random.choose(shapes))
                (this.random, this.darks, this.lights, args);

        for (let i = 0; i < this.floors; i++) {
            this.buildFloor(i);
        }

        this.buildRoof();
        this.height = args['height'];


        this.darksMesh = new BABYLON.Mesh('darks', scene);
        this.darksMesh.material = new BABYLON.StandardMaterial('darks', scene);
        this.darksMesh.parent = this;
        this.darks.applyToMesh(this.darksMesh, false);

        (<StandardMaterial> this.darksMesh.material).emissiveColor = new BABYLON.Color3(0.4, 0.4, 0.4);


        this.lightsMesh = new BABYLON.Mesh('lights', scene);
        this.lightsMesh.material = new BABYLON.StandardMaterial('lights', scene);
        this.lightsMesh.parent = this;
        this.lights.applyToMesh(this.lightsMesh, false);

        (<StandardMaterial> this.lightsMesh.material).emissiveColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    }



    private buildFloor(index: number): void {
        this.shape.build(index)
    }


    private buildRoof(): void {
        this.shape.buildRoof();
    }

}


export class Building extends BABYLON.Mesh implements IObject {

    public mesh: BABYLON.Mesh;
    public random: Random;

    public lowerScaffold: BuildingSectionScaffold;
    public upperScaffold: BuildingSectionScaffold;
    public isSmall: boolean;
    public args: object = {};


    constructor(seed: number, name: string, scene: BABYLON.Scene, parent: BABYLON.Mesh) {
        super(name, scene, parent);
        this.random = new Random(seed);
        this.isSmall = this.random.boolean;

        if (this.isSmall) {
            this.lowerScaffold = new BuildingSectionScaffold(this.random, 'lowerScaffold', scene, this,
                    true, this.args);
        } else {
            this.lowerScaffold = new BuildingSectionScaffold(this.random, 'lowerScaffold', scene, this,
                    false, this.args);

            const upperPos: Vector3 = this.args['nextPosition'];
            this.upperScaffold = new BuildingSectionScaffold(this.random, 'upperScaffold', scene, this,
                    true, this.args);
            this.upperScaffold.position = upperPos;
        }

    }


    public onLoad(): void {
    }

    public onGrab(): void {
    }

    public onFree(): void {
    }

    public onRender(): void {
        this.rotation.y += 0.01;
    }



    public static VertexData(): BABYLON.VertexData {
        const result: BABYLON.VertexData = new BABYLON.VertexData();

        result.positions = [];
        result.indices = [];
        result.normals = [];
        result.colors = [];

        return result;
    }

}






