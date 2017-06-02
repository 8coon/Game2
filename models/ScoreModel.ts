import {JSWorksLib} from "jsworks/dist/dts/jsworks";
import {IModel} from "jsworks/dist/dts/Model/IModel";
import {IQuery} from "../helpers/QueryBuilder";


declare const JSWorks: JSWorksLib;

export interface ScoreModelFields {
    user_login: number;
    name: string;
}

@JSWorks.Model
export class ScoreModel implements IModel, ScoreModelFields {

    @JSWorks.ModelField
    user_login: number;

    @JSWorks.ModelField
    name: string;

    public total: number = 0;


    public query(params: IQuery): Promise<ScoreModel[]> {
        return new Promise<ScoreModel[]>((resolve, reject) => {
            (<IModel> this).jsonParser.parseURLAsync(JSWorks.config['backendURL'] +
                `/scores/select`,
                JSWorks.HTTPMethod.POST,
                JSON.stringify(params),
                { 'Content-Type': 'application/json' },
            ).then((data: any) => {
                const models: ScoreModel[] = [];

                data.entries.forEach((item) => {
                    models.push((<any> this).from(item));
                    models[models.length - 1].total = data.total;
                });

                resolve(models);
            }).catch((err) => {
                reject(err);
            });
        });
    }
}