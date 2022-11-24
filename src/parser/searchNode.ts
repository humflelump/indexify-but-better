export function searchNode(
  obj: any,
  filterKey: (key: string, obj: any) => boolean,
  criteria: (obj: any) => boolean
) {
  const results: any[] = [];
  function helper(obj: any) {
    if (criteria(obj)) {
      results.push(obj);
    }
    if (Array.isArray(obj)) {
      obj.forEach(helper);
    } else if (obj && typeof obj === "object") {
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        if (filterKey(key, obj)) {
          helper(obj[key]);
        }
      }
    }
  }
  helper(obj);
  return results;
}
