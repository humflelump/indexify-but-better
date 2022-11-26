import { isFile } from "./isFile";
import { removeFileExtension } from "./removeFileExtension";

export function folderForClickedIndexFile(directory: string) {
  if (!isFile(directory)) {
    return directory;
  }
  const noExt = removeFileExtension(directory);
  if (noExt.endsWith("index")) {
    const split = noExt.split("/");
    split.pop();
    return split.join("/");
  }
  return null;
}
