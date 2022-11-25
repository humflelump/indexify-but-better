import { ALLOWED_ENTENSIONS } from "../constants";
import { isFile } from "./isFile";
import { readFileContents } from "./readFileContents";

export function getIndexFilesInFolder(folder: string) {
  const result: string[] = [];
  ALLOWED_ENTENSIONS.forEach((ext) => {
    const file = `${folder}/index${ext}`;
    if (isFile(file)) {
      result.push(file);
    }
  });
  return result;
}
