import BABYLON from "../../static/babylon";


class Allocated {
    meshes: BABYLON.Mesh[] = [];
    free: BABYLON.Mesh[] = [];
}


interface IObjectProto {
    name: string;
    amount: number;
    factory: () => BABYLON.Mesh;
}



export class ObjectFactory {

    public objects: object;
    public objectFactories: object = {};


    public addObject(name: string, amount: number, factory: () => BABYLON.Mesh): void {
        this.objectFactories[name] = {name, amount, factory};
    }


    public load(): void {
        Object.keys(this.objectFactories).forEach((name: string) => {
            const objectProto = <IObjectProto> this.objectFactories[name];

            this.objects[name] = new Allocated();
            this.objects[name].meshesLength = objectProto.amount;

            for (let i = 0; i < objectProto.amount; i++) {
                const mesh: BABYLON.Mesh = objectProto.factory();

                this.objects[name].meshes.push(mesh);
                this.objects[name].free.push(mesh);
            }
        });
    }


    public use(name: string): BABYLON.Mesh {
        const alloc: Allocated = <Allocated> this.objects[name];

        if (alloc.meshes.length === alloc.free.length) {
            throw new Error(`All meshes of type "${name}" are allocated!`);
        }

        return alloc.free.pop();
    }


    public free(name: string, mesh: BABYLON.Mesh) {
        const alloc: Allocated = <Allocated> this.objects[name];

        alloc.free.push(mesh);
    }

}
