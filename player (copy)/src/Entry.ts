import { Elm } from "./Elm.js";
import { FileSelected, DirectoryOpened } from "./FileView.js";
import { Locales } from "./Locale.js"
 
export async function RunEntry(id: string) {   
    const appTag = document.getElementById(id);
    if (appTag === null){  return; }
    Locales.Instance.CurrentLocale = "sv-SE";
    await Elm.From(appTag).SwallowAsync(async ()=> [Elm.New("cute-player").Style("width:100vh; height:100vw")]);
}