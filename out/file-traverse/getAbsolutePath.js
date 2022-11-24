"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAbsolutePath = void 0;
const path = require("path");
function getAbsolutePath(absPathToFile, relPath) {
    const split = absPathToFile.split("/");
    split.pop();
    return path.resolve(split.join("/"), relPath);
}
exports.getAbsolutePath = getAbsolutePath;
//# sourceMappingURL=getAbsolutePath.js.map