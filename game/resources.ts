import {RealmClass} from "./Realm/Realm";
import {ResourceType} from "./ResourceManager/ResourceManager";


declare const Realm: RealmClass;


window.addEventListener('ResourceLoad', () => {

    //Realm.resources.addResource('spaceFragmentShader', ResourceType.SHADER, '/shaders/space.fragment.glsl');
    //Realm.resources.addResource('spaceVertexShader', ResourceType.SHADER, '/shaders/space.vertex.glsl');

});

