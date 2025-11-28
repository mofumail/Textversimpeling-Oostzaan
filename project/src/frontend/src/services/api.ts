// Mock API service

export interface ComplexWord {
  word: string;
  alternatives: string[];
}

export interface AnalysisResult {
  complexWords: ComplexWord[];
  count: number;
}

export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const complexWords: ComplexWord[] = [];
  const lowerText = text.toLowerCase();

  // Mock logic based on wireframe examples
  if (lowerText.includes('bescheiden')) {
    complexWords.push({
      word: 'bescheiden',
      alternatives: ['papieren', 'documenten', 'stukken']
    });
  }
  
  if (lowerText.includes('onderhavige')) {
    complexWords.push({
      word: 'onderhavige',
      alternatives: ['deze', 'dit']
    });
  }

  if (lowerText.includes('teneinde')) {
    complexWords.push({
      word: 'teneinde',
      alternatives: ['om', 'voor']
    });
  }

  return {
    complexWords,
    count: complexWords.length
  };
};
