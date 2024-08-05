using System;
using Gtk;
using System.Collections.Generic;
using System.ComponentModel;
using GLib;
namespace Omnicatz;
public class ChapterList : Box
{
    private TreeView tree = new TreeView();

    private TreeStore store = new TreeStore(typeof(string));

 

    public void UpdateStore()
    {
        this.store.Clear();
        this.Chapters.ForEach(chapter =>
        {
            var itr = store.AppendValues(chapter.Name);
            chapter.Parts.ForEach(part =>
            {
                store.AppendValues(itr, part);
            });
        });
    }

    public List<Chapter> Chapters = new List<Chapter>();


    public delegate void ChapterSelectedHandler(Chapter chapter, string part);

    public event ChapterSelectedHandler OnChapterSelected;

    public ChapterList()
    {
        var column1 = new TreeViewColumn();
        column1.Title = "title1";
        Gtk.CellRendererText textCell = new Gtk.CellRendererText();
        column1.PackStart(textCell, true);
        column1.AddAttribute(textCell, "text", 0);
        tree.AppendColumn(column1);

        tree.RowActivated += (object o, RowActivatedArgs args) =>
        {
            if (args.Column.Cells.Length > 0)
            {
                Chapter chapter = null;
                string part = null;
                this.OnChapterSelected?.Invoke(null, null);


                if (args.Path.Indices.Length == 0)
                {
                    return;
                }

                chapter = this.Chapters[args.Path.Indices[0]];

                this.OnChapterSelected?.Invoke(chapter, null);
                if (args.Path.Indices.Length > 1)
                {
                    return;
                }

                part = Chapters[args.Path.Indices[0]].Parts[args.Path.Indices[1]];
                this.OnChapterSelected?.Invoke(chapter, part);
            }
        };

        this.OnChapterSelected += (Chapter chapter, string part) =>
        {
            if (chapter == null)
            {
                return;
            }

            if (part == null)
            {
                return;
            }

        };

        tree.Model = store;

        this.PackStart(tree, true, true, 0);
        tree.Show();
        
     this.Expand = true;
this.ShowAll();
   
    }
}
