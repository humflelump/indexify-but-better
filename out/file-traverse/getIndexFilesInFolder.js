"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndexFilesInFolder = void 0;
const constants_1 = require("../constants");
const isFile_1 = require("./isFile");
function getIndexFilesInFolder(folder) {
    const result = [];
    constants_1.ALLOWED_ENTENSIONS.forEach((ext) => {
        const file = `${folder}/index${ext}`;
        if ((0, isFile_1.isFile)(file)) {
            result.push(file);
        }
    });
    return result;
}
exports.getIndexFilesInFolder = getIndexFilesInFolder;
//# sourceMappingURL=getIndexFilesInFolder.js.map