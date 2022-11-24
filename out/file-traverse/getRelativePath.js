"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelativePath = void 0;
const path = require("path");
function getRelativePath(from, to) {
    const split = from.split("/");
    split.pop();
    const result = path.relative(split.join("/"), to);
    if (result.startsWith(".")) {
        return result;
    }
    return "./" + result;
}
exports.getRelativePath = getRelativePath;
//# sourceMappingURL=getRelativePath.js.map