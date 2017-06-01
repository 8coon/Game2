import {RealmClass} from "../game/Realm/Realm";
import {JSWorksLib} from "jsworks/dist/dts/jsworks";
import {SimpleVirtualDOMElement} from "jsworks/dist/dts/VirtualDOM/SimpleVirtualDOM/SimpleVirtualDOMElement";
import {UserModel} from "../models/UserModel";


declare let Realm: RealmClass;
declare const JSWorks: JSWorksLib;


export abstract class AbstractController {

    public gameCanvasId: string = 'game-canvas';
    private pointerLockSet: boolean = false;


    public onNavigate(args?: object): void {

        if (!JSWorks.config['serviceWorkerEnabled'] && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/static/serviceWorker/serviceWorker.js')
                .then((registration) => {
                    console.log('ServiceWorker registration', registration);
                    JSWorks.config['serviceWorkerEnabled'] = true;
                })
                .catch((err) => {
                    console.error(err);
                });
        } else {
            JSWorks.config['serviceWorkerEnabled'] = true;
        }

        if (!Realm) {
            Realm = new RealmClass(this.gameCanvasId);
            Realm.init();
        }

        if (this.pointerLockSet) {
            return;
        }

        document.querySelector('app-main').addEventListener('click', () => {
            Realm.setPointerLock();
        });

        this.pointerLockSet = true;
    }

}
