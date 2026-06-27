import { describe, expect, it } from "vitest";

import { calculateAttendanceTotals } from "../calculations";

describe("calculateAttendanceTotals", () => {
  it("counts AM and PM attendance as half-day sessions", () => {
    const totals = calculateAttendanceTotals([
      { amStatus: "present", pmStatus: "present" },
      { amStatus: "present", pmStatus: "absent" },
      { amStatus: "excused", pmStatus: "present" },
    ]);

    expect(totals.presentDays).toBe(2);
    expect(totals.absentDays).toBe(0.5);
    expect(totals.excusedDays).toBe(0.5);
  });

  it("converts five tardies into one absence", () => {
    const totals = calculateAttendanceTotals([
      { amStatus: "late", pmStatus: "late" },
      { amStatus: "late", pmStatus: "late" },
      { amStatus: "late", pmStatus: "present" },
    ]);

    expect(totals.lateCount).toBe(5);
    expect(totals.convertedLateAbsences).toBe(1);
    expect(totals.absentDays).toBe(1);
  });

  it("flags learners at or above the 20 percent absenteeism threshold", () => {
    const totals = calculateAttendanceTotals([
      { amStatus: "absent", pmStatus: "absent" },
      { amStatus: "present", pmStatus: "present" },
      { amStatus: "present", pmStatus: "present" },
      { amStatus: "present", pmStatus: "present" },
      { amStatus: "present", pmStatus: "present" },
    ]);

    expect(totals.absentDays).toBe(1);
    expect(totals.attendancePercentage).toBe(0.8);
    expect(totals.isAbsenteeismRisk).toBe(true);
  });
});
