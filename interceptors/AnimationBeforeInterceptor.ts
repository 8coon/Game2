
import {JSWorksLib} from "jsworks/dist/dts/jsworks";

declare const JSWorks: JSWorksLib;


/*
 * уход
 */
@JSWorks.Interceptor({ type: JSWorks.InterceptorType.RouteBeforeNavigateInterceptor })
export class AnimationBeforeInterceptor {

    private duration: number = 0.4;
    private selector: string = `
				app-view  form-for > form >
		`;
    private start: string = '0';
    private end: string = '20%';
    private opacityStart: number = 1;
    private opacityEnd: number = 0;
    private timingFunction: string = 'ease-out';

    public intercept(args: object): Promise<any> {

        console.log(args);
        // console.log([...(<any> args['nextPage']).view.DOMRoot.querySelectorAll(this.selector)]);
        if (!args['prevPage']) {
            return Promise.resolve();
        }
        let rows = [...(<any> args['prevPage']).view.DOMRoot.querySelectorAll(this.selector)];

        let step = 0.1;
        let cur = 0.02;
        let lastRow = null;

        rows.forEach(row => {
            row.setStyleAttribute("left", this.start);
            row.setStyleAttribute("opacity", this.opacityStart);
            // console.log(row);
            cur += step;

            row.setStyleAttribute('transition', `
				left ${this.duration}s ${this.timingFunction} ${cur}s,
				opacity ${this.duration * 0.7}s ease ${cur}s
			`);
            lastRow = row;
        });

        window.setTimeout(() => {
            rows.forEach(row => {
                row.setStyleAttribute('left',this.end);
                row.setStyleAttribute('opacity',this.opacityEnd);
            });
        }, 20);

        args['nextPage'].view.DOMRoot.setStyleAttribute("opacity", "0");

        return Promise.resolve();
    }
}
