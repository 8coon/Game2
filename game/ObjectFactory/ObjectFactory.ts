

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

    public objects: Map<string, Allocated> = new Map<string, Allocated>();
    public objectFactories: Map<string, IObjectProto> = new Map<string, IObjectProto>();


    public addObject(name: string, amount: number, factory: TFactory): void {
        this.objectFactories.set(name, {name, amount, factory});
    }


    public hasObject(name: string): boolean {
        return this.objectFactories.has(name);
    }


    public addObjectIfNone(name: string, amount: number, factory: TFactory): void {
        if (!this.hasObject(name)) {
            this.addObject(name, amount, factory);
        }
    }


    public load(): void {
        this.objectFactories.forEach((objectProto: IObjectProto, name: string) => {
            this.objects.set(name, new Allocated());

            for (let i = 0; i < objectProto.amount; i++) {
                const object: IObject = objectProto.factory();
                (<any> object).renderingGroupId = 1;

                this.objects.get(name).objects.push(object);
                this.free(name, object);
            }
        });
    }


    public notifyLoaded(): void {
        this.objects.forEach((allocated: Allocated) => {
            allocated.objects.forEach((object: IObject) => {
                object.onLoad();
            });
        });
    }


    public notifyRendered(): void {
        this.objects.forEach((allocated: Allocated) => {
            allocated.objects.forEach((object: IObject) => {
                if (!object['_free']) {
                    object.onRender();
                }
            });
        });
    }


    public grab(name: string): IObject {
        const alloc: Allocated = this.objects.get(name);

        if (alloc.free.length === 0) {
            throw new Error(`All meshes of type "${name}" are allocated!`);
        }

        const object: IObject = alloc.free.pop();
        object['_free'] = false;
        object.onGrab();

        return object;
    }


    public free(name: string, object: IObject) {
        const alloc: Allocated = this.objects.get(name);

        object.onFree();
        object['_free'] = true;
        alloc.free.push(object);
    }

}
