

export interface IObject {
    onCreate(): void;
    onGrab(): void;
    onFree(): void;
    onRender(): void;
    onDelete(): void;
}


class Allocated {
    objects: IObject[] = [];
    free: IObject[] = [];
}


export type TFactory = (index?: number) => IObject;


interface IObjectProto {
    name: string;
    amount: number;
    factory: TFactory;
    created: boolean;
}



export class ObjectFactory {

    public objects: Map<string, Allocated> = new Map<string, Allocated>();
    public objectFactories: Map<string, IObjectProto> = new Map<string, IObjectProto>();
    public logging: boolean = false;


    public addObject(name: string, amount: number, factory: TFactory): void {
        this.objectFactories.set(name, {name, amount, factory, created: false});
    }


    public hasObject(name: string): boolean {
        return this.objectFactories.has(name);
    }


    public addObjectIfNone(name: string, amount: number, factory: TFactory): void {
        if (!this.hasObject(name)) {
            this.addObject(name, amount, factory);
        }
    }


    public load(): Promise<any> {
        const promises: Promise<any>[] = [];
        console.log(this.objectFactories.size);

        this.objectFactories.forEach((objectProto: IObjectProto, name: string) => {
            this.objects.set(name, new Allocated());

            for (let i = 0; i < objectProto.amount; i++) {
                this.objectFactories.delete(name);

                promises.push(new Promise<any>((res) => {
                    window.setTimeout(() => {
                        const object: IObject = objectProto.factory(i);
                        (<any> object).renderingGroupId = 1;

                        this.objects.get(name).objects.push(object);
                        this.free(name, object);

                        this.load().then(() => {
                            res();
                        });
                    }, 1);
                }));
            }
        });

        return Promise.all(promises);
    }


    public notifyLoaded(): void {
        this.objects.forEach((allocated: Allocated) => {
            allocated.objects.forEach((object: IObject) => {
                object.onCreate();
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
        if (this.logging) {
            console.log('Grabbing', name);
        }

        const alloc: Allocated = this.objects.get(name);

        if (alloc.free.length === 0) {
            throw new Error(`All meshes of type "${name}" are allocated!`);
        }

        const object: IObject = alloc.free.pop();
        object['_free'] = false;
        object.onGrab();

        return object;
    }


    public free(name: string, object: IObject): void {
        if (this.logging) {
            console.log('Freeing', name);
        }

        const alloc: Allocated = this.objects.get(name);

        if (!alloc || !object) {
            return;
        }

        object.onFree();
        object['_free'] = true;
        alloc.free.push(object);
    }


    public freeAll(name: string): void {
        if (this.logging) {
            console.log('Freeing all of', name);
        }

        const alloc: Allocated = this.objects.get(name);

        if (!alloc) {
            return;
        }

        alloc.objects.forEach((object: IObject) => {
            this.free(name, object);
        });
    }


    public hasFree(name: string): boolean {
        const alloc: Allocated = this.objects.get(name);
        return alloc && alloc.free.length > 0;
    }


    public replaceFreeObject(name: string, newObject: IObject): void {
        const alloc: Allocated = this.objects.get(name);

        if (!alloc || alloc.free.length === 0) {
            return;
        }

        alloc.free.pop().onDelete();
        alloc.free.push(newObject);
        newObject.onCreate();
    }

}
