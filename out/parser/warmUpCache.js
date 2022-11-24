"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warmUpCache = void 0;
const constants_1 = require("../constants");
const getAllFilesInFolder_1 = require("../file-traverse/getAllFilesInFolder");
const readFileContents_1 = require("../file-traverse/readFileContents");
const utils_1 = require("../utils");
const memoizedParse_1 = require("./memoizedParse");
function warmUpCache(retries = 0) {
    if (retries > 100) {
        return;
    }
    const workspace = (0, utils_1.getWorkspace)();
    if (!workspace) {
        setTimeout(() => warmUpCache(retries + 1), 100);
        return;
    }
    const files = (0, getAllFilesInFolder_1.getAllFilesInFolder)(workspace);
    function run(index) {
        if (index >= files.length) {
            console.log("Cache is Warm");
            return;
        }
        const code = (0, readFileContents_1.readFileContents)(files[index]);
        (0, memoizedParse_1.memoizedParse)(code, constants_1.PARSER_OPTIONS);
        setTimeout(() => run(index + 1), 1);
    }
    run(0);
}
exports.warmUpCache = warmUpCache;
//# sourceMappingURL=warmUpCache.js.map