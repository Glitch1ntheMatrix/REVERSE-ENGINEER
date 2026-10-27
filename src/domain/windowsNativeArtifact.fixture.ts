/** Inert PE32+ identity bytes for artifact admission; never a loadable native addon. */
export const windowsNativeArtifactBytes = (): Buffer => {
  const bytes = Buffer.alloc(152);
  bytes.write("MZ");
  bytes.writeUInt32LE(64, 0x3c);
  bytes.write("PE\0\0", 64, "ascii");
  bytes.writeUInt16LE(0x8664, 68);
  bytes.writeUInt16LE(64, 84);
  bytes.writeUInt16LE(0x20b, 88);
  return bytes;
};
