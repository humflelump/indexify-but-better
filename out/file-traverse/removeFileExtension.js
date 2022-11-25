"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFileExtension = void 0;
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
exports.removeFileExtension = removeFileExtension;
//# sourceMappingURL=removeFileExtension.js.map