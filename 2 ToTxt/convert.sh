
files="$1/*html"
for file in $files 
do 
html2text $file  >> "${file//".html"/".txt"}";
rm $file
done