import { CustomElm, Elm } from "./Elm.js";

@CustomElm("cute-gague")
export class Gague extends HTMLElement {
    static observedAttributes = ["current","max","min"];
  
    public constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    public get Current(): number {
        const raw = this.getAttribute("current");

        if (!raw) {
            return 0;
        }

        const result = Number.parseFloat(raw);
        return result;
    }
    public set Current(value: number) {
        if (!value) {
            this.setAttribute("current", "0");
        }
        this.setAttribute("current", value.toString());
    }

    public get Minimum(): number {
        const raw = this.getAttribute("min");

        if (!raw) {
            return 0;
        }

        const result = Number.parseFloat(raw);
        return result;
    }
    public set Minimum(value: number) {
        if (!value) {
            this.setAttribute("min", "0");
        }
        this.setAttribute("min", value.toString());
    }

    public get Maximum(): number {
        const raw = this.getAttribute("max");

        if (!raw) {
            return 0;
        }

        const result = Number.parseFloat(raw);
        return result;
    }
    public set Maximum(value: number) {
        if (!value) {
            this.setAttribute("max", "0");
        }
        this.setAttribute("max", value.toString());
    }

    private render() {
        this.shadowRoot!.innerHTML = "";
        this.shadowRoot!.appendChild(Elm.New("link").Attr("href", "Gague.css").Attr("rel", "stylesheet").Done());
        this.shadowRoot!.appendChild(Elm.New("div").Class("gague").Swallow(() => [
            Elm.New("div").Class("progress").Style(`width:calc(${this.value}% - 1px`).Swallow(() => [
                Elm.New("span").Text(`${this.value}%`)
            ])
        ]).Done()
        );
    }

    private get value(): number {
        return Math.round(
        (Math.abs(this.Minimum - this.Current)
            / Math.abs(this.Minimum - this.Maximum))
            * 1000
        ) /10;
    }

    public connectedCallback() {
        this.render();
    }

    public disconnectedCallback() {
    }

    public async attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        if (newValue === undefined) {
        }

        switch (name) {
            case "current":
                this.render();
                break;
            case "min":
                this.render();
                break;
            case "max":
                this.render();
                break;
        }
    }
}