import { db } from "@/server/db";

export async function getForecastDashboardData() {
  // 1. Fetch total and pending events
  const { data: allEvents } = await (db as any).from("forecast_events").select("id, status");
  
  const total = allEvents?.length || 0;
  const pending = allEvents?.filter((e: any) => e.status === "OPEN" || e.status === "UNDER_REVIEW").length || 0;

  // 2. Fetch all resolutions for stats
  const { data: resolutions } = await (db as any).from("forecast_resolutions").select("id, outcome, resolved_at");
  
  const resolved = resolutions?.filter((r: any) => r.outcome !== "EXPIRED").length || 0;
  const expiredCount = resolutions?.filter((r: any) => r.outcome === "EXPIRED").length || 0;
  
  let successRate = 0;
  let failureRate = 0;
  let partialRate = 0;
  let expiredRate = 0;

  const totalResolutions = resolutions?.length || 0;
  if (totalResolutions > 0) {
    const successes = resolutions.filter((r: any) => r.outcome === "SUCCESS").length;
    const failures = resolutions.filter((r: any) => r.outcome === "FAILURE").length;
    const partials = resolutions.filter((r: any) => r.outcome === "PARTIAL").length;
    
    successRate = Math.round((successes / totalResolutions) * 100);
    failureRate = Math.round((failures / totalResolutions) * 100);
    partialRate = Math.round((partials / totalResolutions) * 100);
    expiredRate = Math.round((expiredCount / totalResolutions) * 100);
  }

  // 3. Generate Timeline
  // We'll group resolutions by month and calculate accuracy (SUCCESS / TOTAL for that month)
  // For the sake of the graph, if we don't have enough data, we will pad it with 0s or empty months
  const timelineMap: Record<string, { total: number; success: number }> = {};
  
  // Pad with last 6 months
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
    timelineMap[months[past.getMonth()]] = { total: 0, success: 0 };
  }

  resolutions?.forEach((r: any) => {
    if (!r.resolved_at) return;
    const date = new Date(r.resolved_at);
    const m = months[date.getMonth()];
    if (timelineMap[m]) {
      timelineMap[m].total++;
      if (r.outcome === "SUCCESS") {
        timelineMap[m].success++;
      }
    }
  });

  const timeline = Object.entries(timelineMap).map(([month, data]) => ({
    month,
    accuracy: data.total > 0 ? Math.round((data.success / data.total) * 100) : 0
  }));

  // 4. Generate Trust Evolution
  // Group creator comparison_snapshots by month to find average trust score
  const { data: snapshots } = await (db as any).from("comparison_snapshots").select("score, created_at");
  
  const trustMap: Record<string, { total: number; count: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
    trustMap[months[past.getMonth()]] = { total: 0, count: 0 };
  }

  snapshots?.forEach((s: any) => {
    if (!s.created_at) return;
    const date = new Date(s.created_at);
    const m = months[date.getMonth()];
    if (trustMap[m]) {
      trustMap[m].total += s.score;
      trustMap[m].count++;
    }
  });

  const trustEvolution = Object.entries(trustMap).map(([month, data]) => ({
    month,
    trustScore: data.count > 0 ? Math.round(data.total / data.count) : 0
  }));

  const { data: ledgerData, error: ledgerError } = await (db as any)
    .from("forecast_resolutions")
    .select(`
      id,
      outcome,
      trust_delta,
      resolution_reason,
      forecast_events!inner (
        entity_slug,
        predicted_direction,
        predicted_confidence,
        creator_id
      )
    `)
    .order("resolved_at", { ascending: false })
    .limit(10);

  if (ledgerError) console.error("Ledger Error:", ledgerError);

  // Fetch creator names manually to bypass missing foreign key constraint
  const { data: creatorsData } = await (db as any).from("creators").select("id, name");
  const creatorMap: Record<string, string> = {};
  if (creatorsData) {
    creatorsData.forEach((c: any) => {
      creatorMap[c.id] = c.name;
    });
  }

  const ledger = ledgerData?.map((item: any) => ({
    id: item.id,
    creator: creatorMap[item.forecast_events.creator_id] || "Unknown Creator",
    entity: item.forecast_events.entity_slug,
    direction: item.forecast_events.predicted_direction,
    confidence: item.forecast_events.predicted_confidence,
    outcome: item.outcome,
    delta: item.trust_delta ? (item.trust_delta > 0 ? `+${item.trust_delta}` : `${item.trust_delta}`) : "0",
    reason: item.resolution_reason || "No resolution reason provided."
  })) || [];
  
  console.log("Timeline Map Data:", timelineMap);
  console.log("Trust Evolution Map Data:", trustMap);

  return {
    stats: {
      total,
      pending,
      expiredCount,
      resolved,
      successRate,
      failureRate,
      partialRate,
      expiredRate
    },
    timeline,
    trustEvolution,
    ledger
  };
}
