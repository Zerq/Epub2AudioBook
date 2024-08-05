using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
namespace TabPlayer;

public class ThemeController : Controller
{
    public async Task<Theme> Get()
    {
        return await ThemeManager.GetTheme();
    }

    public FileResult Icon(string theme, bool homeFolder, string path)
    {
        if (path.Contains(".."))
        {
            throw new ArgumentException("invalidPath");
        }

        string imagePath;
        if (homeFolder)
        {
            imagePath = $"{Environment.GetFolderPath(Environment.SpecialFolder.UserProfile)}/.icons/{theme}{path}";
        }
        else
        {
            imagePath = $"/usr/share/icons/{theme}{path}";
        }

        if (!(imagePath.EndsWith(".svg") || imagePath.EndsWith(".png") || imagePath.Equals("xpm")))
        {
            throw new ArgumentException("Unsupported image format");
        }

        string contentType = Mimes.Get(new FileInfo(imagePath));

        var x = System.IO.File.Exists(imagePath);

        return PhysicalFile(imagePath, contentType);
    }
}