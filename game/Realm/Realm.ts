import BABYLON from "../../static/babylon";
import {RealmScene} from "./RealmScene";
import {Camera} from "../Camera/Camera";
import {ResourceManager, ResourceRetrievalMode} from "../ResourceManager/ResourceManager";
import {ObjectFactory} from "../ObjectFactory/ObjectFactory";
import {RealmSky} from "./RealmSky";


export class RealmClass {

    public resources: ResourceManager;
    public canvas: HTMLCanvasElement;
    public engine: BABYLON.Engine;
    public scene: RealmScene;
    public camera: Camera;
    public objects: ObjectFactory;
    public sky: RealmSky;

    public fps: number = 0;
    public timeDelta: number = 0;
    public animModifier: number = 0;


    public static now(): number {
        return window.performance.now();
    }


    constructor(canvasId: string) {
        this.canvas = <HTMLCanvasElement> document.querySelector(`#${canvasId}`);
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new RealmScene(this.engine);
        this.camera = new Camera('camera', this.scene);
        this.resources = new ResourceManager(ResourceRetrievalMode.XHR, '/static');
        this.objects = new ObjectFactory();
    }


    public init(): void {
        window.dispatchEvent(new Event('ResourceLoad'));

        this.resources.retrieve().then(() => {
            this.loadSky();
            let oldMillis: number = RealmClass.now();

            this.engine.runRenderLoop(() => {
                const newMillis: number = RealmClass.now();

                this.timeDelta = newMillis - oldMillis;
                this.animModifier = this.timeDelta / (1000 / 60);
                this.fps = Math.floor(60 * this.animModifier);
                this.render();

                oldMillis = newMillis;
            });

            window.setInterval(() => {
                const step = Math.PI / 10;
                const alphas = Array.from(<any>(function* () { for (let i = -5; i < 5; i++) yield i; })())
                        .map(x => <any> x * step);

                this.camera.lookAtDirection(this.randItem(alphas));
            }, 1000);

            const cubeX1: BABYLON.Mesh = BABYLON.Mesh.CreateBox('cubeX1', 1, this.scene);
            cubeX1.position = new BABYLON.Vector3(5, 0, 0);
            cubeX1.material = new BABYLON.StandardMaterial('cubeX1Material', this.scene);
            cubeX1.renderingGroupId = 1;
            (<any> cubeX1.material).emissiveColor = new BABYLON.Color3(1.0, 0, 0);
            (<any> cubeX1.material).diffuseColor = (<any> cubeX1.material).emissiveColor;

            const cubeX2: BABYLON.Mesh = BABYLON.Mesh.CreateBox('cubeX2', 1, this.scene);
            cubeX2.position = new BABYLON.Vector3(-5, 0, 0);
            cubeX2.material = new BABYLON.StandardMaterial('cubeX2Material', this.scene);
            cubeX2.renderingGroupId = 1;
            (<any> cubeX2.material).emissiveColor = new BABYLON.Color3(0, 1.0, 0);
            (<any> cubeX2.material).diffuseColor = (<any> cubeX2.material).emissiveColor;
        });
    }


    public render(): void {
        this.camera.onRender();
        this.scene.render();
    }


    public calculateLag(oldValue: number, newValue: number, lag: number): number {
        return (oldValue * lag + newValue) / (lag + 1);
    }

    public calculateVectorLag(oldVector: BABYLON.Vector3, newVector: BABYLON.Vector3, lag: number): BABYLON.Vector3 {
        return new BABYLON.Vector3(
            this.calculateLag(oldVector.x, newVector.x, lag),
            this.calculateLag(oldVector.y, newVector.y, lag),
            this.calculateLag(oldVector.z, newVector.z, lag),
        )
    }

    public randItem(array: any[]): any {
        return array[Math.floor(Math.random() * array.length)];
    }


    private loadSky(): void {
        this.sky = new RealmSky('sky', this.scene);
    }

}
