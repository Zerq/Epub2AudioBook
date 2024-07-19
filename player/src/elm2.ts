import { TemplateComponent } from "./TemplateComponent";

export function Elm(tag: string, setup: (elm: HTMLElement) => void, ...elements: Array<HTMLElement>): HTMLElement {
    var elm = document.createElement(tag);

    setup(elm);

    elements.forEach(element => {
        elm.appendChild(element);
    })

    return elm;
}

export function AnyTemlate(setup: (elm: TemplateComponent) => void, ...elements: Array<HTMLElement>): HTMLElement {
    var elm = <TemplateComponent>document.createElement("any-templlate");
    setup(elm);
    elements.forEach(element => {
        elm.appendChild(element);
    })
    return elm;
}

export function Div(setup: (elm: HTMLElement) => void, ...elements: Array<HTMLElement>): HTMLElement {
    return Elm("div", setup, ...elements);
}

export function Span(setup: (elm: HTMLElement) => void, ...elements: Array<HTMLElement>): HTMLElement {
    return Elm("span", setup, ...elements);
}

export function P(setup: (elm: HTMLElement) => void, ...elements: Array<HTMLElement>): HTMLElement {
    return Elm("p", setup, ...elements);
}

export function Link(rel: string, href: string) {
    return Elm("Link", e => { e.setAttribute("rel", rel); e.setAttribute("href", href) });
}

export function Icon(src: Promise<string|undefined>, alt: string, setup: (elm: HTMLElement) => void) {
    return Elm("img", e => {
        src.then(i=>  e.setAttribute("src", i ?? ""));
        e.setAttribute("alt", alt);
        setup(e);
    });
}

export function Button(text: string, evt: (e: MouseEvent) => any, setup: (elm: HTMLElement) => void) {
    return Elm(
        "button",
        e => {
            e.innerText = text;
            e.addEventListener("click", evt);
            setup(e);
        }
    );
}

export function CheckBox(text: string, evt: (e: MouseEvent) => any, setup: (elm: HTMLElement) => void) {
    return Elm("input", e => {
        e.setAttribute("type", "checkbox");
        e.addEventListener("click", evt);
        e.innerText = "text";
        setup(e);
    });
}

export function TextBox(evt: (src: HTMLElement, e: Event) => void, setup: (elm: HTMLElement) => void) {
    return Elm("input", (elm: HTMLElement) => {

        let timoutId: NodeJS.Timeout | null = null;
        elm.addEventListener("keydown", evnt => {
            if (timoutId) {
                clearTimeout(timoutId);
                timoutId = null;
            }

            timoutId = setTimeout(() => {
                evt(elm, evnt);
                if (timoutId !== null) {
                    clearTimeout(timoutId);
                    timoutId = null;
                }
            }, 750);
        });

        setup(elm);
    });
}