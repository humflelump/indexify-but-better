"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFileContents = void 0;
const fs = require("fs");
function readFileContents(path) {
    return fs.readFileSync(path, { encoding: "utf8", flag: "r" });
}
exports.readFileContents = readFileContents;
//# sourceMappingURL=readFile.js.map