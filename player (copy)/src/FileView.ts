import { CustomElm, Elm } from "./Elm.js";
import { IOC, Service } from "./IOC.js";
import { TemplateComponent } from "./TemplateComponent.js";
import { $, importTemplate } from "./importTemplate.js";
import { ThemeIconSource } from "./ThemeIconSource.js";
import {
    DirectoryServiceBase, IconSourceBase,
    GenericListViewItemLike, PathItemLike, DirectoryDataLike, FileDataLike
} from "./Types.js";

import { Locale, Locales } from "./Locale.js";


export enum DisplayMode {
    LargeIcons = "LargeIcons",
    Details = "Details"
}

export class FileViewModel {
    public DisplayMode = DisplayMode.LargeIcons;
    public ShowHidden = false;
    public Filter?: string;
    public Directory?: DirectoryDataLike;
    public LastPath = "";

}


async function AwaitFrame(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        requestAnimationFrame(() => {
            resolve();
        });
    });
}


export class FileSelected extends Event {
    public constructor(public Path: string) {
        super(FileSelected.name);
    }
}

export class DirectoryOpened extends Event {
    public constructor(public Path: string) {
        super(DirectoryOpened.name);
    }
}

@CustomElm("cute-fileview")
export class FileView extends HTMLElement {
    public constructor() {
        super();

        if (this.shadowRoot === null) {
            this.attachShadow({ mode: "open" });
        }

        this.ThemeSource = IOC.Container.Get(IconSourceBase);
        this.directoryService = IOC.Container.Get(DirectoryServiceBase);

    }
    static observedAttributes = ["path"];
    public ShowHidden = false;
    public filter?: string = undefined;

    private ThemeSource: ThemeIconSource;
    private directoryService: DirectoryServiceBase;

    private model = new FileViewModel();


    private async makeIf(condition: boolean, make: () => Promise<Elm>): Promise<Array<Elm>> {
        if (condition) {
            return [await make()];
        }
        else {
            return [];
        }
    }

    private async renderFolder(path: string, name: string): Promise<Elm> {
        const dirIcon = await this.ThemeSource.GetIcon(`/places@2x/48/folder.svg`);
        const result = await Elm.New("div").SwallowAsync(async () => [
            await Elm.New("data").Class("path", "dir").Attr("data-path", path)
                .Evt("click", async e => {
                    const path = (<HTMLDataElement>e.currentTarget).getAttribute("data-path");

                    if (!path) {
                        return;
                    }

                    this.dispatchEvent(new DirectoryOpened(path));
                    this.setAttribute("path", path);
                    this.model.LastPath = path;

                })
                .SwallowAsync(async () => [
                    Elm.New("img").Attr("src", dirIcon),
                    Elm.New("label").Text(name)
                ])
        ])

        return result
    }

    private async renderFile(path: string, name: string, mimetype: string, size: number, date: Date) {
        const dirIcon = await this.ThemeSource.GetIcon(`/mimes/48/` + mimetype.replaceAll("/", "-") + ".svg");
        const result = await Elm.New("div").SwallowAsync(async () => [
            await Elm.New("data").Class("path", "file").Attr("data-path", path)
                .Evt("dblclick", e => {
                    const path = (<HTMLDataElement>e.currentTarget).getAttribute("data-path");

                    if (!path) {
                        return;
                    }

                    this.dispatchEvent(new FileSelected(path));
                })
                .SwallowAsync(async () => [
                    Elm.New("img").Attr("src", dirIcon),
                    Elm.New("label").Class("name").Text(name),
                    Elm.New("label").Class("size").Text(Locales.Instance.GetFormat<(num: number) => string>("AutoByteFormat")?.(size)),
                    Elm.New("label").Class("date").Text(Locales.Instance.GetFormat<(date: Date) => string>("date")?.(date))
                ])
        ])

        return result
    }

    public async renderBigIcons(): Promise<Elm> {
        if (this.model.Directory) {

            const result = Elm.New("div");

            if (!!this.model?.Directory?.Parent) {
                result.AddChild(await this.renderFolder(this.model.Directory!.Parent, "back"));
            }

            await result.EatArrayAsync(this.model.Directory?.Directories, async (n: DirectoryDataLike) => await this.renderFolder(n.Path, n.Name));

            await result.EatArrayAsync(this.model.Directory?.Files, async (n: FileDataLike) => this.renderFile(n.Path, n.Name, n.MimeType, n.Size, new Date()));

            return await result;
        }

        throw new Error("failed to renderBig icons");
    }

    private async makeListDir(text: string, path: string, icon: string): Promise<Elm> {
        const result = await Elm.New("tr").SwallowAsync(async () => [
            await Elm.New("td").Evt("click", e => {
                this.dispatchEvent(new DirectoryOpened(path));
                this.setAttribute("path", path);
                this.model.LastPath = path;
            }).SwallowAsync(async () => [
                Elm.New("img").Attr("src", icon),
                Elm.New("span").Text(text)
            ])
        ]);

        return result;
    }

    private async makeListFile(text: string, path: string, mimetype: string, size: number, date: Date): Promise<Elm> {
        const dirIcon = await this.ThemeSource.GetIcon(`/mimes/48/` + mimetype.replaceAll("/", "-") + ".svg");
        return await Elm.New("tr").SwallowAsync(async () => [
            await Elm.New("td").Evt("click", e => {
                this.dispatchEvent(new DirectoryOpened(path));
                this.setAttribute("path", path);
                this.model.LastPath = path;
            }).SwallowAsync(async () => [
                Elm.New("img").Attr("src", dirIcon),
                Elm.New("span").Text(text)
            ]),
            Elm.New("td").Class("size").Text(Locales.Instance.GetFormat<(num: number) => string>("AutoByteFormat")?.(size)),
            Elm.New("td").Class("date").Text(Locales.Instance.GetFormat<(date: Date) => string>("date")?.(date))
        ]);
    }

    public async renderList(): Promise<Elm> {
        const dirIcon = await this.ThemeSource.GetIcon(`/places@2x/48/folder.svg`);
        const body = Elm.New("tbody");

        if (this.model.Directory?.Parent) {
            body.AddChild(await this.makeListDir("Back", this.model.Directory?.Parent, dirIcon));
        }

        await this.model.Directory?.Directories.forEach(async n => {
            body.AddChild(await this.makeListDir(n.Name, n.Path, dirIcon));
        });


        await this.model.Directory?.Files.forEach(async n => {
            body.AddChild(await this.makeListFile(n.Name, n.Path, n.MimeType, n.Size, new Date())); //todo add date....
        });

        const x = await Elm.New("table").Style("width:100%;").Id("listMode").SwallowAsync(async () => [
            Elm.New("tHead").Swallow(() => [
                Elm.New("tr").Swallow(() => [
                    Elm.New("td").Text("FileName"),
                    Elm.New("td").Text("Size"),
                    Elm.New("td").Text("Date")
                ])
            ]),
            body             
        ]);

        const y = x.Done();
        return x;
    }

    public async renderCurrentMode(): Promise<Elm> {

        let result: Elm;
        switch (this.model.DisplayMode) {
            case DisplayMode.Details:
                result = await this.renderList();
                break;
            default:
                result = await this.renderBigIcons();
                break;
        }

        return result;
    }

    public async render(): Promise<void> {
        const path = this.getAttribute("path");
        if (path !== null && path !== this.model.LastPath) {
            this.model.Directory = await this.directoryService?.GetDirectoryAsync(path);
            this.model.LastPath = path;
        }

        if (!this.model.Directory) {
            return;
        }

        if (this.shadowRoot!.children.length === 0) {
            this.shadowRoot!.appendChild(await $.Import.Markup("./FileView.html"));

            const contextMenu = this.shadowRoot!.querySelector<HTMLUListElement>(".contextMenu")!;

            Elm.From(contextMenu).Swallow(() => [
                Elm.New("li").Text(Locales.Instance.GetString("DetailedView")!).Evt("click", async e => {
                    (<HTMLElement>e.currentTarget).parentElement!.classList.add("hidden");
                    this.model.DisplayMode = DisplayMode.Details;
                    await this.render();
                }),
                Elm.New("li").Text(Locales.Instance.GetString("LargeIconView")!).Evt("click", async e => {
                    (<HTMLElement>e.currentTarget).parentElement!.classList.add("hidden");
                    this.model.DisplayMode = DisplayMode.LargeIcons;
                    await this.render();
                }),
            ]);

            const showHiddenLabel = <HTMLLabelElement>this.shadowRoot!.querySelector(".headInner label");
            showHiddenLabel.textContent = Locales.Instance.GetString("ShowHidden") ?? "Show hidden";

            const viewButton = <HTMLButtonElement>this.shadowRoot!.getElementById("viewButton");
            viewButton.textContent = Locales.Instance.GetString("View") ?? "View";

            viewButton.addEventListener("click", () => {
                const contextMenu = this.shadowRoot!.querySelector(".contextMenu")!;
                contextMenu.classList.toggle("hidden");
            });

            const showHiddenCheckbox = <HTMLInputElement>this.shadowRoot!.getElementById("showHidden");

            showHiddenCheckbox.addEventListener("click", async () => {
                this.model.ShowHidden = showHiddenCheckbox.checked;
                await this.render();
            });
            const search = <HTMLInputElement>this.shadowRoot!.getElementById("search");

            let timoutId: NodeJS.Timeout | null = null;
            search.addEventListener("keydown", evnt => {
                if (timoutId) {
                    clearTimeout(timoutId);
                    timoutId = null;
                }

                timoutId = setTimeout(async () => {
                    this.model.Filter = search.value;
                    await this.render();
                    if (timoutId !== null) {
                        clearTimeout(timoutId);
                        timoutId = null;
                    }
                }, 750)
            });

        }
        const body = this.shadowRoot!.querySelector(".body");
        body!.innerHTML = "";
        body!.appendChild((await this.renderCurrentMode()).Done());
    }

    // public  connectedCallback() {

    // }

    // public disconnectedCallback() {
    // }

    // public adoptedCallback() {
    // }

    public async attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        if (name === "path") {
            await this.render()
        }
    }
}
