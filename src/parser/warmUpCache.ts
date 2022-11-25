import { PARSER_OPTIONS } from "../constants";
import { getAllFilesInFolder } from "../file-helpers/getAllFilesInFolder";
import { readFileContents } from "../file-helpers/readFileContents";
import { getWorkspace } from "../utils";
import { memoizedParse } from "./memoizedParse";

export function warmUpCache(retries = 0): void {
  if (retries > 100) {
    return;
  }

  const workspace = getWorkspace();
  if (!workspace) {
    setTimeout(() => warmUpCache(retries + 1), 100);
    return;
  }

  const files = getAllFilesInFolder(workspace);

  function run(index: number) {
    if (index >= files.length) {
      console.log("Cache is Warm");
      return;
    }
    const code = readFileContents(files[index]);
    memoizedParse(code, PARSER_OPTIONS);
    setTimeout(() => run(index + 1), 1);
  }
  run(0);
}
