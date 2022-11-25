"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizeImports = void 0;
const ts_morph_1 = require("ts-morph");
function organizeImports(code) {
    const project = new ts_morph_1.Project();
    const sourceFile = project.createSourceFile("file.ts", code);
    sourceFile.organizeImports();
    const result = sourceFile.getText();
    return result;
}
exports.organizeImports = organizeImports;
//# sourceMappingURL=organizeImports.js.map