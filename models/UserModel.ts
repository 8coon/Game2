

import {JSWorksLib} from "jsworks/dist/dts/jsworks";
import {IModel} from "jsworks/dist/dts/Model/IModel";

declare const JSWorks: JSWorksLib;

export interface UserModelFields {
    id: number;
    login: string;
    email: string,
    password?: string;
}

@JSWorks.Model
export class UserModel implements UserModelFields, IModel {

    @JSWorks.ModelField
    @JSWorks.ModelPrimaryKey
    id: number;


    @JSWorks.ModelField
    login: string;

    @JSWorks.ModelField
    email: string;

    @JSWorks.ModelField
    password: string;


    public create(): Promise<UserModel> {
        return new Promise<UserModel>((resolve, reject) => {
            (<IModel> this).jsonParser.parseURLAsync(
                JSWorks.config['backendURL'] + `/user/create`,
                JSWorks.HTTPMethod.POST,
                JSON.stringify((<IModel> this).gist()),
                { 'Content-Type': 'application/json' },
            ).then((data) => {
                resolve(<UserModel> (<IModel> this).from(data));
            }).catch((err) => {
                reject(err);
            });
        });
    }

}