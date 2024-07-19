const {src, dest}  = require("gulp");

exports.default = async function(){
src([
    "./src/**/*.html",
    "./src/**/*.css",
],
 {base: "./src" }).pipe(dest("wwwroot/"));

 src([
    "./src/**/*.ts"],
 {base: "./src" }).pipe(dest("wwwroot/src/"));
};