"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGraph = void 0;
const getAllFilesInFolder_1 = require("../file-traverse/getAllFilesInFolder");
const readFileContents_1 = require("../file-traverse/readFileContents");
const transformImportPaths_1 = require("../file-traverse/transformImportPaths");
const parseExports_1 = require("../parser/parseExports");
const parseImports_1 = require("../parser/parseImports");
const Graph_1 = require("./Graph");
function createGraph(innerDirectory, outerDirectory) {
    const allFolders = (0, getAllFilesInFolder_1.getAllFoldersInFolder)(outerDirectory);
    const allFoldersSet = new Set(allFolders);
    const innerFiles = (0, getAllFilesInFolder_1.getAllFilesInFolder)(innerDirectory);
    const outerFiles = (0, getAllFilesInFolder_1.getAllFilesInFolder)(outerDirectory);
    console.log({ allFolders: JSON.stringify(allFolders) });
    const exps = [];
    innerFiles.forEach((file) => {
        const code = (0, readFileContents_1.readFileContents)(file);
        try {
            const parsed = (0, parseExports_1.parseExports)(code, file);
            exps.push(...parsed.map((n) => (0, transformImportPaths_1.transformExportPaths)(n, allFoldersSet)));
        }
        catch (e) {
            console.log(`Failed parsing imports for ${file}: ${e}`);
        }
    });
    const imps = [];
    outerFiles.forEach((file) => {
        const code = (0, readFileContents_1.readFileContents)(file);
        try {
            const parsed = (0, parseImports_1.parseImports)(code, file);
            imps.push(...parsed.map((n) => (0, transformImportPaths_1.transformImportPaths)(n, allFoldersSet)));
        }
        catch (e) {
            console.log(`Failed parsing exports for ${file}: ${e}`);
        }
    });
    // console.log(JSON.stringify([...exps, ...imps], undefined, 2));
    const graph = new Graph_1.ExportGraph([...exps, ...imps]);
    return graph;
}
exports.createGraph = createGraph;
//# sourceMappingURL=createGraph.js.map