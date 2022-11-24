"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.formatAnalysis = exports.generateUri = exports.getTsConfigForSelectedDirectory = exports.getAllFilesInFolder = void 0;
const lodash_1 = require("lodash");
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
// function readFile(path: string) {
//   return fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
// }
const EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];
async function getAllFilesInFolder(path) {
    const result = [];
    async function helper(path) {
        const folders = getDirectories(path);
        const files = getFiles(path);
        // let count = 0;
        for (const file of files) {
            if (!EXTENSIONS.find((e) => file.endsWith(e))) {
                continue;
            }
            const filepath = `${path}/${file}`;
            result.push(filepath);
        }
        for (const folder of folders) {
            if (folder === "node_modules") {
                continue;
            }
            // console.log(folder);
            await helper(`${path}/${folder}`);
        }
    }
    await helper(path);
    return result;
}
exports.getAllFilesInFolder = getAllFilesInFolder;
// Picks the lowest tsconfig relevant to that directory
function getTsConfigForSelectedDirectory(dir, files) {
    files = files.filter((file) => file.endsWith("tsconfig.json"));
    const dirSplit = dir.split("/");
    function getSimilarity(file) {
        const split = file.split("/");
        let count = 0;
        for (let i = 0; i < split.length; i++) {
            if (split[i] === dirSplit[i]) {
                count += 1;
            }
        }
        return count;
    }
    files = (0, lodash_1.sortBy)(files, getSimilarity).reverse();
    return files[0] || null;
}
exports.getTsConfigForSelectedDirectory = getTsConfigForSelectedDirectory;
function generateUri(scheme, filename) {
    const cache = generateUri;
    cache.count || (cache.count = 0);
    cache.count += 1;
    return `${scheme}:${filename}.${cache.count}`;
}
exports.generateUri = generateUri;
function formatAnalysis(analysis, subfiles) {
    try {
        analysis = (0, lodash_1.mapValues)(analysis, (L) => {
            return L.filter((obj) => {
                if (!obj.location) {
                    return false;
                }
                if (!obj.exportName) {
                    return false;
                }
                for (const c of obj.exportName) {
                    if (c === "{" || c === "}") {
                        return false;
                    }
                }
                return true;
            });
        });
        const subfilesSet = new Set(subfiles);
        const NEWLINE = `
`;
        let files = Object.keys(analysis);
        files = files.filter((file) => subfilesSet.has(file));
        files = files.filter((file) => analysis[file].length);
        files = (0, lodash_1.sortBy)(files, (file) => analysis[file].length).reverse();
        const sections = files.map((file) => {
            return `${file}
${analysis[file]
                .map((obj) => `  "${obj.exportName}" (line ${obj.location.line})`)
                .join(NEWLINE)}`;
        });
        console.log("hit");
        return sections.join(NEWLINE);
    }
    catch (e) {
        return String(e);
    }
}
exports.formatAnalysis = formatAnalysis;
function search(obj, keyWhitelist, criteria) {
    const results = [];
    const keyWhitelistSet = new Set(keyWhitelist);
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
                if (keyWhitelistSet.has(key)) {
                    helper(obj[key]);
                }
            }
        }
    }
    helper(obj);
    return results;
}
exports.search = search;
//# sourceMappingURL=functions.js.map