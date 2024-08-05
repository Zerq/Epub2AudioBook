using System;
using Gtk;

namespace Omnicatz
{
    class Program
    {
        [STAThread]
        public static void Main(string[] args)
        {
            Application.Init();

            var app = new Application("org.Untitled_Folder_3.Untitled_Folder_3", GLib.ApplicationFlags.None);
            app.Register(GLib.Cancellable.Current);

            var win = new MainWindow();
            app.Shutdown += win.ShutDown;
            app.AddWindow(win);

            win.Show();
            Application.Run();
        }

 
    }
}
