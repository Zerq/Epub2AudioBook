using System.Diagnostics.Eventing.Reader;
using System.IO.Compression;
using System.Reflection.Metadata;
using System.Text;
using System.Text.Json;
using CsTools.Extensions;
using Giraffe;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using player3;

namespace TabPlayer;

public class FileData
{
    public string Name { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long Size { get; set; }
}

public class DirectoryData
{
    public string Name { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public string Parent { get; set; } = string.Empty;

    public List<DirectoryData> Directories { get; set; } = new List<DirectoryData>();
    public List<FileData> Files { get; set; } = new List<FileData>();
}

public class Mimes
{
    private static string rempas(string input)
    {
        switch (input)
        {
            case "image/png":
                return "application/image-png";
            default:
                return input;
        }
    }

    public static string Get(FileInfo file)
    {
        return MimeTypes.GetMimeType(file.FullName).Replace(" ", "-");

        // Mimes.rempas(MimeTypes.GetMimeType(file.FullName)).Replace(" ", "-");
    }
}

public class Chapter
{
    public int Id { get; set; } = -1;
    public string Name { get; set; }
    public List<string> Parts { get; set; } = new List<string>();

}

public class PlayerModel
{
    public string SelectedFile { get; set; }
    public string State { get; set; }
    public string ActivePart { get; set; }
    public float Position { get; set; }
    public List<Chapter> Chapters { get; set; }
}

public class DirectoryController : Controller
{



    public string verify()
    {
        return "Ok";
    }

    public JsonDocument? GetLastState(string archivePath)
    {

        if (!System.IO.File.Exists(archivePath + ".bookmark.json"))
        {
            return null;
        }

        var bookmarkJson = System.IO.File.ReadAllText(archivePath + ".bookmark.json");
        return JsonDocument.Parse(bookmarkJson);
    }

    [HttpPost]
    public void SaveState([FromBody] JsonDocument postBody)
    {
        var selectedFiles = postBody.RootElement.GetProperty("SelectedFile").ToString();


        System.IO.File.WriteAllText(selectedFiles + ".bookmark.json", postBody.Serialize());
    }

    public DirectoryData Home()
    {

        var path = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);


        if (!Directory.Exists(path))
        {
            throw new ApplicationException("bad path");
        }

        var dirInfo = new DirectoryInfo(path);
        var dir = new DirectoryData();
        dir.Name = dirInfo.Name;
        dir.Path = dirInfo.FullName;

        foreach (var fileInfo2 in dirInfo.GetFiles())
        {
            var file = new FileData();
            file.Name = fileInfo2.Name;
            file.Path = fileInfo2.FullName;
            file.MimeType = Mimes.Get(fileInfo2).Replace(" ", "-");
            file.Size = fileInfo2.Length;
            dir.Files.Add(file);
        }

        if (dirInfo.Parent != null)
        {
            dir.Parent = dirInfo.Parent.FullName;
        }

        foreach (var dirInfo2 in dirInfo.GetDirectories())
        {
            var dir2 = new DirectoryData();
            dir2.Name = dirInfo2.Name;
            dir2.Path = dirInfo2.FullName;
            dir.Directories.Add(dir2);
        }

        return dir;
    }

    public List<Chapter>? ReandManifest(string archivePath)
    {
        using (var storer = ZipStorer.Open(archivePath, FileAccess.Read))
        {
            var indexJsonFileName = "index.json";
            var jsonFile = storer.ReadCentralDir().Find(n => n.FilenameInZip == indexJsonFileName);
            byte[] data;

            if (storer.ExtractFile(jsonFile, out data))
            {
                using (MemoryStream stream = new MemoryStream(data))
                {
                    using (TextReader reader = new StreamReader(stream))
                    {
                        var text = reader.ReadToEnd();

                        if (String.IsNullOrEmpty(text))
                        {
                            return null;
                        }

                        var obj = (List<Chapter>)JsonSerializer.Deserialize(text, typeof(List<Chapter>));
                        return obj;
                    }
                }
            }

            return null;
        }
    }

    public FileContentResult? ReadMp3(string archivePath, string filePath)
    {
        using (var storer = ZipStorer.Open(archivePath, FileAccess.Read))
        {
            var mp3File = storer.ReadCentralDir().Find(n => n.FilenameInZip == filePath + ".mp3");
            byte[] data;

            if (storer.ExtractFile(mp3File, out data))
            {
                return new FileContentResult(data, "audio/mpeg");
            }
            return null;
        }
    }

    public FileContentResult? ReadPart(string archivePath, string filePath)
    {
        using (var storer = ZipStorer.Open(archivePath, FileAccess.Read))
        {
            var partFile = storer.ReadCentralDir().Find(n => n.FilenameInZip == filePath + ".part");
            byte[] data;

            if (storer.ExtractFile(partFile, out data))
            {
                return new FileContentResult(data, "plain/text");
            }
            return null;
        }
    }


    public PhysicalFileResult GetFile(string path)
    {
        string contentType = Mimes.Get(new FileInfo(path));
        return PhysicalFile(path, contentType);
    }

    public DirectoryData Get(string path)
    {
        if (!Directory.Exists(path))
        {
            throw new ApplicationException("bad path");
        }

        var dirInfo = new DirectoryInfo(path);
        var dir = new DirectoryData();
        dir.Name = dirInfo.Name;
        dir.Path = dirInfo.FullName;

        foreach (var fileInfo2 in dirInfo.GetFiles())
        {
            var file = new FileData();
            file.Name = fileInfo2.Name;
            file.Path = fileInfo2.FullName;
            file.MimeType = Mimes.Get(fileInfo2).Replace(" ", "-");
            file.Size = fileInfo2.Length;
            dir.Files.Add(file);
        }

        if (dirInfo.Parent != null)
        {
            dir.Parent = dirInfo.Parent.FullName;
        }

        foreach (var dirInfo2 in dirInfo.GetDirectories())
        {
            var dir2 = new DirectoryData();
            dir2.Name = dirInfo2.Name;
            dir2.Path = dirInfo2.FullName;
            dir.Directories.Add(dir2);
        }

        return dir;
    }
}