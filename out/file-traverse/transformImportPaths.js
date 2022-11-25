"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformExportPaths = exports.transformImportPaths = void 0;
const getAbsolutePath_1 = require("./getAbsolutePath");
const removeFileExtension_1 = require("./removeFileExtension");
function transformImportPaths(im, folders) {
    im = { ...im };
    im.fileWithExtension = im.file;
    im.file = (0, removeFileExtension_1.removeFileExtension)(im.file);
    let importPath = (0, getAbsolutePath_1.getAbsolutePath)(im.file, im.source);
    if (folders.has(importPath)) {
        importPath += "/index";
    }
    im.source = (0, removeFileExtension_1.removeFileExtension)(importPath);
    return im;
}
exports.transformImportPaths = transformImportPaths;
function transformExportPaths(ex, folders) {
    ex = { ...ex };
    ex.fileWithExtension = ex.file;
    ex.file = (0, removeFileExtension_1.removeFileExtension)(ex.file);
    if (ex.type === "NewExport") {
        return ex;
    }
    let importPath = (0, getAbsolutePath_1.getAbsolutePath)(ex.file, ex.source);
    if (folders.has(importPath)) {
        importPath += "/index";
    }
    ex.source = (0, removeFileExtension_1.removeFileExtension)(importPath);
    return ex;
}
exports.transformExportPaths = transformExportPaths;
//# sourceMappingURL=transformImportPaths.js.map