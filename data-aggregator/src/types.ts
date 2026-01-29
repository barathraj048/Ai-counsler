export interface PublicUniversity {
  name: string;
  country: string;
  web_pages: string[];
}

export interface NormalizedUniversity {
  name: string;
  country: string;
  website: string;
}

export interface EnrichedUniversity extends NormalizedUniversity {
  matchScore: number;
  employabilityIndex: number;
  estimatedAnnualCostUSD: number;
  reasoning: string[];
  internalTags: string[];
}
