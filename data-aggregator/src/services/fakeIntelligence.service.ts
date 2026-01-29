import { NormalizedUniversity, EnrichedUniversity } from "../types.js";

export function enrichWithInternalSignals(
  universities: NormalizedUniversity[],
  profile: any
): EnrichedUniversity[] {
  return universities.map((u) => ({
    ...u,
    matchScore: rand(65, 95),
    employabilityIndex: Number(Math.random().toFixed(2)),
    estimatedAnnualCostUSD: rand(8000, 45000),
    reasoning: [
      "Strong academic alignment with student profile",
      "Good international student intake",
      "Favorable post-study work opportunities",
    ],
    internalTags: buildTags(),
  }));
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildTags(): string[] {
  const tags = ["SAFE", "ROI_HIGH", "RANKED", "BUDGET_FRIENDLY", "PREMIUM"];
  return tags.sort(() => 0.5 - Math.random()).slice(0, 2);
}