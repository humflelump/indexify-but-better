"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformExportPaths = exports.transformImportPaths = void 0;
const getAbsolutePath_1 = require("./getAbsolutePath");
function removeFileExtension(file) {
    for (let i = file.length - 1; i >= 1; i--) {
        const c = file[i];
        if (c === "/") {
            return file;
        }
        if (c === ".") {
            return file.slice(0, i);
        }
    }
    return file;
}
function transformImportPaths(im, folders) {
    im = { ...im };
    im.file = removeFileExtension(im.file);
    let importPath = (0, getAbsolutePath_1.getAbsolutePath)(im.file, im.source);
    if (folders.has(importPath)) {
        importPath += "/index";
    }
    im.source = removeFileExtension(importPath);
    return im;
}
exports.transformImportPaths = transformImportPaths;
function transformExportPaths(ex, folders) {
    ex = { ...ex };
    ex.file = removeFileExtension(ex.file);
    if (ex.type === "NewExport") {
        return ex;
    }
    let importPath = (0, getAbsolutePath_1.getAbsolutePath)(ex.file, ex.source);
    if (folders.has(importPath)) {
        importPath += "/index";
    }
    ex.source = removeFileExtension(importPath);
    return ex;
}
exports.transformExportPaths = transformExportPaths;
//# sourceMappingURL=transformImportPaths.js.map