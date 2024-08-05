import { CustomElm } from "./Elm";





@CustomElm("any-template")
export class TemplateComponent extends HTMLElement {
    static observedAttributes = [];

    private tempalte?: HTMLTemplateElement;
    public async setTemplate(value: HTMLTemplateElement) {
        this.tempalte = value;
        await this.render();

    }

    public async render() {
        if (this.shadowRoot === null) {
            this.attachShadow({ mode: "open" });
        }

        this.shadowRoot!.innerHTML = "";
        this.tempalte?.childNodes.forEach(node => {
            this.shadowRoot?.appendChild(node.cloneNode());
        });
    }

    public connectedCallback() { }
    public disconnectedCallback() { }
    public adoptedCallback() { }
    public attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    }
}
