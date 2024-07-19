
export class Locale {
    public constructor(
        public LocalNamePlainText: string, // United state English, British english, Swedish etc...
        public LangaugeSubTag: string, //en, en, sv etc
        public SubTag1?: string, //US, GB, SE etc
        public SubTag2?: string,
        public SubTag3?: string
    ) {
        if (!this.SubTag1) {
            this.shortTag = this.LangaugeSubTag;
        }

        if (!this.SubTag2) {
            this.shortTag = `${this.LangaugeSubTag}-${this.SubTag1}`;
        }

        if (!this.SubTag3) {
            this.shortTag = `${this.LangaugeSubTag}-${this.SubTag1}-${this.SubTag2}`;
        }

        this.shortTag = `${this.LangaugeSubTag}-${this.SubTag1}-${this.SubTag2}-${this.SubTag3}`;
    }

    public Config(configure: (me: Locale) => void): Locale {
        configure(this);
        return this;
    }

    private shortTag: string;

    public get ShortFormat() {
        return this.shortTag;
    }

    public Strings = new Map<string, string>();
    private formeters = new Map<string, any>();

    public SetFormater<T extends Function>(name: string, formater: T) {
        this.formeters.set(name, formater);
    }
    public HasFormat(name: string): boolean {
        return this.formeters.has(name);
    }
    public GetFormat<T extends Function>(name: string) {
        return <T>this.formeters.get(name);
    }
}

export class Locales {

    private common: Locale;
    private All = new Map<string, Locale>();

    private constructor() {
        this.common = new Locale("universal", "", undefined, undefined);
        this.common.SetFormater("AutoByteFormat", (bytes: number) => {
            if (bytes < 1024) {
                return bytes + "byte";
            }
            if (bytes < 1048576) {
                return Math.round(bytes / 10.24) / 100 + "Kb";
            }
            if (bytes < 1073741824) {
                return Math.round(bytes / 10485.76) / 100 + "Mb";
            }
            if (bytes < 1099511627776) {
                return Math.round(bytes / 10737418.24) / 100 + "Gb";
            }
            //  if (bytes < 1125899906842624) {
            return Math.round(bytes / 10995116277.76) / 100 + "Tb";
            // }               
        });

        const svSE =
            new Locale("Svenska", "sv", "SE").Config(n => {
                n.Strings.set("View", "Vy");                
                n.Strings.set("ShowHidden", "Visa Gömda Filer");
                n.Strings.set("DetailedView", "Detaljerad");
                n.Strings.set("LargeIconView", "Stora Iconer");
                n.SetFormater("date", (date: Date) => date.toLocaleString("en-US"))
            });

        const enUS =
            new Locale("US English", "en", "US").Config(n => {
                n.Strings.set("View", "View");   
                n.Strings.set("ShowHidden", "Show Hidden Files");
                n.Strings.set("DetailedView", "Detailed");
                n.Strings.set("LargeIconView", "Large Icons");
                n.SetFormater("date", (date: Date) => date.toLocaleString("en-US"))
            });

        const enGB = new Locale("British English", "en", "GB").Config(n => {
            n.Strings.set("View", "View");   
            n.Strings.set("ShowHidden", "Show Hidden Files");
            n.Strings.set("DetailedView", "Detailed");
            n.Strings.set("LargeIconView", "Large Icons");
            n.SetFormater("date", (date: Date) => date.toLocaleString("en-GB"));
        });

        this.All.set("sv-SE", svSE);
        this.All.set("en-US", enUS);
        this.All.set("em-GB", enGB);
    }



    public static Instance = new Locales();
    public CurrentLocale = "en-US";


    // FormatDate

    public GetFormat<T extends Function>(name: string) {
        if (this.common.HasFormat(name)) {
            return this.common.GetFormat(name);
        }

        if (!this.CurrentLocale) {
            throw new Error("No current locale set");
        }

        if (!this.All.has(this.CurrentLocale)) {
            throw new Error("Locale not found");
        }

        if (!this.All.get(this.CurrentLocale)?.HasFormat(name)) {
            throw new Error("Local is missing " + name);
        }

        return this.All.get(this.CurrentLocale)?.GetFormat(name);
    }

    public GetString(name: string) {
        if (this.common.Strings.has(name)) {
            return this.common.Strings.get(name);
        }

        if (!this.CurrentLocale) {
            throw new Error("No current locale set");
        }

        if (!this.All.has(this.CurrentLocale)) {
            throw new Error("Locale not found");
        }

        if (!this.All.get(this.CurrentLocale)?.Strings.has(name)) {
            throw new Error("Local is missing " + name);
        }

        return this.All.get(this.CurrentLocale)?.Strings.get(name);
    }
}