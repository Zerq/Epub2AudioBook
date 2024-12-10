using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Resources;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices.Marshalling;
using System.Text.Json;
using System.Threading.Tasks;
using GLib;
using Gtk;
using LibVLCSharp.Shared;
using UI = Gtk.Builder.ObjectAttribute;
 
namespace Omnicatz
{
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


    public static class MessageBoxExtension
    {
        public static async Task<string> ShowFileDialog(this Window me, string dialogTitle, string filter)
        {
            using (Gtk.FileChooserDialog dialog = new FileChooserDialog(dialogTitle, me, FileChooserAction.Open, ButtonsType.OkCancel))
            {
                dialog.Modal = true;
                dialog.Filter = new FileFilter();
                dialog.Filter.AddCustom(FileFilterFlags.Filename, n => n.Filename.EndsWith(filter));
                string result = null;

                TaskCompletionSource promise = new TaskCompletionSource();
                dialog.FileActivated += (s, e) =>
                {
                    result = dialog.Filename;

                    promise.SetResult();
                };
                dialog.ShowAll();

                await promise.Task;

                return result;
            }
        }

        public static async void ShowMessage(this Window me, MessageType type, string text)
        {
            using (var dialog = new MessageDialog(me, DialogFlags.Modal, type, ButtonsType.Close, text))
            {
                dialog.ShowAll();
                TaskCompletionSource promise = new TaskCompletionSource();

                dialog.Response += (sender, e) =>
                {
                    promise.SetResult();
                };

                await promise.Task;
            }
        }
    }
   
    public class MainWindow : Window
    {
        [UI] private Button previousButton = null;
        [UI] private Button playPauseButton = null;
        [UI] private Button openButton = null;
        [UI] private Button nextButton = null;
        [UI] private TextView textview = null;
        [UI] private Box treeViewContainer = null;

        [UI] private Adjustment adjustment1 = null;

        public MainWindow() : this(new Builder("MainWindow.glade"))
        {
        }

        private MainWindow(Builder builder) : base(builder.GetRawOwnedObject("MainWindow"))
        {
            builder.Autoconnect(this);

            this.previousButton.Clicked += previousButtonClick;
            this.playPauseButton.Clicked += playPauseButtonClick;
            this.openButton.Clicked += openButtonClick;
            this.nextButton.Clicked += nextButtonClick;
            


            this.textview.Buffer.Text = "textviewText";
            this.textview.Editable = false;


            ChapterList chapters = new ChapterList();

            chapters.OnChapterSelected += chapters_OnChapterSelected;




            chapters.Chapters = (new List<Chapter>{
                new Chapter{ Id=0, Name="blarg", Parts= new List<string>{
                    "blarg part 1", "blarg part 2"
                }},
                new Chapter{ Id=0, Name="zog", Parts= new List<string>{
                    "zog part 1", "zog part 2", "zog part 3"
                }}
              });

            treeViewContainer.PackStart(chapters, true, true, 0);
            chapters.Show();


            chapters.UpdateStore();



            treeViewContainer.ShowAll();


        }



        private void chapters_OnChapterSelected(Chapter chapter, string part)
        {
            if (chapter == null)
            {
                return;
            }
            if (part == null)
            {
                return;
            }
        }

        public List<Chapter> ReandManifest(string archivePath)
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

                throw new FileNotFoundException("could not load Manifest");
            }
        }

        private  LibVLCSharp.Shared.MediaPlayer player;
        private EventHandler shutdown;


private  LibVLC libvlc = new LibVLC();

        public void ReadMp3(string archivePath, string filePath)
        {
            if (player != null){
                this.player.Dispose();
            }

            this.player = new  LibVLCSharp.Shared.MediaPlayer(this.libvlc);
 
        
            using (var storer = ZipStorer.Open(archivePath, FileAccess.Read))
            {
                var mp3File = storer.ReadCentralDir().Find(n => n.FilenameInZip == filePath + ".mp3");
                byte[] data;
                if (storer.ExtractFile(mp3File, out data))
                {
                  

                           MediaInput input =  new  LibVLCSharp.Shared.StreamMediaInput(new MemoryStream(data));


                        this.player.Media = new Media(this.libvlc, input);         

                        this.player.PositionChanged += playing;      
                    
                    
                }
            }
        }

        private void playing(object sender, EventArgs e)
        {
            adjustment1.Value =      this.player.Position * 100;
        }

        public void Play()
        {
                 if (this.player != null)
            {
                this.player.Play();
            }
        }

        public void Pause()
        {
            if (this.player != null && this.player.CanPause)
            {
                this.player.Pause();
            }
        }

        public JsonDocument GetLastState(string archivePath)
        {
            if (!System.IO.File.Exists(archivePath + ".bookmark.json"))
            {
                return null;
            }
            var bookmarkJson = System.IO.File.ReadAllText(archivePath + ".bookmark.json");
            return JsonDocument.Parse(bookmarkJson);
        }

        private void Window_DeleteEvent(object sender, DeleteEventArgs a)
        {
            Gtk.Application.Quit();
        }

        private void previousButtonClick(object sender, EventArgs a)
        {
            this.ShowMessage(MessageType.Info, "previousButtonClick");
        }

        private void playPauseButtonClick(object sender, EventArgs a)
        {
            this.Play();
        }

        private void openButtonClick(object sender, EventArgs a)
        {
            this.ShowFileDialog("load Abz", ".abz").ContinueWith(async p =>
            {
                var file = await p;

                var chapters = this.ReandManifest(file);


                ReadMp3(file, "000--Title_Page_p000");
            });
        }

        private void nextButtonClick(object sender, EventArgs a)
        {
            this.ShowMessage(MessageType.Info, "nextButtonClick");
        }

        public void ShutDown(object sender, EventArgs e)
        {
        this.player.Dispose();
        }
    }
}
