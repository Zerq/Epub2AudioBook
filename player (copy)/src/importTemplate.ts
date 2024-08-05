class Importer{
    private cache = new Map<string,DocumentFragment>();

    public async Markup(path:string):Promise<DocumentFragment> {
        if (this.cache.has(path)){
            const result = this.cache.get(path);            
            if (result !== undefined){
                return result;
            }
        }
        
        const req = await fetch(path, { method: "GET" });
        const text = await req.text();
        const parser = new DOMParser();
        const result = (<HTMLTemplateElement> parser.parseFromString(text, "text/html").querySelector("Template"))!.content;
        this.cache.set(path,result);

        return result;
    } 
}

export class $ {
    private static markupImporter :Importer;
    public static get Import() {
        if (!this.markupImporter){
            this.markupImporter = new Importer();
        }
        return this.markupImporter;
    }
}

export async function importTemplate(path: string): Promise<{[name:string]:HTMLTemplateElement} > {
    const req = await fetch(path + ".templates.html", { method: "GET" });
    const text = await req.text();
    const parser = new DOMParser();
    const dom = parser.parseFromString(text, "text/xml");
    const collection = dom.querySelectorAll("template");
    const templates: {[name:string]:HTMLTemplateElement}  ={};

    for (let i = 0; i < collection.length; i++) {
        templates[collection[i].id] = collection[i];
    }

    return templates;
}