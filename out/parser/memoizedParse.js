"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoizedParse = void 0;
const typescript_estree_1 = require("@typescript-eslint/typescript-estree");
const cache = {};
const memoizedParse = (code, options) => {
    let result = cache[code];
    if (result !== undefined) {
        return result;
    }
    try {
        result = (0, typescript_estree_1.parse)(code, options);
    }
    catch (e) {
        result = (0, typescript_estree_1.parse)("", options);
    }
    cache[code] = result;
    return result;
};
exports.memoizedParse = memoizedParse;
//# sourceMappingURL=memoizedParse.js.map