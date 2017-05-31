import BABYLON from "../../static/babylon";
import ShaderMaterial = BABYLON.ShaderMaterial;
import AbstractMesh = BABYLON.AbstractMesh;
import {RealmClass} from "../Realm/Realm";
import {StarShip} from "./StarShip";


declare const Realm: RealmClass;


export class NPCStarShip extends StarShip {

    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene, false);
    }

}