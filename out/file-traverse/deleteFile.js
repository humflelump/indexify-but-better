"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = void 0;
var fs = require("fs");
function deleteFile(file) {
    fs.unlinkSync(file);
}
exports.deleteFile = deleteFile;
//# sourceMappingURL=deleteFile.js.map