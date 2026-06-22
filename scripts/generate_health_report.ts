import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import * as fs from "fs";
import * as path from "path";

async function run() {
  const { db } = await import("../src/server/db");
  const d2LaunchDate = new Date("2019-03-01T00:00:00Z").getTime();
  const rawVideos = await (db as any)
    .from("creator_videos")
    .select("published_at, creators(id, name, is_verified), content_tags")
    .order("published_at", { ascending: true })
    .then((res: any) => res.data);
    
  const videos = rawVideos?.filter((v: any) => new Date(v.published_at).getTime() >= d2LaunchDate) || [];

  const { data: creatorTrustScores } = await (db as any)
    .from("creator_trust_scores")
    .select(`
      trust_score,
      hybrid_accuracy,
      average_lead_time_days,
      creators(name)
    `)
    .order("trust_score", { ascending: false });

  // Compute Consensus Events
  const buildConsensus: Record<string, { creators: Set<string>; establishedDate: Date | null; type: string }> = {};

  const activeCreators = new Set(videos?.map((v: any) => v.creators?.id).filter(Boolean));
  // Same threshold as TrustService
  const consensusThreshold = Math.max(2, Math.floor(activeCreators.size * 0.1));

  for (const v of videos ?? []) {
    const tags = v.content_tags;
    if (!tags) continue;
    const creatorId = (v.creators as any)?.id;
    if (!creatorId) continue;
    const publishedDate = new Date(v.published_at);

    const processTags = (tagType: string, arr: any[]) => {
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        if (!buildConsensus[item.slug]) {
          buildConsensus[item.slug] = { creators: new Set(), establishedDate: null, type: tagType };
        }
        const state = buildConsensus[item.slug];
        if (!state.establishedDate) {
          state.creators.add(creatorId);
          if (state.creators.size >= consensusThreshold) {
            state.establishedDate = publishedDate; // Hit Established!
          }
        } else {
          state.creators.add(creatorId); // keep tracking dominancy
        }
      }
    };
    Object.entries(tags).forEach(([type, tagArray]: [string, any]) => processTags(type, tagArray));
  }

  const consensusEvents = Object.values(buildConsensus).filter(s => s.establishedDate !== null);
  
  // Categorize
  // Dominant (say >= 3x threshold), Established (>= threshold), Emerging (< threshold)
  const dominantThreshold = consensusThreshold * 3;
  let dominant = 0;
  let established = 0;
  let emerging = 0;
  
  Object.values(buildConsensus).forEach(s => {
    if (s.creators.size >= dominantThreshold) dominant++;
    else if (s.creators.size >= consensusThreshold) established++;
    else emerging++;
  });

  const domainCounts: Record<string, number> = {};
  consensusEvents.forEach(s => {
    domainCounts[s.type] = (domainCounts[s.type] || 0) + 1;
  });

  // Top 10 lists
  const sortedByTrust = [...creatorTrustScores].sort((a, b) => b.trust_score - a.trust_score).slice(0, 10);
  const sortedByAcc = [...creatorTrustScores].sort((a, b) => b.hybrid_accuracy - a.hybrid_accuracy).slice(0, 10);
  const sortedByLead = [...creatorTrustScores].sort((a, b) => b.average_lead_time_days - a.average_lead_time_days).slice(0, 10);

  const avgLeadTimePlatform = creatorTrustScores.reduce((acc: number, curr: any) => acc + curr.average_lead_time_days, 0) / (creatorTrustScores.length || 1);

  let md = `# Trust Layer Health Report\n\n`;
  md += `## Platform Consensus Overview\n`;
  md += `- **Total Consensus Events (Established+)**: ${consensusEvents.length}\n`;
  md += `- **Dominant Trends**: ${dominant}\n`;
  md += `- **Established Trends**: ${established}\n`;
  md += `- **Emerging Trends**: ${emerging}\n\n`;

  md += `## Consensus By Domain\n`;
  md += `- **Gearset**: ${domainCounts["gearset"] || 0}\n`;
  md += `- **Exotic Weapon**: ${domainCounts["exotic_weapon"] || 0}\n`;
  md += `- **Exotic Armor**: ${domainCounts["exotic_armor"] || 0}\n`;
  md += `- **Skill**: ${domainCounts["skill"] || 0}\n`;
  md += `- **Brand Set**: ${domainCounts["brand_set"] || 0}\n`;
  md += `- **Named Item**: ${domainCounts["named_item"] || 0}\n\n`;

  md += `## Top 10 Creators by Trust Score\n`;
  sortedByTrust.forEach((c, i) => { md += `${i+1}. ${c.creators.name}: **${c.trust_score}**\n`; });
  
  md += `\n## Top 10 Creators by Accuracy\n`;
  sortedByAcc.forEach((c, i) => { md += `${i+1}. ${c.creators.name}: **${c.hybrid_accuracy}%**\n`; });

  md += `\n## Top 10 Creators by Lead Time\n`;
  sortedByLead.forEach((c, i) => { md += `${i+1}. ${c.creators.name}: **${c.average_lead_time_days} days**\n`; });

  md += `\n## Platform Average\n`;
  md += `- **Average Lead Time**: ${Math.round(avgLeadTimePlatform)} days\n`;

  const artifactPath = "C:\\Users\\shiva\\.gemini\\antigravity-ide\\brain\\f0e9aae7-f54f-448a-b15b-f9de5c4e448e\\trust_layer_health_report.md";
  fs.writeFileSync(artifactPath, md);
  console.log("Report generated at", artifactPath);
}

run().catch(console.error);
