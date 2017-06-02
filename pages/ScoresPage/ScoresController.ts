
import {JSWorksLib} from "jsworks/dist/dts/jsworks";
import {AbstractController} from "../AbstractController";
import {TableComponent} from "../../components/TableComponent/TableComponent";
import {ComponentElement} from "jsworks/dist/dts/CustomElements/ViewElements/ComponentElement";
import {View} from "jsworks/dist/dts/View/View";
import {IQuery, QueryBuilder} from "../../helpers/QueryBuilder";
import {IModel} from "jsworks/dist/dts/Model/IModel";


declare const JSWorks: JSWorksLib;


@JSWorks.Controller
export class ScoresController extends AbstractController {

    public table: TableComponent;
    public view: View;
    public component;

    public query(query: IQuery): Promise<any> {
        return (<IModel> JSWorks.applicationContext.modelHolder.getModel('ScoreModel')).query(query);
    }


    public onNavigate(): void {
        super.onNavigate();

        const element: ComponentElement = <ComponentElement> this.view.DOMRoot.querySelector(`#table`);
        this.table = element.component;


        this.table.controller.onQuery = (table: TableComponent) => {
            table.loading = true;

            this.query(QueryBuilder.build(table)).then((result: any[]) => {
                (<any> table.data).setValues(result);
                table.total = (result[0] || {total: 0}).total;
                (<any> table.columns).update();
                table.controller.refresh();

                table.loading = false;
            }).catch((err) => {
                table.loading = false;
                table.error = err;
            });
        };
    }
}

