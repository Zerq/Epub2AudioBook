
files="$1/*.part"
for file in $files 
do 
edge-tts -f $file -v ""en-US-AvaMultilingualNeural"" --write-media "${file//".part"/".mp3"}";
done
