import BABYLON from "../../static/babylon";


export class RealmClass {

    public canvas: HTMLCanvasElement;
    public engine: BABYLON.Engine;


    constructor(canvasId: string) {
        this.canvas = <HTMLCanvasElement> document.querySelector(`#${canvasId}`);
        this.engine = new BABYLON.Engine(this.canvas, true);
    }

}
