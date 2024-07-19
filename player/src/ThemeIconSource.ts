import { DeclareService } from "./IOC.js";
import { IconSourceBase, ThemeLike } from "./Types.js";

@DeclareService(IconSourceBase)
export class ThemeIconSource implements IconSourceBase {

    private theme?: ThemeLike;
    private cache: Map<string, string> = new Map();

    public async GetIcon(path: string): Promise<string> {
        if (this.cache.has(path)){
          const val = this.cache.get(path);
          if (val !== undefined){
            return val;
          }
        }

        if (!this.theme) {
            const req = await fetch(`${location.origin}/Theme/Get`);
            this.theme = await req.json();
        }
        if (!this.theme){
            throw new Error("Theme is still null");
        }


        const iconPath = `${location.origin}/Theme/Icon?theme=${this.theme.Name}&homeFolder=${this.theme.HomeFolder}&path=${path}`.replaceAll("+","%2B");
        this.cache.set(path, iconPath);

        return iconPath;

    }
 
}