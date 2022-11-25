"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFile = void 0;
const fs = require("fs");
function isFile(file) {
    try {
        return fs.lstatSync(file).isFile();
    }
    catch (e) {
        return false;
    }
}
exports.isFile = isFile;
//# sourceMappingURL=isFile.js.map