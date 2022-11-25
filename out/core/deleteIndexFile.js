"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIndexFile = void 0;
const lodash_1 = require("lodash");
const deleteFile_1 = require("../file-helpers/deleteFile");
const getIndexFilesInFolder_1 = require("../file-helpers/getIndexFilesInFolder");
const isFile_1 = require("../file-helpers/isFile");
const readFileContents_1 = require("../file-helpers/readFileContents");
const removeFileExtension_1 = require("../file-helpers/removeFileExtension");
const writeToFile_1 = require("../file-helpers/writeToFile");
const createGraph_1 = require("../graph/createGraph");
const deleteIndexFileInfo_1 = require("../graph/deleteIndexFileInfo");
const performImportEditsOnFile_1 = require("../parser/performImportEditsOnFile");
function deleteIndexFile(workspaceDirectory, selectedDirectory) {
    if ((0, isFile_1.isFile)(selectedDirectory)) {
        throw Error("Must select a folder");
    }
    const graph = (0, createGraph_1.createGraph)(workspaceDirectory);
    const indexFiles = (0, getIndexFilesInFolder_1.getIndexFilesInFolder)(selectedDirectory);
    if (indexFiles.length === 0) {
        throw Error("No index files found");
    }
    else if (indexFiles.length > 1) {
        throw Error(`Multiple index files found: ${indexFiles.join(", ")}`);
    }
    const importNodes = graph
        .getNodes()
        .filter((d) => d.type === "Import" || d.type === "ImportAll");
    const exportNodes = graph
        .getNodes()
        .filter((d) => d.type === "ExportAllProxy" || d.type === "ExportProxy");
    const groupedImportsByFile = (0, lodash_1.groupBy)(importNodes, (d) => d.fileWithExtension);
    const groupedExportsByFile = (0, lodash_1.groupBy)(exportNodes, (d) => d.fileWithExtension);
    const indexFile = indexFiles[0];
    const indexFileNoExtension = (0, removeFileExtension_1.removeFileExtension)(indexFile);
    const proxied = (0, deleteIndexFileInfo_1.indexFileImports)(graph, indexFile);
    const allFiles = Array.from(new Set([...(0, lodash_1.keys)(groupedExportsByFile), ...(0, lodash_1.keys)(groupedImportsByFile)]));
    const edits = [];
    for (const file of allFiles) {
        const imports = groupedImportsByFile[file] || [];
        const exports = groupedExportsByFile[file] || [];
        const exportsToFix = (0, deleteIndexFileInfo_1.transformExports)(indexFileNoExtension, proxied, exports);
        const importsToFix = (0, deleteIndexFileInfo_1.deleteIndexFileInfo)(indexFileNoExtension, proxied, imports);
        if (importsToFix.length || exportsToFix.length) {
            const oldCode = (0, readFileContents_1.readFileContents)(file);
            const newCode = (0, performImportEditsOnFile_1.performImportEditsOnFile)(oldCode, importsToFix, exportsToFix);
            edits.push({ file, oldCode, newCode: newCode });
        }
    }
    for (const edit of edits) {
        (0, writeToFile_1.writeToFile)(edit.file, edit.newCode);
    }
    (0, deleteFile_1.deleteFile)(indexFile);
    return `Done! ${edits.length} File${edits.length === 1 ? "" : "s"} Editted.`;
}
exports.deleteIndexFile = deleteIndexFile;
//# sourceMappingURL=deleteIndexFile.js.map