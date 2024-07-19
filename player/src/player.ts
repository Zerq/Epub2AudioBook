import { $ } from "./importTemplate.js";
import { CustomElm, Elm } from "./Elm.js";
import { DirectoryOpened, FileSelected } from "./FileView.js";
import { Gague } from "./Gague.js";
import { IOC } from "./IOC.js";
import { Chapter, DirectoryServiceBase, PlayerModel, PlayerModelBase } from "./Types.js";
import { strict } from "assert";

export async function AnimationFrameAsync(): Promise<void> {
    return new Promise((resolve, reject) => {
        requestAnimationFrame(() => {
            reject();
        })
    });
}

@CustomElm("cute-player")
export class Player extends HTMLElement {
    public constructor() {
        super();
        if (this.shadowRoot === null) {
            this.attachShadow({ mode: "open" });
        }
        this.renderFileView().then();
        this.directoryService = IOC.Container.Get(DirectoryServiceBase);
    }

    private async createInitialState(path: string): Promise<PlayerModelBase> {
        const result = new PlayerModel();
        result.SelectedFile = path;

        const state = await this.directoryService.GetLastState(path)

        if (state) {
            return state;
        }

        const manifest = (await this.directoryService.ReadManifest(this.model.SelectedFile))?.sort((a, b) => {
            return a.Id - b.Id;
        });

        manifest.forEach(n => {
            n.Parts = n.Parts.sort();
        })

        result.Chapters = manifest;
        result.ActivePart = result.Chapters[0].Parts[0];

        return result;
    }

    private async saveState() {
        await this.directoryService.SaveState(this.model);
    }

    private directoryService: DirectoryServiceBase;
    private model: PlayerModelBase = new PlayerModel();

    public async renderFileView(): Promise<void> {
        if (this.shadowRoot == null) {
            return;
        }

        this.shadowRoot.innerHTML = "";

        await Elm.From(this.shadowRoot).SwallowAsync(async () => [
            Elm.New("cute-fileview")
                .Attr("path", "/home/zerq")
                .Style("height:100vh; width:100vw;")
                .Evt(FileSelected.name, e => {
                    this.model.SelectedFile = (<any>e).Path;
                    this.InitialPlayerRender();
                })
                .Evt(DirectoryOpened.name, e => {
                    document.title = (<any>e).Path;
                })
        ]);
    }

    public async InitialPlayerRender() {
        this.model = await this.createInitialState(this.model.SelectedFile);

        if (this.model.ActivePart == null) {
            this.model.Chapters = this.model.Chapters.sort((a, b) => a.Id - b.Id);
            this.model.ActivePart = this.model.Chapters.find(n => n.Parts.length > 0)!.Parts[0];
        }

        await this.saveState();

        this.shadowRoot!.innerHTML = "";
        this.shadowRoot!.appendChild(Elm.New("audio").Id("AudioTag").Done());

        await this.shadowRoot!.appendChild(await $.Import.Markup("./player.html"));
        const porevious = <HTMLImageElement>this.shadowRoot!.querySelector("img#Previous");
        const play = <HTMLImageElement>this.shadowRoot!.querySelector("img#Play");
        const pause = <HTMLImageElement>this.shadowRoot!.querySelector("img#Pause");
        const eject = <HTMLImageElement>this.shadowRoot!.querySelector("img#Eject");
        const forward = <HTMLImageElement>this.shadowRoot!.querySelector("img#Forward");
        const gague = <Gague>this.shadowRoot!.querySelector("cute-gague#progress");
        const audio = <HTMLAudioElement>this.shadowRoot!.querySelector("#AudioTag");

        audio.currentTime = this.model.PartTimeStanp; 

        audio.addEventListener("ended", async () => {
            const next = this.getNextToPlay();
            if (next) {
                this.model.ActivePart = next;
                await this.renderPlayer();
                const newAudio = <HTMLAudioElement>this.shadowRoot!.querySelector("#AudioTag");
                this.model.PartTimeStanp =0;
                await newAudio.play();
                await this.saveState();      
            }
        });

        play.style.display = "block";
        pause.style.display = "none";

        play.addEventListener("click", async e => {
            play.style.display = "none";
            pause.style.display = "block";
            await audio.play();        
        });

        pause.addEventListener("click", async e => {
            audio.pause();
            play.style.display = "block";
            pause.style.display = "none";
            await this.saveState();
        });
        eject.addEventListener("click", () => {
            this.renderFileView();
        });

        audio.addEventListener("timeupdate", e => {
            requestAnimationFrame(() => {
                gague.Minimum = 0;
                gague.Maximum = audio.duration;
                gague.Current = audio.currentTime;
                this.model.PartTimeStanp = audio.currentTime;
            });
        });

        await this.renderPlayer();
    }

    private getNextToPlay() {
        let lastfound = false;
        for (let i = 0; i < this.model.Chapters.length; i++) {
            for (let x = 0; x < this.model.Chapters[i].Parts.length; x++) {
                const part = this.model.Chapters[i].Parts[x];
                if (lastfound && part) {
                    return part;
                }
                if (part === this.model.ActivePart) {
                    lastfound = true;
                }
            }
        }
        return null;
    }

    public async renderPlayer(): Promise<void> {
        const chapterView = <HTMLUListElement>this.shadowRoot!.querySelector("#chapterView");
        chapterView.innerHTML = "";

        if (!this.model.SelectedFile || !this.model.ActivePart) {
            return;
        }

        const audio = <HTMLAudioElement>this.shadowRoot!.querySelector("#AudioTag");
        audio.src = this.directoryService.GetMp3Path(this.model.SelectedFile, this.model.ActivePart);

        const txtView = <HTMLPreElement>this.shadowRoot!.querySelector("#TextView pre");
        txtView.innerText = await this.directoryService.GetPartPath(this.model.SelectedFile, this.model.ActivePart);

        await Elm.From(chapterView).EatArray(this.model.Chapters, n => {
            return Elm.New("li").Swallow(() => [
                Elm.New("span").Text(n.Name),
                Elm.New("Ul").EatArray(
                    n.Parts.sort(),
                    (x, i) => Elm.New("Li").ClassIf("active", x === this.model.ActivePart).Swallow(() => [
                        Elm.New("span").Text("Part " + (i + 1)).Attr("data-part", x).Evt("click", async e => {
                            this.model.ActivePart = x;
                            this.renderPlayer();
                            await this.saveState();
                        })
                    ])
                )
            ])
        });
    };
}