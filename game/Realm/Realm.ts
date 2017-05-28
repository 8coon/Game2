import BABYLON from "../../static/babylon";
import {RealmScene} from "./RealmScene";
import {Camera} from "../Camera/Camera";
import {ObjectFactory} from "../ObjectFactory/ObjectFactory";
import {RealmSky} from "./RealmSky";
import {RealmState} from "./RealmState";
import {TestState} from "../States/TestState";
import {LoadingScreen} from "../Loader/LoadingScreen";
import {Loader} from "../Loader/Loader";
import {StarShip} from "../Models/StarShip";
import {OfflineGameState} from "../States/OfflineGameState";


export class RealmClass {

    public meshesLoader: Loader;
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
    public pointerLocked: boolean = false;

    private yMatrix: BABYLON.Matrix = BABYLON.Matrix.RotationY(0.5 * Math.PI);
    private zMatrix: BABYLON.Matrix = BABYLON.Matrix.RotationZ(0.5 * Math.PI);


    public static now(): number {
        return window.performance.now();
    }


    constructor(canvasId: string) {
        this.canvas = <HTMLCanvasElement> document.querySelector(`#${canvasId}`);
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.engine.loadingScreen = new LoadingScreen('');
        this.scene = new RealmScene(this.engine);
        this.camera = new Camera('camera', this.scene);
        this.objects = new ObjectFactory();
        this.meshesLoader = new Loader();

        this.canvas.addEventListener('click', () => {
            if (!this.pointerLocked) {
                this.grabPointerLock();
            }
        });

        if ('onpointerlockchange' in document) {
            document.addEventListener('pointerlockchange', () => { this.pointerLockChanged(); });
        } else if ('onmozpointerlockchange' in document) {
            document.addEventListener('mozpointerlockchange', () => { this.pointerLockChanged(); });
        } else if ('onwebkitpointerlockchange' in document) {
            document.addEventListener('webkitpointerlockchange', () => { this.pointerLockChanged(); });
        }

        this.meshesLoader.taskAdder = (self, name, root, file) => {
            return this.scene.loader.addMeshTask(name, '', root, file);
        };

        this.meshesLoader.resultGetter = (self, task) => {
            task.loadedMeshes[0].setEnabled(false);

            return task.loadedMeshes[0];
        };
    }


    public init(): void {
        this.sky = new RealmSky('sky', this.scene);
        this.loadStates();
        this.objects.load();
        this.scene.load();

        this.meshesLoader.load().then(() => {
            this.notifyLoaded();
            let oldMillis: number = RealmClass.now();

            this.scene.meshes.forEach((mesh: BABYLON.Mesh) => {
                if (mesh['__skybox__']) {
                    mesh.renderingGroupId = 0;
                    return;
                }

                mesh.renderingGroupId = 1;
            });

            this.engine.runRenderLoop(() => {
                const newMillis: number = RealmClass.now();

                this.timeDelta = newMillis - oldMillis;
                // this.animModifier = this.timeDelta / (1000 / 60);
                this.animModifier = 1;
                this.fps = Math.floor(60 * this.animModifier);
                this.render();

                oldMillis = newMillis;
            });

            this.changeState('offlineGame');
            //this.changeState('second');

            //starShip.position.x = -5;
            // starShip.onMeshesLoaded();

            /*let i = 0;
            window.setInterval(() => {
                this.changeState(['first', 'second', 'third'][i]);
                i++;

                if (i > 2) {
                    i = 0;
                }
            }, 2000);

            window.setInterval(() => {
                this.camera.explosionAnimate(0.8, 1900);
            }, 2000);*/
        }); /* .catch((error: string) => {
            console.error(`Failed to load resource: ${error}`);
        }); */
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
        this.objects.notifyRendered();
        this.state.onRender();
        this.camera.onRender();
        this.scene.render();
    }


    private loadStates(): void {
        this.addState(new TestState('first', this.scene));
        this.addState(new TestState('second', this.scene));
        this.addState(new TestState('third', this.scene));
        this.addState(new OfflineGameState('offlineGame', this.scene));
    }


    private notifyLoaded(): void {
        this.objects.notifyLoaded();

        this.states.forEach((value: RealmState) => {
            value.notifyLoaded();
        });
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

        return oldValue + delta * this.animModifier;
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

    public grabPointerLock(): void {
        this.canvas.requestPointerLock = this.canvas.requestPointerLock ||
                (<any> this.canvas).mozRequestPointerLock ||
                (<any> this.canvas).webkitRequestPointerLock;

        this.canvas.requestPointerLock();
    }

    public dropPointerLock(): void {
        (<any> this.canvas).exitPointerLock = (<any> this.canvas).exitPointerLock ||
                (<any> this.canvas).mozExitPointerLock ||
                (<any> this.canvas).webkitExitPointerLock;

        (<any> this.canvas).exitPointerLock();
    }

    public pointerLockChanged(): void {
        this.pointerLocked = !this.pointerLocked;
    }



    public rotationFromDirection(direction: BABYLON.Vector3): BABYLON.Vector3 {
        // Expecting a normalized direction vector

        const x: BABYLON.Vector3 = direction;
        const y: BABYLON.Vector3 = BABYLON.Vector3.TransformCoordinates(x, this.yMatrix);
        const z: BABYLON.Vector3 = BABYLON.Vector3.TransformCoordinates(x, this.zMatrix);

        return BABYLON.Vector3.RotationFromAxis(z, y, x);
    }

    public getTranslationMatrix(node, mul?, scaling?, position?, rotation?) {
        return BABYLON.Matrix.Compose(
            scaling || (node || {}).scaling || new BABYLON.Vector3(1, 1, 1),
            BABYLON.Quaternion.RotationYawPitchRoll(
                rotation || ((node || {}).rotation || {}).y || 0,
                rotation || ((node || {}).rotation || {}).x || 0,
                rotation || ((node || {}).rotation || {}).z || 0,
            ),
            (position || (node || {}).position || BABYLON.Vector3.Zero()).scale(mul || 1),
        );
    }

    public sign(x: number): number {
        return x < 0 ? -1 : 1;
    }

    public mixColors(color1: BABYLON.Color3, color2: BABYLON.Color3, ratio: number): BABYLON.Color3 {
        const revRatio: number = 1 - ratio;

        return new BABYLON.Color3(
            color1.r * ratio + color2.r * revRatio,
            color1.g * ratio + color2.g * revRatio,
            color1.b * ratio + color2.b * revRatio,
        )
    }


    public perlinNoise(x: number, y: number): number {
        const _vec4 = BABYLON.Vector4;
        type vec4 = BABYLON.Vector4;
        const _vec2 = BABYLON.Vector2;
        type vec2 = BABYLON.Vector2;


        const mod4 = (v: vec4, n: number): vec4 => {
            return new _vec4(
                v.x - n * Math.floor(v.x / n),
                v.y - n * Math.floor(v.y / n),
                v.z - n * Math.floor(v.z / n),
                v.w - n * Math.floor(v.w / n),
            );
        }

        const fract4 = (v: vec4): vec4 => {
            return mod4(v, 1);
        };

        const abs4 = (v: vec4): vec4 => {
            return new _vec4(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z), Math.abs(v.w));
        };

        const floor4 = (v: vec4): vec4 => {
            return new _vec4(Math.floor(v.x), Math.floor(v.y), Math.floor(v.z), Math.floor(v.w));
        };

        const dot2 = (v1: vec2, v2: vec2): number => {
            return v1.x * v2.x + v1.y * v2.y;
        };

        const mix2 = (v1: vec2, v2: vec2, a: number): vec2 => {
            return new _vec2(v1.x * (1 - a) + v2.x * a, v1.y * (1 - a) + v2.y * a);
        };

        const mix = (f1: number, f2: number, a: number): number => {
            return f1 * (1 - a) + f2 * a;
        };

        const mul2 = (v1: vec2, v2: vec2): vec2 => {
            return new _vec2(v1.x * v2.x, v1.y * v2.y);
        };

        const mul4 = (v1: vec4, v2: vec4): vec4 => {
            return new _vec4(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z, v1.w * v2.w);
        };


        const permute = (v: vec4): vec4 => {
            return mod4(mul4(v.scale(34).add(new _vec4(1, 1, 1, 1)), v), 289);
        };

        const fade = (t: vec2): vec2 => {
            return mul2(t, mul2(t, mul2(t, mul2(t, t.scale(6).add(new _vec2(15, 15))).add(new _vec2(10, 10)))));
        };


        let Pi: vec4 = floor4(new _vec4(x, y, x, y)).add(new _vec4(0.0, 0.0, 1.0, 1.0));
        let Pf: vec4 = fract4(new _vec4(x, y, x, y)).add(new _vec4(0.0, 0.0, 1.0, 1.0));
        Pi = mod4(Pi, 289.0);

        const ix: vec4 = new _vec4(Pi.x, Pi.z, Pi.x, Pi.z);
        const iy: vec4 = new _vec4(Pi.y, Pi.y, Pi.w, Pi.w);
        const fx: vec4 = new _vec4(Pf.x, Pf.z, Pf.x, Pf.z);
        const fy: vec4 = new _vec4(Pf.y, Pf.y, Pf.w, Pf.w);

        const i: vec4 = permute(permute(ix).add(iy));
        const gx: vec4 = fract4(i.scale(0.0243902439)).scale(2).subtract(new _vec4(1, 1, 1, 1));
        const gy: vec4 = abs4(gx).subtract(new _vec4(0.5, 0.5, 0.5, 0.5));
        const tx: vec4 = floor4(gx.add(new _vec4(0.5, 0.5, 0.5, 0.5)));

        gx.subtractInPlace(tx);
        const g00: vec2 = new _vec2(gx.x, gy.x);
        const g10: vec2 = new _vec2(gx.y, gy.y);
        const g01: vec2 = new _vec2(gx.z, gy.z);
        const g11: vec2 = new _vec2(gx.w, gy.w);

        const norm: vec4 = new _vec4(1.79284291400159, 1.79284291400159, 1.79284291400159, 1.79284291400159)
                .subtract(new _vec4(dot2(g00, g00), dot2(g01, g01), dot2(g10, g10), dot2(g11, g11))
                    .scale(0.85373472095314));
        g00.scaleInPlace(norm.x);
        g01.scaleInPlace(norm.y);
        g10.scaleInPlace(norm.z);
        g11.scaleInPlace(norm.w);

        const n00: number = dot2(g00, new _vec2(fx.x, fy.x));
        const n10: number = dot2(g10, new _vec2(fx.y, fy.y));
        const n01: number = dot2(g01, new _vec2(fx.z, fy.z));
        const n11: number = dot2(g11, new _vec2(fx.w, fy.w));

        const fade_xy: vec2 = fade(new _vec2(Pf.x, Pf.y));
        const n_x: vec2 = mix2(new _vec2(n00, n01), new _vec2(n10, n11), fade_xy.x);
        const n_xy: number = mix(n_x.x, n_x.y, fade_xy.y);

        return 2.3 * n_xy;
    }


    public sleep(millis: number): Promise<any> {
        return new Promise<any>((resolve) => {
            window.setTimeout(() => { resolve() }, millis);
        });
    }

}

