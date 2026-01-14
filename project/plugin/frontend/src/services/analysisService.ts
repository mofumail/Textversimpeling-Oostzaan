import jargonData from "../data/jargon.json";

export interface Suggestion {
    id: string;
    originalText: string;
    issueCategory: 'Complexity' | 'Passive Voice' | 'Word Choice';
    explanation: string;
    replacements: string[];
    startIndex?: number;
    occurrenceIndex?: number;
}

export interface AnalysisResult {
    score: number;
    suggestions: Suggestion[];
}

const API_URL = "http://localhost:8000/api";

interface JargonEntry {
    word: string;
    alternatives: string[];
}

const analyzeLocally = (text: string): Suggestion[] => {
    console.log("Using local analysis fallback");
    const suggestions: Suggestion[] = [];
    (jargonData as JargonEntry[]).forEach((item) => {
        const regex = new RegExp(`\\b${item.word}\\b`, 'gi');
        let match;
        let count = 0;
        // Find ALL occurrences using while loop
        while ((match = regex.exec(text)) !== null) {
            suggestions.push({
                id: Math.random().toString(36).substr(2, 9),
                originalText: match[0], // Use actual matched text (preserves case if needed, though we normalized)
                issueCategory: "Complexity",
                explanation: `The phrase '${item.word}' is considered jargon.`,
                replacements: item.alternatives,
                startIndex: match.index,
                occurrenceIndex: count
            });
            count++;
        }
    });
    // Sort by position (startIndex)
    return suggestions.sort((a, b) => (a.startIndex || 0) - (b.startIndex || 0));
};

export const analyzeText = async (text: string): Promise<Suggestion[]> => {
    try {
        // Try to fetch from backend with clear timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

        const response = await fetch(`${API_URL}/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();

        const rawSuggestions = (data.suggestions || data || []).map((item: any) => ({
            id: item.id || Math.random().toString(36).substr(2, 9),
            originalText: item.word || item.original_text,
            issueCategory: item.category || "Complexity",
            explanation: item.description || "Suggestion found.",
            replacements: item.alternatives || [],
            startIndex: item.start_index !== undefined ? item.start_index : 0
        }));

        // Sort by position
        const sorted = rawSuggestions.sort((a: any, b: any) => (a.startIndex || 0) - (b.startIndex || 0));

        // Calculate occurrenceIndex
        const counts: Record<string, number> = {};
        const suggestions: Suggestion[] = sorted.map((s: any) => {
            const key = s.originalText.toLowerCase();
            const index = counts[key] || 0;
            counts[key] = index + 1;
            return { ...s, occurrenceIndex: index };
        });

        return suggestions;

    } catch (error) {
        console.warn("Backend analysis failed, falling back to local:", error);
        return analyzeLocally(text);
    }
};

export const rewriteText = async (text: string): Promise<string> => {
    try {
        const response = await fetch(`${API_URL}/rewrite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        if (!response.ok) throw new Error("Rewrite failed");

        const data = await response.json();
        return data.simplified_text;
    } catch (error) {
        console.error(error);
        return text; // Return original on error
    }
};
