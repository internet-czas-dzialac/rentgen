import { flattenObject, maskString } from "./util";

console.log(flattenObject({ a: { b: { c: [1, 2, 3] } } }));

console.log(maskString("abcdefghijklmnopqrstuvwxyz", 1 / 3, 5));

console.log(maskString("abcdefghijklmnopqrstuvwxyz", 1, 30));
