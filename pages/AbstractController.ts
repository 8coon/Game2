import {RealmClass} from "../game/Realm/Realm";


declare let Realm: RealmClass;


export abstract class AbstractController {

    public gameCanvasId: string = 'game-canvas';


    public onNavigate(args?: object): void {
        if (!Realm) {
            Realm = new RealmClass(this.gameCanvasId);
        }
    }

}
