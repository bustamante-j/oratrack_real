export type DashboardGraphDatum = {
  name: string;
  value: number;
};

export type DashboardGraphData = {
  phaseTrend: DashboardGraphDatum[];
  operationalFocus: DashboardGraphDatum[];
  supportMix: DashboardGraphDatum[];
};

export type DashboardStat = {
  label: string;
  value: string;
  detail: string;
  icon: string;
  tone: "amber" | "green" | "navy" | "purple" | "red" | "sky";
};

export type DashboardSummary = {
  stats: DashboardStat[];
  graphs: DashboardGraphData;
  insights: Array<{
    title: string;
    text: string;
    action: string;
  }>;
};
