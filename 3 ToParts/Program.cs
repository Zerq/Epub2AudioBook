using System.ComponentModel;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks.Dataflow;

namespace EpubExtractor;

enum ExitCodes
{
    CatchAll = 1,   //Catchall for general errors	let "var1 = 1/0"	Miscellaneous errors, such as "divide by zero" and other impermissible operations
    BadCommand = 2, //Misuse of shell builtins (according to Bash documentation)	empty_function() {}	Missing keyword or command, or permission problem (and diff return code on a failed binary file comparison).
    CannotExecute = 126,    //Command invoked cannot execute	/dev/null	Permission problem or command is not an executable
    CommandNotFound = 127,//"command not found"	illegal_command	Possible problem with $PATH or a typo
    InvalidExitArgument = 128,  //Invalid argument to exit	exit 3.14159	exit takes only integer args in the range 0 - 255 (see first footnote)
                                //128+n	Fatal error signal "n"	kill -9 $PPID of script	$? returns 137 (128 + 9)
    TerminatedByCtrlC = 130,    //Script terminated by Control-C	Ctl-C	Control-C is fatal error signal 2, (130 = 128 + 2, see above)
    Exit = 0, //255*	Exit status out of range	exit -1	exit takes only integer args in the range 0 - 255

    BadDirectory = 3
}

public class PartMaker
{
    public class Chapter
    {
        public int Id {get;set;} = -1;
        public string Name { get; set; }
        public List<string> Parts { get; set; } = new List<string>();

    }
    public static void Main(String[] args)
    {
        var path = args[0].Replace(".epub", "_audio");

        if (!Directory.Exists(path))
        {
            Environment.ExitCode = (int)ExitCodes.BadDirectory;
            return;
        }

        List<Chapter> chapters = new List<Chapter>();

        DirectoryInfo dir = new DirectoryInfo(path);
        var index = 0;
        foreach (var file in dir.GetFiles("*.txt").OrderBy(n=> n.Name))
        {
            var size = 10000;
            var newFileStump = file.FullName.Replace(".txt", "");
            var content = File.ReadAllText(file.FullName);
            var rex = new Regex(@"([^\.\?\!]*[\.\?\!])");
            var paragraphs = rex.Matches(content);

            Chapter chapter = new Chapter();
            chapter.Id = index;
            index++;


            var chapterName = makeChaperName(file);




            chapter.Name = chapterName;

            var queue = new Queue<string>();
            foreach (Match match in paragraphs)
            {
                queue.Enqueue(match.Groups[1].Value);
            }

            var currentText = "";
            var QueueIndex = 0;

            while (queue.Count() > 0)
            {
                while (queue.Count() > 0 && currentText.Length + queue.Peek().Length < size)
                {
                    currentText += queue.Dequeue();
                }
        
                var parthFileName = newFileStump + "_p" + QueueIndex.ToString("000") + ".part";
                var localNameIndex = parthFileName.LastIndexOf("/");
                var localname = parthFileName.Substring(localNameIndex+1).Replace(".part", "");

                chapter.Parts.Add(localname);
                File.WriteAllText(parthFileName, currentText);

                currentText = "";
                QueueIndex++;
            }

            file.Delete();
            chapters.Add(chapter);
        }

        File.WriteAllText(args[0].Replace(".epub", "_audio/index.json"), JsonSerializer.Serialize(chapters));

        Environment.ExitCode = (int)ExitCodes.Exit;
        return;
    }



    private static string makeChaperName(FileInfo file)
    {
        var result = file.Name.Replace(".txt", "");
        var index = result.IndexOf("--");
        result = result.Substring(index + 2).Replace("_", " ").Replace("-", " ");
        var words = result.Split(" ");
        words = words.Select(n=> capitalize(n)).ToArray();
        return string.Join(' ', words);
    }

    private static string? capitalize(string n)
    {
        n = n.ToLower();
       var ary = n.ToCharArray();
       ary[0] =  Char.ToUpper(ary[0]);
       return string.Join("", ary);
    }
}
