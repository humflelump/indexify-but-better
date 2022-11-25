import * as assert from "assert";
import { text } from "stream/consumers";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import { getAbsolutePath } from "../../file-helpers/getAbsolutePath";
import { getRelativePath } from "../../file-helpers/getRelativePath";
import { removeFileExtension } from "../../file-helpers/removeFileExtension";
import {
  transformExportPaths,
  transformImportPaths,
} from "../../file-helpers/transformImportPaths";
import { organizeImports } from "../../parser/organizeImports";
import { parseExports } from "../../parser/parseExports";
import { parseImports } from "../../parser/parseImports";
import { performImportEditsOnFile } from "../../parser/performImportEditsOnFile";
import { BasicImport, ExportNode, ExportProxy, ImportNode } from "../../types";
import { deleteRanges } from "../../utils";
// import * as myExtension from '../../extension';

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Basic Single Export", () => {
    const code = "export const x = 1;";
    const nodes = parseExports(code, "file");
    const goal = [
      {
        type: "NewExport",
        range: [0, code.length],
        file: "file",
        name: "x",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Multiple Inline Export", () => {
    const code = `export const x = 5, y = 10;`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        type: "NewExport",
        range: [0, code.length],
        file: "file",
        name: "x",
      },
      {
        type: "NewExport",
        range: [0, code.length],
        file: "file",
        name: "y",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Array Spread Export", () => {
    const code = `export const [x, y] = [5, 10];`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        type: "NewExport",
        range: [0, code.length],
        file: "file",
        name: "x",
      },
      {
        type: "NewExport",
        range: [0, code.length],
        file: "file",
        name: "y",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Basic Object Spread", () => {
    const code = `export const { x } = { x: 5 };`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        type: "NewExport",
        range: [0, code.length],
        file: "file",
        name: "x",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Object Spread Rename", () => {
    const code = `export const { x: y } = { x: 5 };`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        type: "NewExport",
        range: [0, code.length],
        file: "file",
        name: "y",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Complex Object Spread", () => {
    const code = `export const { x: { y: { z: { a, b } } } } = { x: { y: { z: { "a": 1, b: 2 } } } };`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        type: "NewExport",
        range: [0, code.length],
        file: "file",
        name: "a",
      },
      {
        type: "NewExport",
        range: [0, code.length],
        file: "file",
        name: "b",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Basic Function Export", () => {
    const code = `export function myFunction() { console.log('hello'); }`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        type: "NewExport",
        range: [0, code.length],
        file: "file",
        name: "myFunction",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Basic Generator Function Export", () => {
    const code = `export function* myFunction() { console.log('hello'); }`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        type: "NewExport",
        range: [0, code.length],
        file: "file",
        name: "myFunction",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Basic Class Export", () => {
    const code = `export class MyClass { x = 5 }`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        type: "NewExport",
        range: [0, code.length],
        file: "file",
        name: "MyClass",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Export Declared Variable", () => {
    const code = `let x = 5, y = 6; export { x, y };`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        type: "NewExport",
        range: [18, code.length],
        file: "file",
        name: "x",
      },
      {
        type: "NewExport",
        range: [18, code.length],
        file: "file",
        name: "y",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Export Declared Variable And Rename", () => {
    const code = `let x = 5; export { x as y };`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        type: "NewExport",
        range: [11, code.length],
        file: "file",
        name: "y",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Export Declared Variable And Rename As Default", () => {
    const code = `let x = 5; export { x as default, x as y };`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        type: "NewExport",
        range: [11, code.length],
        file: "file",
        name: "default",
      },
      {
        type: "NewExport",
        range: [11, code.length],
        file: "file",
        name: "y",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Basic Default Export", () => {
    const code = `export default 0;`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        type: "NewExport",
        range: [0, code.length],
        file: "file",
        name: "default",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Basic Export Proxy", () => {
    const code = `export { x } from './a';`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        type: "ExportProxy",
        range: [0, code.length],
        file: "file",
        source: "./a",
        exportName: "x",
        importName: "x",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Basic Export Proxy With Raname", () => {
    const code = `export { x, a as b, b as c, z as default } from './a';`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        type: "ExportProxy",
        range: [0, code.length],
        file: "file",
        source: "./a",
        exportName: "x",
        importName: "x",
      },
      {
        type: "ExportProxy",
        range: [0, code.length],
        file: "file",
        source: "./a",
        exportName: "b",
        importName: "a",
      },
      {
        type: "ExportProxy",
        range: [0, code.length],
        file: "file",
        source: "./a",
        exportName: "c",
        importName: "b",
      },
      {
        type: "ExportProxy",
        range: [0, code.length],
        file: "file",
        source: "./a",
        exportName: "default",
        importName: "z",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Basic Export All Proxy", () => {
    const code = `export * from './a';`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        range: [0, code.length],
        file: "file",
        type: "ExportAllProxy",
        source: "./a",
        exportName: null,
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Basic Named Export All Proxy", () => {
    const code = `export * as x from './a';`;
    const nodes = parseExports(code, "file");
    const goal = [
      {
        range: [0, code.length],
        file: "file",
        type: "ExportAllProxy",
        source: "./a",
        exportName: "x",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Basic Import", () => {
    const code = `import { a } from './a'`;
    const nodes = parseImports(code, "file");
    const goal: ImportNode[] = [
      {
        file: "file",
        source: "./a",
        type: "Import",
        name: "a",
        moduleName: "a",
        range: [0, code.length],
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Default Import", () => {
    const s1 = `import a from './a';`;
    const s2 = `import b from './b';`;
    const code = s1 + s2;
    const nodes = parseImports(code, "file");
    const goal: ImportNode[] = [
      {
        file: "file",
        source: "./a",
        type: "Import",
        name: "default",
        moduleName: "a",
        range: [0, s1.length],
      },
      {
        file: "file",
        source: "./b",
        type: "Import",
        name: "default",
        moduleName: "b",
        range: [s1.length, s1.length + s2.length],
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Import All", () => {
    const code = `import './all';`;
    const nodes = parseImports(code, "file");
    const goal: ImportNode[] = [
      {
        file: "file",
        source: "./all",
        type: "ImportAll",
        moduleName: null,
        range: [0, code.length],
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Import All With import()", () => {
    const code = `import('./all')`;
    const nodes = parseImports(code, "file");
    const goal: ImportNode[] = [
      {
        file: "file",
        source: "./all",
        type: "ImportAll",
        moduleName: null,
        range: [0, code.length],
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Import All Named", () => {
    const code = `import * as _ from './lodash';`;
    const nodes = parseImports(code, "file");
    const goal: ImportNode[] = [
      {
        file: "file",
        source: "./lodash",
        type: "ImportAll",
        moduleName: "_",
        range: [0, code.length],
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Import With Renaming", () => {
    const code = `import X, { a as b, c as d } from './a';`;
    const nodes = parseImports(code, "file");
    const goal: ImportNode[] = [
      {
        file: "file",
        source: "./a",
        type: "Import",
        name: "default",
        range: [0, code.length],
        moduleName: "X",
      },
      {
        file: "file",
        source: "./a",
        type: "Import",
        name: "a",
        range: [0, code.length],
        moduleName: "b",
      },
      {
        file: "file",
        source: "./a",
        type: "Import",
        name: "c",
        range: [0, code.length],
        moduleName: "d",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Import With Default And Export All", () => {
    const code = `import X, * as t from './a';`;
    const nodes = parseImports(code, "file");
    const goal: ImportNode[] = [
      {
        file: "file",
        source: "./a",
        type: "Import",
        name: "default",
        range: [0, code.length],
        moduleName: "X",
      },
      {
        file: "file",
        source: "./a",
        type: "ImportAll",
        range: [0, code.length],
        moduleName: "t",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Multi-Import", () => {
    const code = `import A from './a';
import { a as b } from './b';
console.log(b);
export { b };
import { c as d } from './d';
import './e';`;
    const nodes = parseImports(code, "file");
    const goal: ImportNode[] = [
      {
        file: "file",
        moduleName: "A",
        name: "default",
        range: [0, 20],
        source: "./a",
        type: "Import",
      },
      {
        file: "file",
        moduleName: "b",
        name: "a",
        range: [21, 50],
        source: "./b",
        type: "Import",
      },
      {
        file: "file",
        moduleName: "d",
        name: "c",
        range: [81, 110],
        source: "./d",
        type: "Import",
      },
      {
        file: "file",
        moduleName: null,
        range: [111, 124],
        type: "ImportAll",
        source: "./e",
      },
    ];
    assert.deepEqual(nodes, goal);
  });

  test("Basic Module Resolve", () => {
    const result = getAbsolutePath("/root/wow/tt.ts", "./x.ts");
    assert.deepEqual(result, "/root/wow/x.ts");
  });

  test("More Module Resolve", () => {
    const result = getAbsolutePath("/root/wow/tt.ts", "../../x.ts");
    assert.deepEqual(result, "/x.ts");
  });

  test("Even More Module Resolve", () => {
    const result = getAbsolutePath("/root/wow/tt.ts", "../../yo/hum/x.ts");
    assert.deepEqual(result, "/yo/hum/x.ts");
  });

  test("Basic Relative Path", () => {
    const result = getRelativePath("/root/wow/tt.ts", "/root/wow/xx.ts");
    assert.deepEqual(result, "./xx.ts");
  });

  test("More Relative Path", () => {
    const result = getRelativePath("/root/wow/tt.ts", "/root/xx.ts");
    assert.deepEqual(result, "../xx.ts");
  });

  test("Even More Relative Path", () => {
    const result = getRelativePath("/root/wow/tt.ts", "/root/hum/ugh/xx.ts");
    assert.deepEqual(result, "../hum/ugh/xx.ts");
  });

  test("Remove File Extension", () => {
    const result = removeFileExtension("/root/file.x.ts");
    assert.deepEqual(result, "/root/file.x");
  });

  test("Transform Imports", () => {
    const imp: ImportNode = {
      file: "/root/shared/component.ts",
      source: "../../misc",
      type: "Import",
      name: "default",
      moduleName: "a",
      range: [0, 0],
    };
    const goal: ImportNode = {
      file: "/root/shared/component",
      fileWithExtension: "/root/shared/component.ts",
      source: "/misc/index",
      type: "Import",
      name: "default",
      moduleName: "a",
      range: [0, 0],
    };
    const folders = new Set(["/root", "/root/shared", "/misc"]);
    const result = transformImportPaths(imp, folders);
    assert.deepEqual(result, goal);
  });

  test("Transform Exports", () => {
    const exp: ExportNode = {
      range: [0, 0],
      file: "/root/shared/component.ts",
      type: "ExportAllProxy",
      source: "../../misc",
      exportName: null,
    };
    const goal = {
      range: [0, 0],
      file: "/root/shared/component",
      fileWithExtension: "/root/shared/component.ts",
      type: "ExportAllProxy",
      source: "/misc/index",
      exportName: null,
    };
    const folders = new Set(["/root", "/root/shared", "/misc"]);
    const result = transformExportPaths(exp, folders);
    assert.deepEqual(result, goal);
  });

  test("Organize Imports", () => {
    const code = `import { a } from './file';
import { b } from './file';
console.log(a, b);`;

    const result = `import { a, b } from './file';
console.log(a, b);`;
    assert.deepEqual(organizeImports(code), result);
  });

  test("String Helper Delete Ranges", () => {
    const s = "abcdefghijk";
    const ranges: [number, number][] = [
      [0, 1],
      [0, 1],
      [2, 5],
      [2, 6],
      [8, 10],
    ];
    const goal = "bghk";
    assert.deepEqual(deleteRanges(s, ranges), goal);
  });

  test("Edit File Imports", () => {
    const code = `import { a } from './a';
console.log(a);`;

    const oldImport = parseImports(code, "file")[0];

    const newImport: BasicImport = {
      file: "/root/b",
      source: "/root/a",
      moduleName: "a",
      name: "b",
      range: [0, 0],
      type: "Import",
    };

    const editted = performImportEditsOnFile(
      code,
      [{ original: oldImport, next: [newImport] }],
      []
    );

    const goal = `import { b as a } from './a';
console.log(a);`;
    assert.equal(editted, goal);
  });

  test("Edit File Exports", () => {
    const code = `import { a } from './a';
console.log(a);
export { b } from './b'
console.log('hi');`;

    const oldExport = parseExports(code, "file")[0];

    const newExport: ExportProxy = {
      type: "ExportProxy",
      range: [0, 0],
      file: "/root/x",
      source: "/root/c",
      exportName: "c",
      importName: "d",
    };

    const editted = performImportEditsOnFile(
      code,
      [],
      [{ original: oldExport, next: [newExport] }]
    );

    const goal = `import { a } from './a';
console.log(a);
console.log('hi');
export { d as c } from './c';
`;
    assert.equal(editted, goal);
  });
});
