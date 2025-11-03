declare module "tweetnacl-util" {
  const util: {
    encodeBase64(data: Uint8Array): string;
    decodeBase64(data: string): Uint8Array;
    encodeUTF8(str: string): Uint8Array;
    decodeUTF8(arr: Uint8Array): string;
  };
  export default util;
}
