export type AbsCtr<T> = Function & { prototype: T };

export interface Ctr<T> {
    new(): T;
}

export abstract class SubRender {
    public constructor(public Id: string) { }
  
    public abstract Render(): Elm;
    public Refresh(): void {
        const element = document.getElementById(this.Id);

        if (!element) {
            throw new Error("element was null");
        }

        element.innerHTML = "";
        element.appendChild(this.Render().Done());
    }
}

export function CustomElm<T extends HTMLElement>(name: string) {
    return (ctor: Ctr<T>) => {
        customElements.define(name, ctor);
    }
}

export class RefreshToken {
    public Id = crypto.randomUUID();
    public Refresh?: () => void;
    public cache?: Elm;
    public constructor(public tempalte: () => Elm) {
    }
}

export interface CssJson {
    [name: string]: { [name: string]: string };
}

export class Elm {
    private elm: HTMLElement;

    public static Style(json: CssJson): Elm {
        let css = "";
        for (let ruleName in json) {
            css += `${ruleName}{
`;

            for (let property in json[ruleName]) {
                css += `${property}: ${json[ruleName][property]};
`
            }
            css += `}
`;
        }

        var result = Elm.New("style");
        result.elm.textContent = css;
        return result;

    }

    public static New(tagName: string): Elm {
        const result = new Elm();
        result.elm = document.createElement(tagName);
        return result;
    }

    public static From<T extends Node>(elm: T) {
        const result = new Elm();
        result.elm =<HTMLElement><unknown>elm;
        return result;
    }

    private constructor() {
        this.elm = <HTMLElement><unknown>{};//invalid but get overwritten
    }

    public Do<H extends HTMLElement>(act: (n: H) => void) {
        act(<H>this.elm);
        return this;
    }

    public Css(txt: string) {
        const rules = <CssJson>JSON.parse(txt);
        this.elm.innerHTML = txt;
        return this;
    }

    public Html(txt: string) {
        this.elm.innerHTML = txt;
        return this;
    }

    public Id<T extends HTMLElement>(id: string, out?: T) {
        this.elm.id = id;
        out = <T>this.elm;
        return this;
    }

    public Focus(focused: boolean) {
        if (focused) {
            this.elm.focus();
        }
        return this;
    }

    public static async RefreshableAsync(token: RefreshToken) {
        token.Refresh = () => {
            const div = document.getElementById(token.Id.toString());
            if (!div) {
                throw new Error(`div with id ${token.Id} was null`)
            }
            div.innerHTML = "";
            div.appendChild(token.tempalte().Done());
        };

        return await Elm.New("div").Id(token.Id.toString()).SwallowAsync(async () => [
            token.tempalte()
        ]);
    }

    public Evt(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): Elm {
        this.elm.addEventListener(type, listener);
        return this;
    }

    public Done<T extends HTMLElement>(): T {
        return this.elm as T;
    }

    public Attr(name: string, value: string) {
        this.elm.setAttribute(name, value);
        return this;
    }

    public ElmIf(condition: boolean, thenBlock: () => Elm, elseBlock: () => Elm) {
        if (condition) {
            this.elm.appendChild(thenBlock().Done());
        } else {
            this.elm.appendChild(elseBlock().Done());
        }
    }

    public ClassIf(clss: string, condition: boolean) {
        if (condition) {
            this.elm.classList.add(clss);
        } else {
            this.elm.classList.remove(clss);
        }
        return this;
    }

    public EntityIcon(...entities: Array<number>) {
        this.elm.innerHTML = entities.map(n => `&#${n};`).join("");
        return this;
    }

    public Class(...classes: Array<string>) {
        this.elm.classList.add(...classes);
        return this;
    }

    public Style(rules: string) {
        this.Attr("style", rules);
        return this;
    }

    public Value(value: string) {
        this.Attr("value", value);
        return this;
    }

    public Flag(name: string, value: boolean) {
        if (value) {
            this.elm.setAttribute(name, "");
        } else {
            if (this.elm.hasAttribute(name)) {
                this.elm.removeAttribute(name);
            }
        }
        return this;
    }

    public Text(value: string) {
        this.elm.innerText = value;
        return this;
    }

    public Swallow(stuff: () => Array<Elm>) {
        stuff().forEach(n => this.elm.appendChild(n.Done()));
        return this;
    }


    public AddChild(child:Elm){
     this.elm.appendChild(child.Done());  
    }

    public async SwallowAsync(stuff: () => Promise<Array<Elm>>) {
        (await stuff()).forEach(n => this.elm.appendChild(n.Done()));
        return this;
    }

    public ForCount<T>(size: number, action: (i: number) => Elm): Elm {
        for (let i = 0; i < size; i++) {
            this.elm.appendChild((action(i)).Done());
        }

        return this;
    }

    public async ForCountAsync<T>(size: number, action: (i: number) => Promise<Elm>): Promise<Elm> {
        for (let i = 0; i < size; i++) {
            this.elm.appendChild((await action(i)).Done());
        }

        return this;
    }

    public async EatArrayAsync<T>(ary: Array<T>, transformation: (n: T, i: number) => Promise<Elm>) {
        ary.forEach(async (n, i) => this.elm.appendChild((await transformation(n, i)).Done()));
        return this;
    }

    public EatArray<T>(ary: Array<T>, transformation: (n: T, i: number) => Elm) {
        ary.forEach((n, i) => this.elm.appendChild((transformation(n, i)).Done()));
        return this;
    }

    public async EatAndGroupAsync<T>(ary: Array<T>, variable: (n: T) => string, groupBy: (n: T) => string, transform: (variablePart: Array<string>, constantPart: T) => Elm) {
        const groups = new Map<string, Array<T>>();
        ary.forEach(n => {
            const item: string = groupBy(n);

            if (!groups.has(item)) {
                groups.set(item, [n]);
            } else {
                groups?.get(item)?.push(n);
            }
        });

        const result = Array<Elm>();
        groups.forEach((value, key) => {
            const variablePart = value.map(n => variable(n));
            result.push(transform(variablePart, value[0]));
        });
        await this.SwallowAsync(async () => result);
        return this;
    }
    public Resizable(resize: "none" | "both" | "horizontal" | "vertical") {
        this.elm.style.resize = resize;
        return this;
    }
}