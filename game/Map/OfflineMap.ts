import BABYLON from "../../static/babylon";
import {RealmClass} from "../Realm/Realm";
import {IObject} from "../ObjectFactory/ObjectFactory";


declare const Realm: RealmClass;


export class MapSection extends BABYLON.Mesh implements IObject {

    public static readonly ACTIVE_COLOR: BABYLON.Color3 = new BABYLON.Color3(211/255, 42/255, 156/255);
    public static readonly INACTIVE_COLOR: BABYLON.Color3 = new BABYLON.Color3(99/255, 43/255, 94/255);

    public shape: BABYLON.Mesh;
    public border: BABYLON.Mesh;
    public length: number = 1;
    public colorProgressStep: number = 0.05;
    public colorProgress: number = 0;


    constructor(name: string, scene: BABYLON.Scene, parent: OfflineMap) {
        super(name, scene, parent);

        const trueLength: number = this.length * 1.1;

        this.shape = BABYLON.Mesh.CreateCylinder(
            'shape',
            trueLength,  // height
            0.6, 0.6,  // diameterTop, diameterBottom
            6,  // tessellation
            1,  // subdivisions
            scene,
        );

        this.shape.position.x = -this.length;
        this.shape.rotation.z = 0.5 * Math.PI;
        this.shape.material = new BABYLON.StandardMaterial('shapeMaterial', scene);
        this.shape.parent = this;
        (<any> this.shape.material).diffuseColor = MapSection.INACTIVE_COLOR;
        (<any> this.shape.material).emissiveColor = MapSection.ACTIVE_COLOR;
        (<any> this.shape.material).emissiveIntensity = 0.0;
        (<any> this.shape.material).alpha = 0.9;
    }


    public afterSection(lastSection: MapSection, rotation: BABYLON.Vector3): void {
        this.rotation = rotation;
        this.position = lastSection.position.add(lastSection.getEndVector());

        this.colorProgress = lastSection.colorProgress - lastSection.colorProgressStep;
        if (this.colorProgress < 0) {
            this.colorProgress = Math.PI;
        }
    }


    public getEndVector(): BABYLON.Vector3 {
        const matrix: BABYLON.Matrix = Realm.getTranslationMatrix(this, null, null, BABYLON.Vector3.Zero());
        const vector: BABYLON.Vector3 = new BABYLON.Vector3(-this.length, 0, 0);

        return BABYLON.Vector3.TransformCoordinates(vector, matrix);
    }


    public onLoad(): void {
    }

    public onGrab(): void {
        this.isVisible = true;
    }

    public onFree(): void {
        this.isVisible = false;
    }

    public onRender(): void {
        let ratio: number = Math.sin(this.colorProgress);
        ratio = Math.round(ratio * 3) / 3;

        (<any> this.shape.material).emissiveIntensity = ratio;
        (<any> this.shape.material).alpha = 1 - ratio * 0.7;
        (<any> this.shape.material).emissiveColor = Realm.mixColors(
            MapSection.INACTIVE_COLOR,
            MapSection.ACTIVE_COLOR,
            ratio,
        );

        this.colorProgress += this.colorProgressStep;

        if (this.colorProgress > Math.PI) {
            this.colorProgress = 0;
        }
    }

}


export class Random {

    public seed: number = Math.random() * 10000;

    constructor(seed?: number) {
        if (seed) {
            this.seed = seed;
        }
    }

    public get number(): number {
        const x = Math.sin(this.seed) * 10000;
        this.seed++;

        return x - Math.floor(x);
    }

    public get Vector2(): BABYLON.Vector2 {
        return new BABYLON.Vector2(this.number, this.number);
    }

}


export class SmoothRandom {
    private random: Random;
    private values: number[] = [];


    constructor(smooth: number = 50, seed?: number) {
        this.random = new Random(seed);

        for (let i = 0; i < smooth; i++) {
            this.values.push(this.random.number);
        }
    }


    public get number(): number {
        const result: number = this.values.reduce((sum, val) => sum + val, 0) / this.values.length;

        this.values.splice(0, 1);
        this.values.push(this.random.number);

        return result;
    }

}


export class OfflineMap extends BABYLON.Mesh implements IObject{

    public seed: number;
    public sections: MapSection[] = [];

    private rand1: Random;
    private rand2: Random;
    private v1: BABYLON.Vector2;
    private v2: BABYLON.Vector2;


    constructor(name: string, scene: BABYLON.Scene, parent: BABYLON.Mesh, seed: number) {
        super(name, scene, parent);
        this.seed = seed;

        this.rand1 = new Random(seed);
        this.rand2 = new Random(this.rand1.number);
        this.v1 = this.rand1.Vector2.scale(10000);
        this.v2 = this.rand2.Vector2.scale(10000);

        Realm.objects.addObjectIfNone(`${name}__mapSection`, 101, (): IObject => {
            return new MapSection(`${name}__mapSection`, scene, this);
        });
    }


    public onLoad(): void {
    }

    public onGrab(): void {
        this.testGenerate1();
    }

    public onFree(): void {
        this.sections.forEach(section => Realm.objects.free(`${this.name}__mapSection`, section));
        this.sections = [];
    }

    public onRender(): void {
    }


    public testGenerate1(): void {
        let last: MapSection = <MapSection> Realm.objects.grab(`${this.name}__mapSection`);
        last.position = new BABYLON.Vector3(0, -1, 0);
        this.sections.push(last);

        for (let i = 0; i < 100; i++) {
            const next: MapSection = <MapSection> Realm.objects.grab(`${this.name}__mapSection`);
            next.afterSection(last, this.nextVector());
            this.sections.push(next);

            last = next;
        }
    }


    public generateNextSection(): void {
        Realm.objects.free(`${this.name}__mapSection`, this.sections[0]);

        const next: MapSection = <MapSection> Realm.objects.grab(`${this.name}__mapSection`);
        next.afterSection(this.sections[this.sections.length - 1], this.nextVector());

        this.sections.splice(0, 1);
        this.sections.push(next);
    }


    private nextVector(): BABYLON.Vector3 {
        let value1: number = Realm.perlinNoise(this.v1.x, this.v1.y) * 0.001;
        let value2: number = Realm.perlinNoise(this.v2.x, this.v2.y) * 0.001;

        /*if (value1 >  0.1 * Math.PI) value1 =  0.1 * Math.PI;
        if (value1 < -0.1 * Math.PI) value1 = -0.1 * Math.PI;
        if (value2 >  0.1 * Math.PI) value2 =  0.1 * Math.PI;
        if (value2 < -0.1 * Math.PI) value2 = -0.1 * Math.PI;*/

        const step: number = 0.01;
        this.v1.addInPlace(new BABYLON.Vector2(step, step));
        this.v2.addInPlace(new BABYLON.Vector2(step, step));

        return new BABYLON.Vector3(
            0,
            value1,
            value2,
        );

        /*return new BABYLON.Vector3(
            0,
            this.rand1.number - 0.5,
            this.rand2.number - 0.5,
        ).scale(0.1);*/
    }

}
