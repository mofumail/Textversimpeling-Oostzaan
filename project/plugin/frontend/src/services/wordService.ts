/* global Word */
/// <reference types="office-js" />


export const getSelectedText = async (): Promise<string> => {
    return Word.run(async (context) => {
        console.log("[wordService] getSelectedText called");
        const selection = context.document.getSelection();
        selection.load('text');
        await context.sync();
        console.log("[wordService] selection text:", selection.text);
        return selection.text;
    });
};

export const getDocumentText = async (): Promise<string> => {
    return Word.run(async (context: Word.RequestContext) => {
        console.log("[wordService] getDocumentText called");
        const body = context.document.body;
        body.load('text');
        await context.sync();
        console.log("[wordService] body text length:", body.text.length);
        return body.text;
    });
};

export const getCurrentParagraphText = async (): Promise<string> => {
    return Word.run(async (context: Word.RequestContext) => {
        console.log("[wordService] getCurrentParagraphText called");
        const selection = context.document.getSelection();
        const paragraphs = selection.paragraphs;
        paragraphs.load('text');
        await context.sync();

        // Return text of first paragraph involved in selection
        if (paragraphs.items.length > 0) {
            console.log("[wordService] paragraph text found:", paragraphs.items[0].text);
            return paragraphs.items[0].text;
        }
        console.log("[wordService] no paragraph found");
        return "";
    });
};



export const replaceText = async (targetText: string, replacement: string, occurrenceIndex: number = 0) => {
    return Word.run(async (context) => {
        const searchResults = context.document.body.search(targetText, { matchWholeWord: true });
        searchResults.load("items");
        await context.sync();

        if (searchResults.items.length > 0) {
            if (occurrenceIndex < searchResults.items.length) {
                // Replace specific instance
                const range = searchResults.items[occurrenceIndex];
                const insertedRange = range.insertText(replacement, Word.InsertLocation.replace);

                // Clear formatting on the new range
                insertedRange.font.underline = "None";
                insertedRange.font.color = "Black";
            } else {
                console.warn(`[wordService] Replace index ${occurrenceIndex} out of bounds for ${targetText}.`);
            }
        }
        await context.sync();
    });
};

import type { Suggestion } from './analysisService';

export const highlightSpecificIssues = async (suggestions: Suggestion[]) => {
    return Word.run(async (context: Word.RequestContext) => {
        // First, clear everything? Or assume caller did? 
        // Caller (handleAnalyze) should probably clear first or we do it here.
        // Let's do it here to ensure clean state.
        const body = context.document.body;
        // @ts-ignore
        body.font.underline = "None";
        body.font.color = "Black";
        await context.sync();

        // Group by text
        const groups: Record<string, Suggestion[]> = {};
        for (const s of suggestions) {
            const key = s.originalText;
            if (!groups[key]) groups[key] = [];
            groups[key].push(s);
        }

        for (const text of Object.keys(groups)) {
            const searchResults = context.document.body.search(text, { matchWholeWord: true, matchCase: false });
            searchResults.load("items");
            await context.sync();

            const items = searchResults.items;
            const textSuggestions = groups[text];

            for (const s of textSuggestions) {
                if (s.occurrenceIndex !== undefined && s.occurrenceIndex < items.length) {
                    const range = items[s.occurrenceIndex];
                    range.font.underline = "Double";
                    range.font.color = "#FFA500";
                } else {
                    // Fallback: Highlight all if no index (shouldn't happen with new logic)
                    items.forEach(range => {
                        range.font.underline = "Double";
                        range.font.color = "#FFA500";
                    });
                }
            }
        }
        await context.sync();
    });
};

// Deprecated or alias
export const highlightIssues = async (textsToHighlight: string[]) => {
    // Legacy support if needed, but we should switch to the new one.
    // For now, implementing as a wrapper is hard without indices.
    // We will just leave it or replace usages.
    return Word.run(async (context) => {
        // ... (old code) ... but usage is being replaced.
    });
};

export const selectText = async (text: string, occurrenceIndex: number = 0) => {
    return Word.run(async (context) => {
        console.log(`[wordService] Selecting: ${text} at occurrence ${occurrenceIndex}`);
        const searchResults = context.document.body.search(text, { matchWholeWord: true, matchCase: false });
        searchResults.load("items");
        await context.sync();

        if (searchResults.items.length > 0) {
            if (occurrenceIndex < searchResults.items.length) {
                searchResults.items[occurrenceIndex].select();
            } else {
                console.warn(`[wordService] Occurrence index ${occurrenceIndex} out of bounds for ${text}. Selecting first.`);
                searchResults.items[0].select();
            }
        }

        await context.sync();
    });
};

export const removeHighlight = async (text: string) => {
    return Word.run(async (context) => {
        const searchResults = context.document.body.search(text, { matchWholeWord: true, matchCase: false });
        searchResults.load("items");
        await context.sync();

        searchResults.items.forEach((range: Word.Range) => {
            range.font.underline = "None";
            range.font.color = "Black"; // Reset to default? Or Auto?
        });
        await context.sync();
    });
};

export const clearSelectionHighlight = async () => {
    return Word.run(async (context) => {
        const selection = context.document.getSelection();
        selection.font.underline = "None";
        selection.font.color = "Black"; // Reset to default
        await context.sync();
    });
};

export const clearAllHighlights = async () => {
    return Word.run(async (context: Word.RequestContext) => {
        const body = context.document.body;
        // @ts-ignore
        body.font.underline = "None";
        body.font.color = "Black";
        await context.sync();
    });
};
