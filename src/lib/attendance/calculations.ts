import { attendancePolicy } from "@/lib/constants";
import type { AttendanceStatus } from "@/types/domain";

export type AttendanceSessionPair = {
  amStatus: AttendanceStatus;
  pmStatus: AttendanceStatus;
};

export type AttendanceTotals = {
  presentDays: number;
  absentDays: number;
  lateCount: number;
  excusedDays: number;
  convertedLateAbsences: number;
  attendancePercentage: number;
  isAbsenteeismRisk: boolean;
};

function statusWeight(status: AttendanceStatus) {
  if (status === "present" || status === "late") return 0.5;
  if (status === "half_day") return 0.25;
  return 0;
}

function absenceWeight(status: AttendanceStatus) {
  if (status === "absent") return 0.5;
  if (status === "half_day") return 0.25;
  return 0;
}

export function calculateAttendanceTotals(
  records: AttendanceSessionPair[],
): AttendanceTotals {
  const totalDays = records.length;
  const presentDays = records.reduce(
    (sum, record) =>
      sum + statusWeight(record.amStatus) + statusWeight(record.pmStatus),
    0,
  );
  const rawAbsentDays = records.reduce(
    (sum, record) =>
      sum + absenceWeight(record.amStatus) + absenceWeight(record.pmStatus),
    0,
  );
  const excusedDays = records.reduce(
    (sum, record) =>
      sum +
      (record.amStatus === "excused" ? 0.5 : 0) +
      (record.pmStatus === "excused" ? 0.5 : 0),
    0,
  );
  const lateCount = records.reduce(
    (sum, record) =>
      sum +
      (record.amStatus === "late" ? 1 : 0) +
      (record.pmStatus === "late" ? 1 : 0),
    0,
  );
  const convertedLateAbsences = Math.floor(
    lateCount / attendancePolicy.tardiesPerAbsence,
  );
  const absentDays = rawAbsentDays + convertedLateAbsences;
  const attendancePercentage =
    totalDays === 0
      ? 0
      : Math.max(0, (presentDays - convertedLateAbsences) / totalDays);

  return {
    presentDays,
    absentDays,
    lateCount,
    excusedDays,
    convertedLateAbsences,
    attendancePercentage,
    isAbsenteeismRisk:
      totalDays > 0 &&
      absentDays / totalDays >= attendancePolicy.absenteeismRiskThreshold,
  };
}
