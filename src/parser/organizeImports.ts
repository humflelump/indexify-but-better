import { sortBy } from "lodash";
import { Project, FormatCodeSettings } from "ts-morph";
import { PARSER_OPTIONS } from "../constants";
import { deleteRanges } from "../utils";
import { memoizedParse } from "./memoizedParse";

export function organizeImports(code: string) {
  const node = memoizedParse(code, PARSER_OPTIONS);
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
      range: [a, b] as [number, number],
    };
  });
  importsWithCode = sortBy(importsWithCode, (d: any) => [
    d.node?.source?.value?.startsWith(".") ? 1 : 0,
    d.node?.source?.value,
  ]);
  const ranges = importsWithCode.map((d) => d.range);
  code = deleteRanges(code, [...ranges, [0, beforeImportsIndex]]);

  const codeToInsert =
    beforeImportsCode + importsWithCode.map((d) => d.code).join("\n");
  return codeToInsert + "\n" + code;

  //   const project = new Project();
  //   const sourceFile = project.createSourceFile("file.ts", code);
  //   sourceFile.organizeImports({});
  //   const result = sourceFile.getText();
  //   return result;
}

// const code = `/* eslint-disable react/no-unescaped-entities */
// import { NewIcon } from './w';
// import { NewIcons } from '@eog/geode-iconsv2';

// console.log('')`;

// console.log(organizeImports(code));
