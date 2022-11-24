"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchNode = void 0;
function searchNode(obj, filterKey, criteria) {
    const results = [];
    function helper(obj) {
        if (criteria(obj)) {
            results.push(obj);
        }
        if (Array.isArray(obj)) {
            obj.forEach(helper);
        }
        else if (obj && typeof obj === "object") {
            const keys = Object.keys(obj);
            for (let i = 0; i < keys.length; i += 1) {
                const key = keys[i];
                if (filterKey(key, obj)) {
                    helper(obj[key]);
                }
            }
        }
    }
    helper(obj);
    return results;
}
exports.searchNode = searchNode;
//# sourceMappingURL=searchNode.js.map