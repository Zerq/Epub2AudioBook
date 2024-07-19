import { DeclareService } from "./IOC.js";
import { DirectoryServiceBase, DirectoryDataLike, Chapter, PlayerModelBase } from "./Types.js";

@DeclareService(DirectoryServiceBase)
export class DirectoryService implements DirectoryServiceBase {
    public constructor() { }

    public async GetLastState(archivePath: string): Promise<PlayerModelBase | null> {
        const response = await fetch(`${location.origin}/Directory/GetLastState?archivePath=${archivePath}`);

        if (response.statusText == "No Content") {
            return null;
        }

        return await response.json();
    }

    public async SaveState(model: PlayerModelBase): Promise<void> {
       await fetch(`${location.origin}/Directory/SaveState`, {
            method: "POST",
            body: JSON.stringify(model),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
    }

    public async GetHome(): Promise<DirectoryDataLike> {
        const response = await fetch(`${location.origin}/Directory/home`);
        return await response.json();
    }

    public GetFileUrl(path: string): string {
        return `${location.origin}/Directory/GetFile?path=${path}`;
    }

    public async GetDirectoryAsync(path: string): Promise<DirectoryDataLike> {
        const response = await fetch(`${location.origin}/Directory/Get?path=${path}`);
        return await response.json();
    }

    public async ReadManifest(AudioBookpath: string): Promise<Array<Chapter>> {
        const response = await fetch(`${location.origin}/Directory/ReandManifest?archivePath=${AudioBookpath}`);
        const obj = <Array<Chapter>><unknown>response.json();
        return obj;
    }

    public GetMp3Path(archivePath: string, filePath: string): string {
        return `${location.origin}/Directory/ReadMp3?archivePath=${archivePath}&filePath=${filePath}`;
    }

    public async GetPartPath(archivePath: string, filePath: string): Promise<string> {
        const response = await fetch(`${location.origin}/Directory/ReadPart?archivePath=${archivePath}&filePath=${filePath}`);
        return await response.text();
    }
}