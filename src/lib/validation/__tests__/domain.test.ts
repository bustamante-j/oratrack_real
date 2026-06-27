import { describe, expect, it } from "vitest";

import { promotionBatchFormSchema } from "../domain";

const uuidA = "00000000-0000-4000-8000-000000000001";
const uuidB = "00000000-0000-4000-8000-000000000002";

describe("promotionBatchFormSchema", () => {
  it("accepts a source cohort and target class", () => {
    const parsed = promotionBatchFormSchema.parse({
      sourceSchoolYearId: uuidA,
      targetSchoolYearId: uuidB,
      sourceGradeLevelId: "5",
      targetGradeLevelId: "6",
      enrolledOn: "2026-06-27",
    });

    expect(parsed.sourceGradeLevelId).toBe(5);
    expect(parsed.targetGradeLevelId).toBe(6);
  });

  it("requires different school years", () => {
    expect(() =>
      promotionBatchFormSchema.parse({
        sourceSchoolYearId: uuidA,
        targetSchoolYearId: uuidA,
        targetGradeLevelId: "6",
      }),
    ).toThrow();
  });
});
