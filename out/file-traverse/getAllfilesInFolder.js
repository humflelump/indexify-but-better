"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFoldersInFolder = exports.getAllFilesInFolder = void 0;
const constants_1 = require("../constants");
const fs = require("fs");
function getDirectories(path) {
    return fs.readdirSync(path).filter(function a(file) {
        return fs.statSync(`${path}/${file}`).isDirectory();
    });
}
function getFiles(path) {
    return fs.readdirSync(path).filter(function b(file) {
        return !fs.statSync(`${path}/${file}`).isDirectory();
    });
}
function getAllFilesInFolder(path) {
    const result = [];
    async function helper(path) {
        const folders = getDirectories(path);
        const files = getFiles(path);
        for (const file of files) {
            if (!constants_1.ALLOWED_ENTENSIONS.find((e) => file.endsWith(e))) {
                continue;
            }
            const filepath = `${path}/${file}`;
            result.push(filepath);
        }
        for (const folder of folders) {
            if (folder === "node_modules") {
                continue;
            }
            helper(`${path}/${folder}`);
        }
    }
    helper(path);
    return result;
}
exports.getAllFilesInFolder = getAllFilesInFolder;
function getAllFoldersInFolder(path) {
    const result = [];
    async function helper(path) {
        result.push(path);
        const folders = getDirectories(path);
        for (const folder of folders) {
            if (folder === "node_modules") {
                continue;
            }
            helper(`${path}/${folder}`);
        }
    }
    helper(path);
    return result;
}
exports.getAllFoldersInFolder = getAllFoldersInFolder;
//# sourceMappingURL=getAllFilesInFolder.js.map