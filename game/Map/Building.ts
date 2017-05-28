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

    protected buildBlankWall(leftBottom: Vector3, leftTop: Vector3, rightTop: Vector3,
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


export class BlankBuilder extends WallBuilder {
    public buildWall(leftBottom: Vector3, leftTop: Vector3, rightTop: Vector3,
                     rightBottom: Vector3): void {
        this.buildBlankWall(leftBottom, leftTop, rightTop, rightBottom);
    }
}


export class BlankWallBuilder extends WallBuilder {
    public buildWall(leftBottom: Vector3, leftTop: Vector3, rightTop: Vector3,
                     rightBottom: Vector3): void {
        this.buildBlankWall(leftBottom, leftTop, rightTop, rightBottom);


    }
}


export abstract class BuildingShapeBuilder extends Builder {
    public readonly floorHeight: number = 4;

    protected buildWallAligned(start: Vector3, height: number, width: number, align: Vector3,
                               builder: WallBuilder, initOffset: number, index: number, vertIndex: number,
                               customStart?: Vector3, customEnd?: Vector3): void {
        const alignNormalized: Vector3 = align.clone().normalize();
        let alignStart: Vector3 = start.add(alignNormalized.clone().scale(initOffset + width * index));
        let alignEnd: Vector3 = start.add(alignNormalized.clone().scale(initOffset + width * (index + 1)));

        if (customStart && customEnd) {
            alignStart = customStart;
            alignEnd = customEnd;
        }

        const nearBottom: Vector3 = new Vector3(alignStart.x, height * vertIndex, alignStart.z);
        const farBottom: Vector3 = new Vector3(alignEnd.x, height * vertIndex, alignEnd.z);
        const farTop: Vector3 = farBottom.add(new Vector3(0, height, 0));
        const nearTop: Vector3 = nearBottom.add(new Vector3(0, height, 0));

        builder.buildWall(nearBottom, nearTop, farTop, farBottom);
    }
}


export class RectangularBuildingShapeBuilder extends BuildingShapeBuilder {
    public xParam: number = this.random.range(10, 20, false);
    public zParam: number = this.random.range(10, 20, false);
    public walls: WallBuilder[];


    public build(index: number): void {
        /*if (!this.walls) {
            this.walls = [];
            const builders: any[] = [BlankBuilder, BlankWallBuilder];

            for (let i = 0; i < 4; i++) {
                this.walls.push(new (this.random.choose(builders))(
                    this.random, this.positions, this.normals, this.colors, this.indices
                ));
            }
        }*/
        const builders: any[] = [BlankBuilder, BlankWallBuilder];

        const patterns: WallBuilder[][] = [];
        const xTiles: number = Math.floor(this.xParam / this.floorHeight);
        const zTiles: number = Math.floor(this.zParam / this.floorHeight);

        const xPattern: WallBuilder[] = [];
        for (let i = 0; i < xTiles; i++) {
            xPattern.push(new (this.random.choose(builders))
                    (this.random, this.positions, this.normals, this.colors, this.indices));
        }
        const zPattern: WallBuilder[] = [];
        for (let i = 0; i < zTiles; i++) {
            zPattern.push(new (this.random.choose(builders))
                    (this.random, this.positions, this.normals, this.colors, this.indices));
        }

        patterns.push(xPattern, zPattern, xPattern, zPattern);
        this.buildPatterns(index, patterns);
    }


    // Pattern order is: left, top, right, bottom
    protected buildPatterns(index: number, patterns: WallBuilder[][]): void {
        const leftStart: Vector3 = new Vector3(-this.xParam, index * this.floorHeight, -this.zParam);
        const leftAlign: Vector3 = new Vector3(2 * this.xParam, 0, 0);

        const topStart: Vector3 = leftStart.add(leftAlign);
        const topAlign: Vector3 = new Vector3(0, 0, 2 * this.zParam);

        const rightStart: Vector3 = topStart.add(topAlign);
        const rightAlign: Vector3 = new Vector3(-2 * this.xParam, 0, 0);

        const bottomStart: Vector3 = rightStart.add(rightAlign);
        const bottomAlign: Vector3 = new Vector3(0, 0, -2 * this.zParam);


        const blankBuilder: BlankBuilder = new BlankBuilder(this.random, this.positions, this.normals,
                this.colors, this.indices);
        const order: Vector3[][] = [ [leftStart, leftAlign], [topStart, topAlign], [rightStart, rightAlign],
                [bottomStart, bottomAlign] ];

        order.forEach((order: Vector3[], i: number) => {
            const offset: number = order[1].length() - Math.floor(patterns[i].length * this.floorHeight);

            this.buildWallAligned(order[0], this.floorHeight, this.floorHeight, order[1], blankBuilder,
                    offset, 0, index, order[0], order[0].add(order[1].clone().normalize().scale(offset)));

            patterns[i].forEach((builder: WallBuilder, j: number) => {
                this.buildWallAligned(order[0], this.floorHeight, this.floorHeight, order[1], builder,
                        offset, j, index);
            });

            this.buildWallAligned(order[0], this.floorHeight, this.floorHeight, order[1], blankBuilder,
                    offset, 0, index,
                    order[0].add(order[1]).subtract(order[1].clone().normalize().scale(offset)),
                    order[0].add(order[1]));
        });
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

        this.shape = new (this.random.choose(shapes))
                (this.random, this.positions, this.normals, this.colors, this.indices);
        this.floors = this.random.range(10, 20);

        for (let i = 0; i < this.floors; i++) {
            this.buildFloor(i);
        }


        const vertexData = new BABYLON.VertexData();

        vertexData.positions = this.positions;
        vertexData.indices = this.indices;
        vertexData.normals = this.normals;
        //vertexData.colors = this.colors;

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






