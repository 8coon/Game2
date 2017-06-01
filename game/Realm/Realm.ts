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
    public fx: BABYLON.HDRRenderingPipeline;

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

        this.canvas.style.height = '100%';
        this.canvas.style.width = '100%';

        /*BABYLON.SceneOptimizer.OptimizeAsync(this.scene,
            BABYLON.SceneOptimizerOptions.HighDegradationAllowed()
        );*/
        this.scene.ambientColor = new BABYLON.Color3(1, 1, 1);

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

        this.objects.load().then(() => {
            this.scene.load();
            this.initFX();

            this.meshesLoader.load().then(() => {
                this.notifyLoaded();
                let oldMillis: number = RealmClass.now();

                this.scene.meshes.forEach((mesh: BABYLON.Mesh) => {
                    if (mesh['__skybox__']) {
                        mesh.renderingGroupId = 0;
                        return;
                    }

                    if (!(mesh instanceof BABYLON.InstancedMesh)) {
                        mesh.renderingGroupId = 1;
                    }
                });

                let even: boolean = true;

                this.engine.runRenderLoop(() => {
                    const newMillis: number = RealmClass.now();

                    this.timeDelta = newMillis - oldMillis;
                    this.animModifier = 1 / (this.timeDelta / (1000 / 60));

                    // document.title = `AM: ${this.animModifier}`;

                    //this.fps = Math.floor(60 / (this.timeDelta / (1000 / 60)));
                    this.fps = Math.floor(60 * this.animModifier);
                    this.animModifier = 1.2;
                    //even = !even;

                    //if (even) {
                        this.render();
                    //}

                    oldMillis = newMillis;
                    document.title = `, FPS: ${this.fps}`;
                });

                this.changeState('offlineGame');
            });
        });
    }


    private initFX(): void {
        /*this.fx = new BABYLON.HDRRenderingPipeline(
            'standard',
            this.scene,
            1.0,
            null,
            [this.camera.camera],
        );*/

        //this.camera.camera.ad

        /*this.fx = new BABYLON.PostProcessRenderPipeline(this.engine, 'fx');
        this.fx._attachCameras([this.camera.camera]);

        const highlights: BABYLON.PostProcess = new BABYLON.PostProcess('LensHighlights', 'lensHighlights',
                ['gain', 'threshold', 'screen_width', 'screen_height'],      // uniforms
                [],     // samplers
                0.2,
                null, BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
                this.engine, false, /*this._dofPentagon ? "#define PENTAGON\n" : *//*'');

        highlights.onApply = (effect: BABYLON.Effect) => {
            effect.setFloat('gain', -0.7);
            effect.setFloat('threshold', 0.7);
            // effect.setTextureFromPostProcess("textureSampler", this._chromaticAberrationPostProcess);
            effect.setFloat('screen_width', (<any> this.engine.getRenderingCanvas()).width);
            effect.setFloat('screen_height', (<any> this.engine.getRenderingCanvas()).height);
        };

        this.fx.addEffect(new BABYLON.PostProcessRenderEffect(
            this.engine,
            'HighlightsEnhancingEffect',
            () => { return highlights; },
            true
        ));*/

        /*this.fx = new BABYLON.LensRenderingPipeline(
            'lens',
            { dof_focus_distance: undefined },
            this.scene,
            1.0,
            [this.camera.camera],
        );*/

        //this.fx.brightThreshold = 0.7;
        //this.fx.exposure = 1.2;
        //(<any> this.fx).HDREnabled = true;
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
        // this.addState(new TestState('first', this.scene));
        // this.addState(new TestState('second', this.scene));
        // this.addState(new TestState('third', this.scene));
        this.addState(new OfflineGameState('offlineGame', this.scene));
    }


    private notifyLoaded(): void {
        this.objects.notifyLoaded();

        this.states.forEach((value: RealmState) => {
            value.notifyLoaded();
        });
    }


    public calculateLag(oldValue: number, newValue: number, lag: number): number {
        lag /= this.animModifier;
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


    public sleep(millis: number): Promise<any> {
        return new Promise<any>((resolve) => {
            window.setTimeout(() => { resolve() }, millis);
        });
    }

}

