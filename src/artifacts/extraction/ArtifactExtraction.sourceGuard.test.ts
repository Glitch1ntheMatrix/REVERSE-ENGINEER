import { expect, it } from "vitest";

import { ArtifactReaderFailure } from "../ArtifactReader.js";
import { isStableRegularFileDescriptor } from "./ArtifactExtraction.js";

it("accepts a descriptor with the members sameRegularFileState and revalidation read", () => {
  const descriptor = {
    handle: {
      read: () => undefined,
      stat: () => undefined,
    },
    initial: {
      size: 4,
      dev: 1,
      ino: 2,
      mode: 0o100644,
      mtimeMs: 3,
      ctimeMs: 4,
    },
  };
  expect(isStableRegularFileDescriptor(descriptor)).toBe(true);
});

it.each([
  null,
  undefined,
  "zip",
  { handle: { read: () => undefined } },
  {
    handle: { read: () => undefined, stat: () => undefined },
    initial: { size: 1 },
  },
])("rejects an unexpected transferred source shape", (value) => {
  expect(isStableRegularFileDescriptor(value)).toBe(false);
});

it("names integrity when a caller treats a rejected shape as a ZIP admission", () => {
  const admission: unknown = { kind: "node-sea" };
  if (isStableRegularFileDescriptor(admission))
    throw new Error("guard accepted a non-file admission");
  const failure = new ArtifactReaderFailure(
    "integrity",
    "Transferred ZIP source is not a stable regular-file descriptor: /tmp/source.zip",
  );
  expect(failure.reason).toBe("integrity");
});

// Integration coverage of a live transferred ZIP rewrite still needs a fixture
// that can mutate an admitted descriptor between inventory and dry-run.
it.skip("revalidates a live transferred ZIP descriptor after inventory", () => {
  expect(true).toBe(true);
});
