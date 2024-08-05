// See https://aka.ms/new-console-template for more informatio

using System.Text.Json;
using Purple.Sdk.MimeTyper;

public class blarg
{
    static public void Main(string[] args)
    {
        //var path = args[0];
        var path = "/home/zerq/Downloads/the-brilliant-healer-s-new-life-in-the-shadows-volume-1_audio";

        DirectoryInfo dir = new DirectoryInfo(path);
        var defaultFile = path + "/file.abz";


        using (var zip = System.IO.Compression.ZipStorer.Create(defaultFile))
        {

            try
            {

                foreach (var file in dir.GetFiles("*.part"))
                {
                    zip.AddFile(System.IO.Compression.ZipStorer.Compression.Store, defaultFile, file.Name, "plain-text");
                }

                foreach (var file in dir.GetFiles("*.mp3"))
                {
                    zip.AddFile(System.IO.Compression.ZipStorer.Compression.Store, defaultFile, file.Name, "audio-mpeg");
                }

                var manifest = dir.GetFiles("index.json").First();
                if (manifest != null)
                {
                    zip.AddFile(System.IO.Compression.ZipStorer.Compression.Store, defaultFile, manifest.Name, "application-json");
                }
            }
            catch (Exception ex)
            {

            }
        }
    }

}

public class Chapter
{
    public string Name { get; set; }
    public List<string> Parts { get; set; } = new List<string>();
}