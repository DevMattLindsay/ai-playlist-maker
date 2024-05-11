export function getUniqueArrayByKey(arr: any[], key: string) {
  const res = new Map();
  return arr.filter((item) => !res.has(item[key]) && res.set(item[key], 1));
}
