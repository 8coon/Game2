import {RealmClass} from "../game/Realm/Realm";
import {JSWorksLib} from "jsworks/dist/dts/jsworks";
import {SimpleVirtualDOMElement} from "jsworks/dist/dts/VirtualDOM/SimpleVirtualDOM/SimpleVirtualDOMElement";
import {UserModel} from "../models/UserModel";


declare let Realm: RealmClass;
declare const JSWorks: JSWorksLib;

export abstract class AbstractController {

    public gameCanvasId: string = 'game-canvas';

    public onNavigate(args?: object): void {
        if (!Realm) {
            Realm = new RealmClass(this.gameCanvasId);
            Realm.init();
        }
    }

}
