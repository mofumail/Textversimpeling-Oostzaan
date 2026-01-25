import jargonData from "../data/jargon.json";

export interface Suggestion {
    id: string;
    originalText: string;
    issueCategory: 'Complexity' | 'Passive Voice' | 'Word Choice' | 'Jargon' | 'Style Rules';
    explanation: string;
    replacements: string[];
    startIndex?: number;
    occurrenceIndex?: number;
    ruleId?: string; // ID of the rule if applicable
    secondaryRules?: Array<{
        ruleId: string;
        explanation: string;
    }>;
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

import { RULES_REGISTRY } from "./rules";

const analyzeLocally = (text: string): Suggestion[] => {
    console.log("Using local analysis fallback");
    const suggestions: Suggestion[] = [];

    // 1. Jargon Check
    (jargonData as JargonEntry[]).forEach((item) => {
        const regex = new RegExp(`\\b${item.word}\\b`, 'gi');
        let match;
        let count = 0;
        while ((match = regex.exec(text)) !== null) {
            suggestions.push({
                id: Math.random().toString(36).substr(2, 9),
                originalText: match[0],
                issueCategory: "Jargon",
                explanation: `The phrase '${item.word}' is considered jargon.`,
                replacements: item.alternatives,
                startIndex: match.index,
                occurrenceIndex: count
            });
            count++;
        }
    });

    // 2. Rules Registry Check
    RULES_REGISTRY.forEach(rule => {
        // Reset lastIndex for global regex
        rule.pattern.lastIndex = 0;
        let match;
        while ((match = rule.pattern.exec(text)) !== null) {
            console.log(`[analysisService] Rule Match: ${rule.id} -> ${match[0]}`);
            suggestions.push({
                id: Math.random().toString(36).substr(2, 9),
                originalText: match[0],
                issueCategory: "Style Rules",
                explanation: rule.description,
                replacements: rule.suggestion ? [rule.suggestion] : [],
                startIndex: match.index,
                occurrenceIndex: 0, // Simple count not strictly tracked per rule here yet, can improve if needed
                ruleId: rule.id
            });
        }
    });

    // 3. Sentence Complexity (Max 15 words)
    // Simple split by punctuation
    const sentences = text.match(/[^.?!]+[.?!]+/g) || [];
    let searchIndex = 0; // Track rough position
    sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        const wordCount = trimmed.split(/\s+/).length;
        if (wordCount > 15) {
            // Find actual index in text (approximate if duplicates exist, but okay for MVP)
            const index = text.indexOf(trimmed, searchIndex);
            searchIndex = index + trimmed.length;

            suggestions.push({
                id: Math.random().toString(36).substr(2, 9),
                originalText: trimmed,
                issueCategory: "Complexity",
                explanation: `This sentence is too long (${wordCount} words). Recommended maximum is 15 words.`,
                replacements: [],
                startIndex: index !== -1 ? index : 0,
                occurrenceIndex: 0
            });
        }
    });

    // 4. Paragraph Count (Max 6)
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    if (paragraphs.length > 6) {
        suggestions.push({
            id: Math.random().toString(36).substr(2, 9),
            originalText: "Document Structure",
            issueCategory: "Complexity",
            explanation: `The text has ${paragraphs.length} paragraphs. Maximum 6 recommended.`,
            replacements: [],
            startIndex: 0,
            occurrenceIndex: 0
        });
    }

    // Sort by position (startIndex)
    const sorted = suggestions.sort((a, b) => (a.startIndex || 0) - (b.startIndex || 0));
    return groupSuggestions(sorted);
};

const groupSuggestions = (suggestions: Suggestion[]): Suggestion[] => {
    const grouped: Suggestion[] = [];
    for (const s of suggestions) {
        const last = grouped[grouped.length - 1];
        // Check for exact overlap in position and text
        if (last && last.startIndex === s.startIndex && last.originalText === s.originalText) {
            // If duplicate rule, skip (sanity check)
            if (last.ruleId === s.ruleId && !s.secondaryRules) continue;

            // Initialize secondaryRules if needed
            if (!last.secondaryRules) {
                last.secondaryRules = [];
            }

            // Add current primary info to secondary list
            if (s.ruleId) {
                last.secondaryRules.push({
                    ruleId: s.ruleId,
                    explanation: s.explanation
                });
            } else {
                // Non-rule overlap? Maybe keep explanation
                // For now, only merging rules mostly, but general format requires ruleId
            }

            // Merge any secondary rules from the incoming one (if recursively grouping)
            if (s.secondaryRules) {
                last.secondaryRules.push(...s.secondaryRules);
            }
        } else {
            grouped.push(s);
        }
    }
    return grouped;
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

        return groupSuggestions(suggestions);

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
