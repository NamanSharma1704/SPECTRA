/**
 * VerificationEngine — Evaluates builds for credibility, freshness, and duplicates.
 */

import type { ExtractedBuild } from "./BuildExtractor";
import type { StagedBuild } from "./IngestionService";

export interface VerificationMetrics {
  creatorReliability: number;
  patchFreshness: number;
  sourceDiversity: number;
  communityValidation: number;
  similarityScore: number;
}

export type VerificationStatus = "Verified" | "Likely Valid" | "Needs Review" | "Filtered";

export interface VerifiedBuild extends ExtractedBuild {
  verificationStatus: VerificationStatus;
  trustMetrics: VerificationMetrics;
  isAppend: boolean;
}

const TRUSTED_CREATORS = [
  "Widdz", "NothingButSkillz", "Kamikazevondoom", 
  "PatrickWolf", "Patrick Wolf", "Aculite", 
  "Dod-Regnbue", "DodRegnbue", "TuxedoBandido", "Tuxedo Bandido"
];

function computeCreatorReliability(creatorName: string): number {
  if (TRUSTED_CREATORS.some(c => c.toLowerCase() === creatorName.toLowerCase())) {
    return 95;
  }
  return 50; // Unknown creator baseline
}

function computePatchFreshness(publishedAt: number): number {
  const ageMs = Date.now() - publishedAt;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  
  if (ageDays <= 14) return 100;
  if (ageDays <= 30) return 80;
  if (ageDays <= 90) return 50;
  if (ageDays <= 180) return 20;
  return 10; // Old but not 0
}

function computeSourceDiversity(build: ExtractedBuild, allStaged: StagedBuild[], otherExtracts: ExtractedBuild[]): number {
  const isSimilar = (b1: ExtractedBuild, b2: ExtractedBuild | StagedBuild) => {
    // With fingerprinting, we can strictly match the exact family
    if (b1.fingerprint && b2.fingerprint) {
      return b1.fingerprint === b2.fingerprint;
    }
    // Fallback if staging queue items don't have fingerprint yet
    if (!b1.archetype || b1.archetype !== b2.archetype) return false;
    const commonGear = b1.gearKeywords.filter(g => b2.gearKeywords.includes(g));
    return commonGear.length >= 2;
  };

  const similarBuilds = [
    ...allStaged.filter(b => isSimilar(build, b)),
    ...otherExtracts.filter(b => b !== build && isSimilar(build, b))
  ];

  const uniqueSources = new Set(similarBuilds.map(b => b.source));
  uniqueSources.add(build.source);
  
  const uniqueCreators = new Set(similarBuilds.map(b => b.creatorName));
  uniqueCreators.add(build.creatorName);

  const sourceCount = similarBuilds.length + 1;

  // 40% Unique Creators
  let creatorScore = 30;
  if (uniqueCreators.size === 2) creatorScore = 70;
  if (uniqueCreators.size >= 3) creatorScore = 100;

  // 35% Platform Diversity
  let platformScore = 50;
  if (uniqueSources.size >= 2) platformScore = 100;

  // 25% Source Count
  let countScore = 30;
  if (sourceCount === 2) countScore = 60;
  if (sourceCount >= 3) countScore = 100;

  const diversityScore = (creatorScore * 0.40) + (platformScore * 0.35) + (countScore * 0.25);

  return Math.round(Math.min(diversityScore, 100));
}

function computeSimilarity(build: ExtractedBuild, allStaged: StagedBuild[]): number {
  // Pure Duplicate: same creator, same title
  const pureDuplicate = allStaged.some(b => 
    b.creatorName.toLowerCase() === build.creatorName.toLowerCase() &&
    b.sourceTitle === build.sourceTitle
  );
  if (pureDuplicate) return 100;

  // Fingerprint Match: A valid append to an existing family
  const familyAppend = allStaged.some(b => 
    b.fingerprint && b.fingerprint === build.fingerprint
  );
  if (familyAppend) return 90; // Special flag for append

  return 0; // Unique fingerprint
}

export function verifyBuilds(newBuilds: ExtractedBuild[], existingStaged: StagedBuild[]): VerifiedBuild[] {
  return newBuilds.map(build => {
    const creatorReliability = computeCreatorReliability(build.creatorName);
    const patchFreshness = computePatchFreshness(build.publishedAt);
    const sourceDiversity = computeSourceDiversity(build, existingStaged, newBuilds);
    const similarityScore = computeSimilarity(build, existingStaged);

    // Community Validation Simulation (MVP formula)
    const communityValidation = (creatorReliability * 0.7) + (patchFreshness * 0.3);

    // Overall Score Formula
    let overallScore = 
      (creatorReliability * 0.35) +
      (patchFreshness * 0.30) +
      (sourceDiversity * 0.20) +
      (communityValidation * 0.15);

    // Filter rules
    let status: VerificationStatus;
    let isAppend = false;
    
    // Penalize pure duplicates
    if (similarityScore === 100) {
      status = "Filtered";
      overallScore = Math.min(overallScore, 35); // Visual drop for dupes
    } else if (similarityScore === 90) {
      // It's a valid append!
      isAppend = true;
      status = "Verified"; // Appends to existing verified families are automatically verified
    } else {
      if (overallScore > 85) status = "Verified";
      else if (overallScore >= 65) status = "Likely Valid";
      else if (overallScore >= 40) status = "Needs Review";
      else status = "Filtered";
    }

    return {
      ...build,
      verificationStatus: status,
      confidence: Math.round(overallScore),
      isAppend,
      trustMetrics: {
        creatorReliability: Math.round(creatorReliability),
        patchFreshness: Math.round(patchFreshness),
        sourceDiversity: Math.round(sourceDiversity),
        communityValidation: Math.round(communityValidation),
        similarityScore: Math.round(similarityScore)
      }
    };
  });
}
