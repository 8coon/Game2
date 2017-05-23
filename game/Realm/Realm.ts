import BABYLON from "../../static/babylon";
import {RealmScene} from "./RealmScene";
import {Camera} from "../Camera/Camera";
import {ResourceManager, ResourceRetrievalMode} from "../ResourceManager/ResourceManager";
import {ObjectFactory} from "../ObjectFactory/ObjectFactory";
import {RealmSky} from "./RealmSky";
import {RealmState} from "./RealmState";
import {TestState} from "../States/TestState";


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

    private states: Map<string, RealmState> = new Map<string, RealmState>();
    public state: RealmState;


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
            this.loadStates();
            let oldMillis: number = RealmClass.now();

            this.engine.runRenderLoop(() => {
                const newMillis: number = RealmClass.now();

                this.timeDelta = newMillis - oldMillis;
                this.animModifier = this.timeDelta / (1000 / 60);
                this.fps = Math.floor(60 * this.animModifier);
                this.render();

                oldMillis = newMillis;
            });

            let i = 0;
            window.setInterval(() => {
                this.changeState(['first', 'second', 'third'][i]);
                i++;

                if (i > 2) {
                    i = 0;
                }
            }, 2000);

            window.setInterval(() => {
                this.camera.vibrate(0.8, 1900);
            }, 2000);
        });
    }


    public changeState(name: string): void {
        if (this.state) {
            this.state.onLeave();
        }

        this.state = this.getState(name);
        this.camera.lookAtDirection(this.state.alpha);
        this.state.onEnter();
    }


    public addState(state: RealmState): void {
        this.states.set(state.name, state);
    }

    public getState(name: string): RealmState {
        return this.states.get(name);
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

    public calculateAnim(initValue: number, oldValue: number, newValue: number, frames: number): number {
        const delta: number = (newValue - initValue) / frames;
        const curDelta: number = newValue - oldValue;

        if (Math.abs(curDelta) < Math.abs(delta)) {
            return newValue;
        }

        return oldValue + delta;
    }

    public calculateVectorAnim(initVector: BABYLON.Vector3, oldVector: BABYLON.Vector3, newVector: BABYLON.Vector3,
            frames: number): BABYLON.Vector3 {
        return new BABYLON.Vector3(
            this.calculateAnim(initVector.x, oldVector.x, newVector.x, frames),
            this.calculateAnim(initVector.y, oldVector.y, newVector.y, frames),
            this.calculateAnim(initVector.z, oldVector.z, newVector.z, frames),
        );
    }

    public randItem(array: any[]): any {
        return array[Math.floor(Math.random() * array.length)];
    }


    private loadSky(): void {
        this.sky = new RealmSky('sky', this.scene);
    }


    private loadStates(): void {
        this.addState(new TestState('first', this.scene));
        this.addState(new TestState('second', this.scene));
        this.addState(new TestState('third', this.scene));
    }

}
