import BABYLON from "../../static/babylon";
import {RealmClass} from "../Realm/Realm";
import {IObject} from "../ObjectFactory/ObjectFactory";
import FastSimplexNoise from "../../node_modules/fast-simplex-noise/src";
import {OfflineGameState} from "../States/OfflineGameState";
import {StarShip} from "../Models/StarShip";


declare const Realm: RealmClass;


export class MapSection extends BABYLON.Mesh implements IObject {

    public static readonly ACTIVE_COLOR: BABYLON.Color3 = new BABYLON.Color3(211/255, 42/255, 156/255);
    public static readonly INACTIVE_COLOR: BABYLON.Color3 = new BABYLON.Color3(99/255, 43/255, 94/255);

    public shape: BABYLON.Mesh;
    public border: BABYLON.Mesh;
    public length: number = 1;
    public colorProgressStep: number = 0.3;
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
        let ratio: number = Math.sin(1.1 * this.colorProgress);
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

    public get boolean(): boolean {
        return this.number < 0.5;
    }


    public random(): number {
        return this.number;
    }

    public range(start: number, end: number, int: boolean = true): number {
        let floor = x => Math.floor(x);
        if (!int) floor = x => x;

        return start + floor(this.number * (end - start));
    }

    public choose(items: any[]): any {
        if (items.length === 0) {
            return undefined;
        }

        return items[Math.floor(this.number * items.length)];
    }

}


export class OfflineMap extends BABYLON.Mesh implements IObject{

    public seed: number;
    public sections: MapSection[] = [];

    private rand1: Random;
    private rand2: Random;
    private v1: BABYLON.Vector2;
    private v2: BABYLON.Vector2;
    private noise: FastSimplexNoise;
    private lastSectionIndex: number = 0;


    constructor(name: string, scene: BABYLON.Scene, parent: OfflineGameState, seed: number) {
        super(name, scene, parent);
        this.seed = seed;

        this.rand1 = new Random(seed);
        this.rand2 = new Random(this.rand1.number);
        this.v1 = this.rand1.Vector2.scale(10000);
        this.v2 = this.rand2.Vector2.scale(10000);
        this.noise = new FastSimplexNoise(this.rand2.number);

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
        const section: MapSection = this.findSection();
        const player: StarShip = (<OfflineGameState> this.parent).offlinePlayer;

        // (<OfflineGameState> this.parent).offlinePlayer.setImmediateAim(section.position);
        //player.mixAim(section.getEndVector().subtract(section.position).negate().add(player.position));
        player.mixAim(section.position);
    }


    private nextSectionIndex(last: number): number {
        if (last === this.sections.length - 1) {
            return 0;
        }

        return last + 1;
    }

    private nextNearestSectionIndex(last: number): number {
        const next: number = this.nextSectionIndex(last);

        if (BABYLON.Vector3.DistanceSquared(
            this.sections[next].position,
            (<OfflineGameState> this.parent).offlinePlayer.position,
        ) > BABYLON.Vector3.DistanceSquared(
            this.sections[last].position,
            (<OfflineGameState> this.parent).offlinePlayer.position,
        )) {
            return undefined;
        }

        return next;
    }

    private findSection(offset: number = 5): MapSection {
        let current: number = this.lastSectionIndex;
        let last: number = current;

        for (; current !== undefined; current = this.nextNearestSectionIndex(current)) {
            last = current;
        }

        this.lastSectionIndex = last;
        return this.sections[this.nextSectionIndex(last + offset)];
    }


    public testGenerate1(): void {
        let last: MapSection = <MapSection> Realm.objects.grab(`${this.name}__mapSection`);
        last.position = new BABYLON.Vector3(0, -40, 0);
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

        this.lastSectionIndex--;
        if (this.lastSectionIndex < 0) {
            this.lastSectionIndex = this.sections.length - 1;
        }
    }


    private nextVector(): BABYLON.Vector3 {
        let value1: number = this.noise.scaled([this.v1.x, this.v1.y]);
        let value2: number = this.noise.scaled([this.v2.x, this.v2.y]);

        const step: number = 0.005;
        this.v1.addInPlace(new BABYLON.Vector2(step, step));
        this.v2.addInPlace(new BABYLON.Vector2(step, step));

        return new BABYLON.Vector3(
            0,
            value1 * 0.5,
            value2 * 0.5,
        );
    }

}
