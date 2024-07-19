
public class EpubExtractor
{
    public static void Main(string[] args)
    {

        args = new string[]{
            "/home/zerq/Downloads/ascendance-of-a-bookworm-part-5-volume-11.epub"
        };

        new EpubExtractor().run(args);
    }

    private EpubExtractor() { }

    private void run(string[] args)
    {
        string path = args[0];

        var book = EpubSharp.EpubReader.Read(path);
        var file = new FileInfo(path);
        var index = file.FullName.LastIndexOf(".");

        var newPath = file.FullName.Substring(0, index) + "_audio";
        var newDir = new DirectoryInfo(newPath);
        if (!newDir.Exists)
        {
            newDir.Create();
        }

        index = 0;
        foreach (var chapter in book.TableOfContents)
        {
            var fileName = $"{index.ToString("000")}--{chapter.Title.Replace(" ", "_")}.html";
            EpubSharp.EpubTextFile html = book.Resources.Html.First(n =>
            {
                var x = chapter.FileName.Replace("../", "");
                if (n.FileName.StartsWith("Text/"))
                {
                    return n.FileName == "Text/" + x;
                }

                return n.FileName == x;




            });

            var markup = scrubXmlHeader(html.TextContent);
            var filePath = Path.Combine(newPath, fileName);
            File.WriteAllText(filePath, markup);



            index++;
        }


    }

    private string scrubXmlHeader(string content)
    {
        if (content.TrimStart().StartsWith("<?xml"))
        {
            var firstIndex = content.IndexOf(">");
            var result = content.Substring(firstIndex + 1);
            return result;

        }
        return content;
    }



}