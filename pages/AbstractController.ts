import {RealmClass} from "../game/Realm/Realm";
import {JSWorksLib} from "jsworks/dist/dts/jsworks";


declare let Realm: RealmClass;
declare const JSWorks: JSWorksLib;


export abstract class AbstractController {

    public gameCanvasId: string = 'game-canvas';
    public isGame: boolean = false;
    private pointerLockSet: boolean = false;


    public onNavigate(args?: object): void {
        if (!Realm) {
            Realm = new RealmClass(this.gameCanvasId);
            Realm.init();
        } else {
            Realm.changeState('menu');
        }

        if (!this.isGame || this.pointerLockSet) {
            return;
        }

        document.querySelector('.game-content').addEventListener('click', () => {
            Realm.setPointerLock();
        });

        this.pointerLockSet = true;
    }

}
