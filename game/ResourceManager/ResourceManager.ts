import BABYLON from "../../static/babylon";
import {JSWorksLib} from "jsworks/dist/dts/jsworks";
import {NetworkService} from "jsworks/dist/dts/Network/NetworkService";
import {HTTPMethod} from "jsworks/dist/dts/Network/HTTPMethod";
import {HTTPResponse} from "jsworks/dist/dts/Network/HTTPResponse";
import {RealmClass} from "../Realm/Realm";


declare const JSWorks: JSWorksLib;
declare const Realm: RealmClass;


export enum ResourceRetrievalMode {
    XHR,
    OFFLINE,
}


export enum ResourceType {
    MODEL,
    TEXTURE,
    AUDIO,
    SHADER,
}


export interface IResource {
    name: string;
    type: ResourceType;
    source: string;
}


export class ResourceManager {

    public mode: ResourceRetrievalMode;
    public baseURL: string;
    public resources: IResource[] = [];


    constructor(mode: ResourceRetrievalMode, baseURL?: string) {
        this.mode = mode;
        this.baseURL = baseURL;
    }


    public addResource(name: string, type: ResourceType, source: string): void {
        this.resources.push({name, type, source});
    }


    public retrieve(): Promise<any> {
        const promises: Promise<any>[] = this.resources.map((resource: IResource) => {
            let promise: Promise<any>;

            switch (resource.type) {

                case ResourceType.SHADER: {
                    promise = this.retrieveShaderTexture(resource);
                } break;

            }

            return promise;
        });

        return Promise.all(promises);
    }


    private retrieveShaderTexture(resource: IResource): Promise<any> {
        return this.retrieveData(`${this.baseURL}${resource.source}`)
            .then((response: HTTPResponse) => {
                BABYLON.Effect.ShadersStore[resource.name] = response.data;
            });
    }


    private retrieveData(url: string): Promise<any> {
        return (<NetworkService> JSWorks.applicationContext.serviceHolder.getServiceByName('Network'))
            .fetchAsync(url, JSWorks.HTTPMethod.GET);
    }


}
