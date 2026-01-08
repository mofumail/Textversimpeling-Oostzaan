import jargonData from "../data/jargon.json";

export interface Suggestion {
    id: string;
    originalText: string;
    issueCategory: 'Complexity' | 'Passive Voice' | 'Word Choice';
    explanation: string;
    replacements: string[];
    startIndex?: number; // Optional, for positioning if needed
}

interface JargonEntry {
    word: string;
    alternatives: string[];
}

export const analyzeText = async (text: string): Promise<Suggestion[]> => {
    console.log("[analysisService] analyzeText called. Length:", text.length);
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    const suggestions: Suggestion[] = [];
    const lowerText = text.toLowerCase();

    console.log("[analysisService] Lowercase text:", lowerText.substring(0, 100) + "...");

    // Jargon Detection
    (jargonData as JargonEntry[]).forEach((item) => {
        // Simple string matching (in a real app, use regex for word boundaries)
        if (lowerText.includes(item.word.toLowerCase())) {
            console.log(`[analysisService] Match found: ${item.word}`);
            suggestions.push({
                id: Math.random().toString(36).substr(2, 9),
                originalText: item.word,
                issueCategory: "Complexity",
                explanation: `The phrase '${item.word}' is considered jargon.`,
                replacements: item.alternatives
            });
        }
    });

    // Keep existing example logic if not covered by jargon
    if (text.match(/was .* by/)) {
        suggestions.push({
            id: Math.random().toString(36).substr(2, 9),
            originalText: "was decided by", // Simplification for demo
            issueCategory: "Passive Voice",
            explanation: "Passive voice can obscure the actor. Use active voice.",
            replacements: ["decided"],
        });
    }

    return suggestions;
};
