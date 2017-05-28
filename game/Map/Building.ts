import BABYLON from "../../static/babylon";
import {RealmClass} from "../Realm/Realm";
import {IObject} from "../ObjectFactory/ObjectFactory";
import FastSimplexNoise from "../../node_modules/fast-simplex-noise/src";
import {Random} from "./OfflineMap";
import Vector2 = BABYLON.Vector2;
import Vector3 = BABYLON.Vector3;


declare const Realm: RealmClass;


/*
 function drawTriangle(scene) {

 //Let's create a mesh for our element:
 var mesh = new BABYLON.Mesh('triangle', scene);

 //Then, the points for the triangle element:
 var positions = [
 -0.5, -0.5, 0,
 0, 0.5, 0,
 0.5, -0.5, 0
 ];

 //Next, we create the normals (orientation):
 var normals = [
 1, 1, 1,
 1, 1, 1,
 1, 1, 1
 ];

 //Next, we create the normals (orientation):
 var colors = [
 0, 1, 0, 1,
 1, 0, 0, 1,
 0, 0, 1, 1
 ];


 //And the indices, for the points order:
 var indices = [];
 indices.push(0);
 indices.push(1);
 indices.push(2);


// Make a new mesh shaper device.
var vertexData = new BABYLON.VertexData();

// stuff its buffers with your stuff
vertexData.positions = positions;
vertexData.indices = indices;
vertexData.normals = normals;
vertexData.colors = colors;
// vertexData.uvs = uvs;

// Use the vertexData object.. to shape-ify the mesh
vertexData.applyToMesh(mesh, 1);

return mesh;
}
*/


/*export enum BuildingShape {
    RECTANGULAR,
    SQUARE,
    HEXAGON,
    COMPLEX_1,
}*/


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

/*
 if (!this.isSmall) {
 this.sections = 2 + Math.round(this.random.number * 3);
 }
 */

export abstract class Builder {

    public positions: number[];
    public normals: number[];
    public colors: number[];
    public indices: number[];
    public random: Random;

    constructor(random: Random, positions: number[], normals: number[], colors: number[], indices: number[]) {
        this.positions = positions;
        this.normals = normals;
        this.colors = colors;
        this.indices = indices;
        this.random = random;
    }

    public abstract build(index: number): void;

    public concatVector(arr: number[], v: Vector3): void {
        arr.push(v.x, v.y, v.z);
    }

    public concatIndices(arr: number[], offset: number): void {
        this.indices['_offset'] = this.indices['_offset'] || 0;
        arr.map(index => this.indices['_offset'] + index).forEach(index => this.indices.push(index));
        this.indices['_offset'] += offset;
    }

    public concatColor(color: BABYLON.Color4): void {
        this.colors.push(color.r, color.g, color.b, color.a);
    }

}


export abstract class WallBuilder extends Builder {
    public readonly wallColor: BABYLON.Color4 = new BABYLON.Color4(45/255, 49/255, 61/255, 1);

    public build(index: number): void {};
    public abstract buildWall(leftBottom: Vector3, leftTop: Vector3, rightTop: Vector3,
                          rightBottom: Vector3): void;
}


export class BlankWallBuilder extends  WallBuilder {
    public buildWall(leftBottom: Vector3, leftTop: Vector3, rightTop: Vector3,
                              rightBottom: Vector3): void {
        const normal: Vector3 = Vector3.Cross(
                rightTop.subtract(leftTop), leftBottom.subtract(leftTop)
        ).normalize();

        this.concatVector(this.positions, leftBottom);
        this.concatVector(this.positions, leftTop);
        this.concatVector(this.positions, rightTop);
        this.concatVector(this.positions, rightBottom);

        for (let i = 0; i < 4; i++) {
            this.concatVector(this.normals, normal);
            this.concatColor(this.wallColor);
        }

        this.concatIndices([2, 1, 0, 0, 3, 2], 4);
    }
}


export abstract class BuildingShapeBuilder extends Builder {
    public readonly floorHeight: number = 2;
}


export class RectangularBuildingShapeBuilder extends BuildingShapeBuilder {
    public xParam: number = this.random.range(10, 20, false);
    public zParam: number = this.random.range(10, 20, false);
    public walls: WallBuilder[];

    public build(index: number): void {
        if (!this.walls) {
            this.walls = [];
            const builders: any[] = [BlankWallBuilder];

            for (let i = 0; i < 4; i++) {
                this.walls.push(new (this.random.choice(builders))(
                    this.random, this.positions, this.normals, this.colors, this.indices
                ));
            }
        }

        const y: number = index * this.floorHeight;
        const leftNearBottom: Vector3 = new Vector3(-this.xParam, y, -this.zParam);
        const leftFarBottom: Vector3 = leftNearBottom.add(new Vector3(2 * this.xParam, 0, 0));
        const rightFarBottom: Vector3 = leftFarBottom.add(new Vector3(0, 0, 2 * this.zParam));
        const rightNearBottom: Vector3 = rightFarBottom.subtract(new Vector3(2 * this.xParam, 0, 0));

        const topVector: Vector3 = new Vector3(0, this.floorHeight, 0);
        const leftNearTop: Vector3 = leftNearBottom.add(topVector);
        const leftFarTop: Vector3 = leftFarBottom.add(topVector);
        const rightFarTop: Vector3 = rightFarBottom.add(topVector);
        const rightNearTop: Vector3 = rightNearBottom.add(topVector);

        this.walls[0].buildWall(leftNearBottom, leftNearTop, leftFarTop, leftFarBottom);
        this.walls[1].buildWall(leftFarBottom, leftFarTop, rightFarTop, rightFarBottom);
        this.walls[2].buildWall(rightFarBottom, rightFarTop, rightNearTop, rightNearBottom);
        this.walls[3].buildWall(rightNearBottom, rightNearTop, leftNearTop, leftNearBottom);
    }
}


export class SquareBuildingShapeBuilder extends RectangularBuildingShapeBuilder {
    public build(index: number): void {
        this.xParam = this.zParam;

        super.build(index);
    }
}


export class HexagonBuildingShapeBuilder extends BuildingShapeBuilder {
    public build(index: number): void {

    }
}


export class Complex1BuildingShapeBuilder extends BuildingShapeBuilder {
    public build(index: number): void {

    }
}




export class BuildingSectionScaffold extends BABYLON.Mesh {

    public positions: number[] = [];
    public normals: number[] = [];
    public colors: number[] = [];
    public indices: number[] = [];

    public floors: number;
    public isSmall: boolean = true;
    public shape: BuildingShapeBuilder;

    public random: Random;


    constructor(random: Random, name: string, scene: BABYLON.Scene, parent: BABYLON.Mesh,
                isSmall: boolean) {
        super(name, scene, parent);
        this.random = random;
        this.isSmall = isSmall;

        let shapes: any[] = [RectangularBuildingShapeBuilder, SquareBuildingShapeBuilder];

        if (!this.isSmall) {
            shapes.concat([HexagonBuildingShapeBuilder, Complex1BuildingShapeBuilder]);
        }

        this.shape = new (this.random.choice(shapes))
                (this.random, this.positions, this.normals, this.colors, this.indices);
        this.floors = this.random.range(30, 80);

        for (let i = 0; i < this.floors; i++) {
            this.buildFloor(i);
        }


        const vertexData = new BABYLON.VertexData();

        vertexData.positions = this.positions;
        vertexData.indices = this.indices;
        vertexData.normals = this.normals;
        vertexData.colors = this.colors;

        vertexData.applyToMesh(this, false);
    }


    private buildFloor(index: number): void {
        this.shape.build(index)
    }

}


export class Building extends BABYLON.Mesh implements IObject {

    public mesh: BABYLON.Mesh;
    public random: Random;

    public scaffold: BuildingSectionScaffold;


    constructor(seed: number, name: string, scene: BABYLON.Scene, parent: BABYLON.Mesh) {
        super(name, scene, parent);
        this.random = new Random(seed);

        this.scaffold = new BuildingSectionScaffold(this.random, 'scaffold', scene, this, true);
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

}






