import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export interface ComplexWord {
  word: string;
  alternatives: string[];
}

export interface B1Score {
  score: number;
  level: string;
}

export interface ComplianceStats {
  avg_sentence_length: number;
  long_sentences_count: number;
  jargon_count: number;
  b1_score: B1Score;
}

export interface RuleViolation {
  rule_name: string;
  message: string;
  match_text: string;
  start_index: number;
  end_index: number;
  suggestion?: string;
}

export interface AnalysisResult {
  is_clean: boolean;
  violations: RuleViolation[];
  complex_words: ComplexWord[];
  compliance_stats: ComplianceStats;
}

export interface RewriteResponse {
  original_text: string;
  simplified_text: string;
}

export interface Template {
  id: number;
  name: string;
  content: string;
}

export interface TemplateList {
  templates: Template[];
}

export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  const response = await axios.post<AnalysisResult>(`${API_URL}/analyze`, { text });
  return response.data;
};

export const rewriteText = async (text: string): Promise<RewriteResponse> => {
  const response = await axios.post<RewriteResponse>(`${API_URL}/rewrite`, { text });
  return response.data;
};

export const getTemplates = async (): Promise<TemplateList> => {
  const response = await axios.get<TemplateList>(`${API_URL}/templates`);
  return response.data;
};
