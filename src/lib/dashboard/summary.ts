import "server-only";

import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardGraphData, DashboardSummary } from "@/types/dashboard";
import type { ModuleDefinition } from "@/types/domain";

type DashboardKind = "admin" | "teacher";

function numberText(value: number) {
  return new Intl.NumberFormat("en-PH").format(value);
}

function percentText(value: number | null) {
  if (value === null || Number.isNaN(value)) return "No data";

  return `${value.toFixed(1)}%`;
}

function average(values: number[]) {
  if (!values.length) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function attendanceValue(status: string) {
  if (status === "absent") return 0;
  if (status === "half_day") return 0.5;

  return 1;
}

function defaultGraphs(modules: ModuleDefinition[]): DashboardGraphData {
  const orderedPhases = [
    ...new Set(
      modules
        .map((module) => Number(module.phase.replace(/\D/g, "")))
        .filter(Boolean)
        .sort((a, b) => a - b),
    ),
  ];
  const phaseTrend = orderedPhases.map((phase) => ({
    name: `P${phase}`,
    value: modules.filter(
      (module) => Number(module.phase.replace(/\D/g, "")) <= phase,
    ).length,
  }));
  const inIds = (ids: string[]) =>
    modules.filter((module) => ids.includes(module.id)).length;

  return {
    phaseTrend,
    operationalFocus: [
      { name: "Learners", value: inIds(["learners", "promotion"]) },
      { name: "Attendance", value: inIds(["attendance", "reports"]) },
      {
        name: "Grades",
        value: inIds(["grades", "analytics", "literacy-numeracy"]),
      },
      { name: "Support", value: inIds(["interventions", "certificates"]) },
      { name: "AI", value: inIds(["ai", "lesson-plans"]) },
    ],
    supportMix: [
      { name: "Records", value: inIds(["learners", "sections"]) },
      { name: "Learning", value: inIds(["grades", "literacy-numeracy"]) },
      { name: "Follow-up", value: inIds(["interventions", "reports"]) },
      { name: "Automation", value: inIds(["ai", "lesson-plans"]) },
    ],
  };
}

function defaultSummary(
  kind: DashboardKind,
  modules: ModuleDefinition[],
): DashboardSummary {
  return {
    stats: [
      {
        label: "Available modules",
        value: numberText(modules.length),
        detail:
          kind === "admin" ? "Admin console workflows" : "Teacher workflows",
        icon: "SquaresFour",
        tone: "sky",
      },
      {
        label: "Build phases",
        value: numberText(new Set(modules.map((module) => module.phase)).size),
        detail: "Implemented portal areas",
        icon: "ChartLineUp",
        tone: "purple",
      },
      {
        label: "Audit posture",
        value: "Designed",
        detail: "Sensitive workflows list audit events",
        icon: "ShieldCheck",
        tone: "green",
      },
      {
        label: "Live data",
        value: "Pending",
        detail: "Charts will reflect Supabase once records exist",
        icon: "Database",
        tone: "amber",
      },
    ],
    graphs: defaultGraphs(modules),
    insights: [
      {
        title: "Prototype styling applied",
        text: "The portal dashboard uses the prototype card, graph, and navigation patterns.",
        action: "Review the dashboard visually",
      },
      {
        title: "Live records ready",
        text: "Dashboard metrics switch to Supabase-visible records when data is available.",
        action: "Seed or encode learners and attendance",
      },
    ],
  };
}

export async function getDashboardSummary(
  kind: DashboardKind,
  modules: ModuleDefinition[],
): Promise<DashboardSummary> {
  const fallback = defaultSummary(kind, modules);

  if (!isSupabaseConfigured()) return fallback;

  try {
    const supabase = await createSupabaseServerClient();
    const [
      learnerCountResult,
      staffCountResult,
      sectionCountResult,
      eventPendingResult,
      aiLogCountResult,
      attendanceResult,
      gradeResult,
      riskResult,
      interventionResult,
    ] = await Promise.all([
      supabase
        .from("learners")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("profiles")
        .select("user_id", { count: "exact", head: true })
        .eq("status", "active")
        .in("role", ["adviser", "subject_teacher"]),
      supabase.from("sections").select("id", { count: "exact", head: true }),
      supabase
        .from("public_events")
        .select("id", { count: "exact", head: true })
        .eq("review_status", "pending"),
      supabase
        .from("ai_activity_logs")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("attendance_records")
        .select("am_status,pm_status")
        .limit(800),
      supabase.from("grades").select("numeric_grade").limit(800),
      supabase
        .from("risk_flags")
        .select("severity")
        .is("resolved_at", null)
        .limit(800),
      supabase.from("interventions").select("status").limit(800),
    ]);

    const attendanceRecords = attendanceResult.data ?? [];
    const attendanceTotal = attendanceRecords.length * 2;
    const attendanceEarned = attendanceRecords.reduce(
      (sum, record) =>
        sum +
        attendanceValue(record.am_status) +
        attendanceValue(record.pm_status),
      0,
    );
    const attendanceRate = attendanceTotal
      ? (attendanceEarned / attendanceTotal) * 100
      : null;
    const grades = (gradeResult.data ?? []).map((grade) =>
      Number(grade.numeric_grade),
    );
    const gradeAverage = average(grades);
    const risks = riskResult.data ?? [];
    const interventions = interventionResult.data ?? [];
    const openInterventions = interventions.filter(
      (intervention) =>
        intervention.status === "planned" || intervention.status === "ongoing",
    ).length;
    const gradeBands = [
      { name: "Below 75", value: grades.filter((grade) => grade < 75).length },
      {
        name: "75-79",
        value: grades.filter((grade) => grade >= 75 && grade < 80).length,
      },
      {
        name: "80-89",
        value: grades.filter((grade) => grade >= 80 && grade < 90).length,
      },
      { name: "90+", value: grades.filter((grade) => grade >= 90).length },
    ];
    const supportMix = [
      {
        name: "Low",
        value: risks.filter((risk) => risk.severity === "low").length,
      },
      {
        name: "Moderate",
        value: risks.filter((risk) => risk.severity === "moderate").length,
      },
      {
        name: "High",
        value: risks.filter((risk) => risk.severity === "high").length,
      },
      {
        name: "Critical",
        value: risks.filter((risk) => risk.severity === "critical").length,
      },
    ];

    return {
      stats: [
        {
          label: kind === "admin" ? "Active learners" : "Visible learners",
          value: numberText(learnerCountResult.count ?? 0),
          detail: "Active learner records",
          icon: "UsersThree",
          tone: "sky",
        },
        {
          label: kind === "admin" ? "Active teachers" : "Sections",
          value: numberText(
            kind === "admin"
              ? (staffCountResult.count ?? 0)
              : (sectionCountResult.count ?? 0),
          ),
          detail:
            kind === "admin"
              ? "Adviser and subject teacher accounts"
              : "Visible teaching sections",
          icon: kind === "admin" ? "ChalkboardTeacher" : "Rows",
          tone: "purple",
        },
        {
          label: "Attendance rate",
          value: percentText(attendanceRate),
          detail: "From visible AM/PM records",
          icon: "CalendarCheck",
          tone: "green",
        },
        {
          label: "Grade average",
          value:
            gradeAverage === null || Number.isNaN(gradeAverage)
              ? "No data"
              : gradeAverage.toFixed(1),
          detail: "From visible encoded grades",
          icon: "BookOpenText",
          tone: "navy",
        },
        {
          label: "Open support",
          value: numberText(risks.length + openInterventions),
          detail: "Unresolved risks and active interventions",
          icon: "FlagBanner",
          tone: risks.length + openInterventions ? "red" : "green",
        },
        {
          label: "Pending events",
          value: numberText(eventPendingResult.count ?? 0),
          detail: "Awaiting admin approval",
          icon: "CalendarDots",
          tone: "amber",
        },
      ],
      graphs: {
        phaseTrend: fallback.graphs.phaseTrend,
        operationalFocus: [
          { name: "Learners", value: learnerCountResult.count ?? 0 },
          { name: "Sections", value: sectionCountResult.count ?? 0 },
          { name: "Attendance", value: attendanceRecords.length },
          { name: "Grades", value: grades.length },
          { name: "AI logs", value: aiLogCountResult.count ?? 0 },
        ],
        supportMix: supportMix.some((item) => item.value > 0)
          ? supportMix
          : gradeBands,
      },
      insights: [
        {
          title: "Attendance watch",
          text:
            attendanceRate === null
              ? "Attendance charts will populate after AM/PM records are encoded."
              : `Visible attendance is currently ${percentText(attendanceRate)}.`,
          action: "Open attendance records",
        },
        {
          title: "Academic support",
          text:
            gradeAverage === null
              ? "Grade charts will populate after teachers encode grades."
              : `The visible grade average is ${gradeAverage.toFixed(1)}.`,
          action: "Review grade entries",
        },
        {
          title: "Event approval",
          text: `${numberText(eventPendingResult.count ?? 0)} event request(s) are waiting for review.`,
          action: "Open event calendar",
        },
      ],
    };
  } catch {
    return fallback;
  }
}
