const product = require("./package.json");
const sass = require("sass");
const fs = require("fs");



const target = sass.compile("src/client/style/main.scss")

fs.writeFileSync(`dist/client/bundle.${product.version}.css`, target.css)