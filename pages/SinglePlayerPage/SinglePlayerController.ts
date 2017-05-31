import {JSWorksLib} from "jsworks/dist/dts/jsworks";
import {AbstractController} from "../AbstractController";


declare const JSWorks: JSWorksLib;


@JSWorks.Controller
export class SinglePlayerController extends AbstractController {


    public onNavigate(args: object):void {

        super.onNavigate(args);

    }
}