export class IOC {
    private constructor() { }

    public static get Container(){
        if (!IOC.container){
            this.container = new IOC();
        }
        return this.container;
    };

    public static container:IOC; // = new IOC();
    private stuff = new Map();
    public Register<T, V extends T>(absCtr: AbsCtr<T>, ctr: Ctr<V>) {       
       if (this.stuff.has(absCtr.name)){
        return;
       }
       
        const instance = new ctr();
        this.stuff.set(absCtr.name, instance);
    }

    public Get<T, V extends T>(ctr: AbsCtr<T>): V {
        return this.stuff.get(ctr.name);
    }
}

export function Service<T, V extends T>(absCtr: AbsCtr<T>) {
    return function (target: any, propertyKey: string) {
        target[propertyKey] = IOC.Container.Get(absCtr);
    };
}

export function DeclareService<T, V extends T>(absCtr: AbsCtr<T>) {
    return (ctr: Ctr<V>) => {
        IOC.Container.Register(absCtr, ctr);
    };
}

export type AbsCtr<T> = Function & { prototype: T; };
export interface Ctr<T> { new(): T; }