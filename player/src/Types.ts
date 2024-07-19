export interface PathItemLike {
    Name: string;
    Path: string;
}

export interface FileDataLike extends PathItemLike {
    MimeType: string;
    Size: number;
}

export interface DirectoryDataLike extends PathItemLike {
    Directories: Array<DirectoryDataLike>;
    Files: Array<FileDataLike>;
    Parent: string;
}

export interface ListViewItemLike {
    Name: string;
    Value: any;
    IconKey: string;
    SubItems: Array<string>;
}

export interface GenericListViewItemLike<T> extends ListViewItemLike {
    Value: T;
}

export abstract class IconSourceBase {
  public abstract GetIcon(key: string): Promise<string>;
}

export interface ThemeLike {
    Name: string;
    HomeFolder: boolean;
}

export class Chapter
{
    public Id:number = -1;
    public Name:string = "";
    public Parts:Array<string> = [];
}

export abstract class DirectoryServiceBase {
    public abstract GetDirectoryAsync(path: string): Promise<DirectoryDataLike>;
    public abstract GetFileUrl(path:string):string;
    public abstract GetHome():Promise<DirectoryDataLike>;
    public abstract ReadManifest(AudioBookpath:string): Promise<Array<Chapter>>;
    public abstract GetMp3Path(archivePath:string, filePath:string): string;    
    public abstract GetPartPath(archivePath: string, filePath: string): Promise<string>;
    public abstract GetLastState(archivePath:string): Promise<PlayerModelBase|null>;
    public abstract SaveState(model:PlayerModelBase): Promise<void>;    
}

export interface PlayerModelBase {
    PartTimeStanp: number;
    SelectedFile: string;
    State: "ShowPlay" | "ShowPause";
    ActivePart: string;
    Position: number;
    Chapters: Array<Chapter>;
}

export class PlayerModel implements PlayerModelBase {
    public SelectedFile = "";
    public State: "ShowPlay" | "ShowPause" = "ShowPlay";
    public ActivePart = "";
    public Position = 0;
    public Chapters: Array<Chapter> = [];
    PartTimeStanp: number = 0;

}