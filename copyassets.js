const shell = require("shelljs");


shell.cp("-Ru", "node_modules/font-awesome/fonts", "dist/client")
shell.cp("-Ru", "src/data", "dist/server")