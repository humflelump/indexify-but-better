"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGraph = void 0;
const getAllFilesInFolder_1 = require("../file-helpers/getAllFilesInFolder");
const readFileContents_1 = require("../file-helpers/readFileContents");
const transformImportPaths_1 = require("../file-helpers/transformImportPaths");
const parseExports_1 = require("../parser/parseExports");
const parseImports_1 = require("../parser/parseImports");
const Graph_1 = require("./Graph");
function createGraph(directory) {
    const allFolders = (0, getAllFilesInFolder_1.getAllFoldersInFolder)(directory);
    const allFoldersSet = new Set(allFolders);
    const files = (0, getAllFilesInFolder_1.getAllFilesInFolder)(directory);
    const exps = [];
    const imps = [];
    files.forEach((file) => {
        const code = (0, readFileContents_1.readFileContents)(file);
        try {
            const parsed = (0, parseExports_1.parseExports)(code, file);
            exps.push(...parsed.map((n) => (0, transformImportPaths_1.transformExportPaths)(n, allFoldersSet)));
        }
        catch (e) {
            console.log(`Failed parsing imports for ${file}: ${e}`);
        }
        try {
            const parsed = (0, parseImports_1.parseImports)(code, file);
            imps.push(...parsed.map((n) => (0, transformImportPaths_1.transformImportPaths)(n, allFoldersSet)));
        }
        catch (e) {
            console.log(`Failed parsing exports for ${file}: ${e}`);
        }
    });
    const graph = new Graph_1.ExportGraph([...exps, ...imps]);
    return graph;
}
exports.createGraph = createGraph;
//# sourceMappingURL=createGraph.js.map