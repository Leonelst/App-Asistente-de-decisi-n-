export type AnalysisType = "pros_cons" | "swot" | "comparison";

export interface ProConFactor {
  id: string;
  text: string;
  type: "pro" | "con";
  importance: number; // 1 to 5
  description: string;
}

export interface SwotFactor {
  id: string;
  text: string;
  type: "strength" | "weakness" | "opportunity" | "threat";
  importance: number; // 1 to 5
  description: string;
}

export interface OptionScore {
  option: string;
  score: number; // 1 to 10
}

export interface ComparisonCriterion {
  id: string;
  name: string;
  importance: number; // 1 to 5
  optionScores: OptionScore[];
  description: string;
}

export interface SavedDecision {
  id: string;
  title: string;
  context: string;
  type: AnalysisType;
  createdAt: string;
  prosConsData?: {
    factors: ProConFactor[];
    summary: string;
    recommendation: string;
  };
  swotData?: {
    factors: SwotFactor[];
    summary: string;
    recommendation: string;
  };
  comparisonData?: {
    options: string[];
    criteria: ComparisonCriterion[];
    summary: string;
    recommendation: string;
  };
}
