using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;

namespace TabPlayer;

public enum IconType{
Place, Mime, Device, Apps, Animations, Emblem, Action

}

public class Theme
{
    public string Name { get; set; } = string.Empty;
    public bool HomeFolder { get; set; } = true;
}

public class ThemeManager
{
    public static async Task<Theme> GetTheme()
    {
        var result = new Theme();
        using (var process = new Process())
        {
            process.StartInfo = new ProcessStartInfo()
            {  //"en-GB-SoniaNeural", "+15Hz"
                FileName = "gsettings",
                Arguments = " get org.gnome.desktop.interface icon-theme",
                UseShellExecute = false,
                RedirectStandardInput = false,
                RedirectStandardOutput = true,
            };
            process.Start();
            await process.WaitForExitAsync();
            var theme = (await process.StandardOutput.ReadToEndAsync()).Replace(@"
", "").Replace("'", "");

            result.Name = theme;

            var txt = $"{Environment.GetFolderPath(Environment.SpecialFolder.UserProfile)}/.icons/{theme}";

            if (!Directory.Exists(txt))
            {
                txt = "/usr/share/icons/" + theme;
                result.HomeFolder = false;
            }
        }

        return result;
    }
}
