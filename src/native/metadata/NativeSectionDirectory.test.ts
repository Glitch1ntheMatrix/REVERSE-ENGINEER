import { expect, it } from "vitest";
import { pe } from "../../domain/binaryTarget.fixture.js";
import { BinaryFormatFailure } from "./BinaryContainer.js";
import { readPeSectionDirectory } from "./NativeSectionDirectory.js";

const readDirectory = (bytes: Buffer) => {
  const directory = readPeSectionDirectory(bytes.length);
  let next = directory.next();
  while (!next.done) {
    const { offset, size } = next.value;
    next = directory.next(bytes.subarray(offset, offset + size));
  }
  return next.value;
};

it("classifies a confirmed overlapping PE section directory as an unsupported layout", () => {
  try {
    readDirectory(pe(0x014c, 4));
    throw new Error("Expected an unsupported PE layout");
  } catch (cause) {
    expect(cause).toBeInstanceOf(BinaryFormatFailure);
    expect(cause).toMatchObject({ kind: "unsupported" });
    expect((cause as Error).message).toContain("overlapping PE header");
  }
});

it("keeps an unconfirmed overlapping PE pointer malformed", () => {
  const bytes = pe(0x014c, 4);
  bytes.write("NOPE", 4, "ascii");
  expect(() => readDirectory(bytes)).toThrowError(
    expect.objectContaining({ kind: "malformed" }),
  );
});

it("keeps a truncated overlapping PE signature window malformed", () => {
  const bytes = Buffer.alloc(64);
  bytes.write("MZ", "ascii");
  bytes.writeUInt32LE(63, 60);
  expect(() => readDirectory(bytes)).toThrowError(
    expect.objectContaining({ kind: "malformed" }),
  );
});
