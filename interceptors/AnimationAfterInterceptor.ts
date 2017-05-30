

import {JSWorksLib} from "jsworks/dist/dts/jsworks";

declare const JSWorks: JSWorksLib;

/*
 *  приход
 */
@JSWorks.Interceptor({ type: JSWorks.InterceptorType.RouteAfterNavigateInterceptor })
export class AnimationAfterInterceptor {

    private duration: number = 0.4;
    private selector: string = `
				app-view  form-for > form > .form-group
		`;
    private start: string = '-20%';
    private end: string = '0px';
    private opacityStart: number = 0;
    private opacityEnd: number = 1;
    private timingFunction: string = 'ease-in';

    public intercept(args: object): Promise<any> {

        console.log(args);
        console.log([...(<any> args['nextPage']).view.DOMRoot.querySelectorAll(this.selector)]);
        let rows = [...(<any> args['nextPage']).view.DOMRoot.querySelectorAll(this.selector)];

        let step = 0.1;
        let cur = 0;
        let lastRow = null;

        args['nextPage'].view.DOMRoot.setStyleAttribute("opacity", "1");
        rows.forEach(row => {
            row.setStyleAttribute("left", this.start);
            row.setStyleAttribute("opacity", this.opacityStart);
            cur += step;

            row.setStyleAttribute('transition', `
				left ${this.duration}s ${this.timingFunction} ${cur}s,
				opacity ${this.duration * 0.7}s ease ${cur}s
			`);
            lastRow = row;
        });


        return new Promise((resolve, reject) => {
            window.setTimeout(() => {
                rows.forEach(row => {
                    row.setStyleAttribute('left',this.end);
                    row.setStyleAttribute('opacity',this.opacityEnd);
                });

                resolve();
            }, 20);
        }).then(rs => {
            return Promise.resolve();
        });



    }
}