import { parse } from "@typescript-eslint/typescript-estree";

const cache: { [code: string]: any } = {};

export const memoizedParse: typeof parse = (code, options) => {
  let result = cache[code];
  if (result !== undefined) {
    return result;
  }
  try {
    result = parse(code, options);
  } catch (e) {
    result = parse("", options);
  }

  cache[code] = result;
  return result;
};
