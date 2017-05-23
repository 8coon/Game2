

export interface IObject {
    onLoad(): void;
    onGrab(): void;
    onFree(): void;
    onRender(): void;
}


class Allocated {
    objects: IObject[] = [];
    free: IObject[] = [];
}


export type TFactory = () => IObject;


interface IObjectProto {
    name: string;
    amount: number;
    factory: TFactory;
}



export class ObjectFactory {

    public objects: object = {};
    public objectFactories: object = {};


    public addObject(name: string, amount: number, factory: TFactory): void {
        this.objectFactories[name] = {name, amount, factory};
    }


    public load(): void {
        Object.keys(this.objectFactories).forEach((name: string) => {
            const objectProto = <IObjectProto> this.objectFactories[name];

            this.objects[name] = new Allocated();

            for (let i = 0; i < objectProto.amount; i++) {
                const object: IObject = objectProto.factory();

                this.objects[name].objects.push(object);
                this.free(name, object);
            }
        });
    }


    public notifyLoaded(): void {
        Object.keys(this.objects).forEach((objectName: string) => {
            this.objects[objectName].objects.forEach((object: IObject) => {
                object.onLoad();
            });
        });
    }


    public grab(name: string): IObject {
        const alloc: Allocated = <Allocated> this.objects[name];

        if (alloc.free.length === 0) {
            throw new Error(`All meshes of type "${name}" are allocated!`);
        }

        const object: IObject = alloc.free.pop();
        object.onGrab();

        return object;
    }


    public free(name: string, object: IObject) {
        const alloc: Allocated = <Allocated> this.objects[name];

        object.onFree();
        alloc.free.push(object);
    }

}
