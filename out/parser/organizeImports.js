"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizeImports = void 0;
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const memoizedParse_1 = require("./memoizedParse");
function organizeImports(code) {
    const node = (0, memoizedParse_1.memoizedParse)(code, constants_1.PARSER_OPTIONS);
    const imports = node.body.filter((d) => d.type === "ImportDeclaration");
    if (imports.length === 0) {
        return code;
    }
    const beforeImportsIndex = imports[0].range[0];
    const beforeImportsCode = code.slice(0, beforeImportsIndex);
    let importsWithCode = imports.map((node) => {
        let [a, b] = node.range;
        if (code[b] === "\n") {
            b += 1;
        }
        return {
            node,
            code: code.slice(node.range[0], node.range[1]),
            range: [a, b],
        };
    });
    importsWithCode = (0, lodash_1.sortBy)(importsWithCode, (d) => [
        d.node?.source?.value?.startsWith(".") ? 1 : 0,
        d.node?.source?.value,
    ]);
    const ranges = importsWithCode.map((d) => d.range);
    code = (0, utils_1.deleteRanges)(code, [...ranges, [0, beforeImportsIndex]]);
    const codeToInsert = beforeImportsCode + importsWithCode.map((d) => d.code).join("\n");
    return codeToInsert + "\n" + code;
    //   const project = new Project();
    //   const sourceFile = project.createSourceFile("file.ts", code);
    //   sourceFile.organizeImports({});
    //   const result = sourceFile.getText();
    //   return result;
}
exports.organizeImports = organizeImports;
// const code = `/* eslint-disable react/no-unescaped-entities */
// import { NewIcon } from './w';
// import { NewIcons } from '@eog/geode-iconsv2';
// console.log('')`;
// console.log(organizeImports(code));
//# sourceMappingURL=organizeImports.js.map