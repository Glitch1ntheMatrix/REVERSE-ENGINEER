import { describe, expect, it } from "vitest";

import {
  timedCaptureEvidence,
  type TimedCaptureRow,
} from "../../../tests/fixtures/analysisView.js";
import {
  DONE_CLOCK_ROWS,
  FEWER_MEMBERS_ROWS,
  NUMBERED_UNLESS_SENT_ROWS,
  PUT_CLEARS_ROWS,
} from "../../../tests/fixtures/environmentStateVariedCalls.js";
import { environmentStateViewOf } from "../../../tests/fixtures/environmentStateWrites.js";

const planOf = (rows: readonly TimedCaptureRow[], tool: string) => {
  const plan = environmentStateViewOf(timedCaptureEvidence(rows)).writes.find(
    (candidate) => candidate.tool === tool,
  );
  if (plan === undefined) throw new Error(`No plan for ${tool}`);
  return plan;
};

describe("writes whose calls send different members", () => {
  it("serves an update a later call sends fewer members to, requiring only those every call sent", () => {
    const plan = planOf(FEWER_MEMBERS_ROWS, "put_contacts_by_id");
    expect(plan).toMatchObject({ served: true });
    expect(plan.body?.required).toEqual(["email"]);
    expect(plan.body?.accepted).toEqual(
      expect.arrayContaining(["name", "city", "email"]),
    );
  });

  it("serves a create whose member one call sent and another left for the application to number", () => {
    const plan = planOf(NUMBERED_UNLESS_SENT_ROWS, "post_bundles");
    expect(plan).toMatchObject({ served: true });
    expect(plan.rules).toContainEqual({
      field: "order",
      rule: "sequence",
      scope: "collection",
      sent: true,
    });
    expect(plan.body?.required).toEqual(["name"]);
  });

  it("confirms an update whose read shows the clock it stamped to the second", () => {
    expect(planOf(DONE_CLOCK_ROWS, "patch_tasks_by_id")).toMatchObject({
      served: true,
    });
  });

  it("serves a PUT that clears a member it left out, as a default", () => {
    const plan = planOf(PUT_CLEARS_ROWS, "put_tags_by_id");
    expect(plan).toMatchObject({ served: true });
    expect(plan.body?.defaults).toEqual([{ member: "owner", value: null }]);
  });
});
