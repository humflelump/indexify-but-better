import { Project } from "ts-morph";

export function organizeImports(code: string) {
  const project = new Project();
  const sourceFile = project.createSourceFile("file.ts", code);
  sourceFile.organizeImports();
  const result = sourceFile.getText();
  return result;
}
