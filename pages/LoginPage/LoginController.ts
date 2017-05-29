import {JSWorksLib} from "jsworks/dist/dts/jsworks";
import {AbstractController} from "../AbstractController";
import {View} from "jsworks/dist/dts/View/View";
import {LoginPage} from "./LoginPage";
import {FormForElement} from "jsworks/dist/dts/CustomElements/ViewElements/FormElements/FormForElement";
import {UserModel} from "../../models/UserModel";
import {CurrentUserHelper} from "../../helpers/CurrentUserHelper";
import {FormFieldElement} from "jsworks/dist/dts/CustomElements/ViewElements/FormElements/FormFieldElement";
import {RealmClass} from "../../game/Realm/Realm";


declare const JSWorks: JSWorksLib;
declare let Realm: RealmClass;

@JSWorks.Controller
export class LoginController extends AbstractController {
    public view: View;
    public component: LoginPage;
    public form: FormForElement;



    public onCreate(): void {
        this.form = <FormForElement> this.view.DOMRoot.querySelector('#LoginForm');

        this.form.submitCallback = (): Promise<any> => {
            return (<UserModel> this.form.model)
                .signin()
                .then(result => {
                    CurrentUserHelper.currentUser = Promise.resolve(
                        JSWorks.applicationContext.modelHolder.getModel('UserModel').from(result),
                    );

                    window.setTimeout(() => {
                        JSWorks.applicationContext.router.navigate(
                            JSWorks.applicationContext.routeHolder.getRoute('MainRoute'),
                            {},
                        )
                    });
                })
                .catch(err => {
                    this.component.error = err;
                    this.form.model = JSWorks.applicationContext.modelHolder.getModel('UserModel').from();
                })
        }
    }


    public onNavigate(args: object): void {
        super.onNavigate(args);

        CurrentUserHelper.currentUser.then((user: UserModel) => {
            if (user.loggedIn()) {
                user.logout();
            }
        });

        this.onCreate();
        this.component.loginOrEmail = undefined;

        if (args[':email']) {
            this.component.loginOrEmail = args[':email'];

            this.form.fields.forEach((field: FormFieldElement) => {
                if (field.getAttribute('for') !=='email') {
                    return;
                }

                field.value = args[':email'];
            })
        }
    }
}