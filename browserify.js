const browserify = require("browserify");
const fs = require("fs");

const package = require("./package.json");

const minify = false;

const version = __dirname + `/dist/client/bundle.${package.version}.js`;
const minversion = __dirname + `/dist/client/bundle.${package.version}.min.js`;

const main = browserify({debug: minify})
    .require("./src/client/main.ts", {expose:"app"})
    .require("bootstrap")
    .require("alpinejs", {expose:"alpinejs"})
    .plugin("tsify", { target: 'es6' })

if (minify)
    main.plugin("minifyify", { output: minversion })

main.bundle()
.on("error", function (err) { console.log("Error: " + err.message); })
.pipe(fs.createWriteStream(version));