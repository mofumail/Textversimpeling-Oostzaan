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



const isWord = (text: string) => !/[^a-zA-Z0-9_\u00C0-\u024F]/.test(text.trim());

export const replaceText = async (targetText: string, replacement: string, occurrenceIndex: number = 0) => {
    return Word.run(async (context) => {
        const searchResults = context.document.body.search(targetText, { matchWholeWord: isWord(targetText) });
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
            const useWholeWord = isWord(text);
            console.log(`[wordService] Highlighting: '${text}', matchWholeWord: ${useWholeWord}`);
            const searchResults = context.document.body.search(text, { matchWholeWord: useWholeWord, matchCase: false });
            searchResults.load("items");
            await context.sync();

            console.log(`[wordService] Found ${searchResults.items.length} matches for '${text}'`);

            const items = searchResults.items;
            const textSuggestions = groups[text];

            for (const s of textSuggestions) {
                if (s.occurrenceIndex !== undefined && s.occurrenceIndex < items.length) {
                    const range = items[s.occurrenceIndex];
                    range.font.underline = "Double";
                    if (s.issueCategory === 'Jargon') {
                        range.font.color = "#D13438"; // Red
                    } else if (s.issueCategory === 'Style Rules') {
                        range.font.color = "#FFA500"; // Orange
                    } else {
                        range.font.color = "#FFA500"; // Default (Complexity etc)
                    }
                } else {
                    // Fallback: Highlight all if no index (shouldn't happen with new logic)
                    items.forEach(range => {
                        range.font.underline = "Double";
                        if (s.issueCategory === 'Jargon') {
                            range.font.color = "#D13438";
                        } else {
                            range.font.color = "#FFA500";
                        }
                    });
                }
            }
        }
        await context.sync();
    });
};



export const selectText = async (text: string, occurrenceIndex: number = 0) => {
    return Word.run(async (context) => {
        console.log(`[wordService] Selecting: ${text} at occurrence ${occurrenceIndex}`);
        const searchResults = context.document.body.search(text, { matchWholeWord: isWord(text), matchCase: false });
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
        const searchResults = context.document.body.search(text, { matchWholeWord: isWord(text), matchCase: false });
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

// --- Tracking / Content Control Methods ---

export const addTrackingControl = async (tagPrefix: string = "simplify"): Promise<{ tag: string, text: string } | null> => {
    return Word.run(async (context) => {
        const selection = context.document.getSelection();
        selection.load("text");
        await context.sync();

        if (!selection.text || selection.text.trim().length === 0) {
            return null;
        }

        // Create unique tag
        const uniqueId = new Date().getTime().toString();
        const tag = `${tagPrefix}_${uniqueId}`;

        // Wrap selection in content control
        const cc = selection.insertContentControl();
        cc.tag = tag;
        cc.title = "To Simplify";
        cc.appearance = "BoundingBox";
        cc.color = "#888888"; // distinct color?

        await context.sync();
        return { tag, text: selection.text };
    });
};

export const selectTrackingControl = async (tag: string): Promise<boolean> => {
    return Word.run(async (context) => {
        const ccs = context.document.contentControls.getByTag(tag);
        ccs.load("items");
        await context.sync();

        if (ccs.items.length > 0) {
            ccs.items[0].select();
            return true;
        }
        return false;
    });
};

export const replaceTrackingControlText = async (tag: string, newText: string): Promise<boolean> => {
    return Word.run(async (context) => {
        const ccs = context.document.contentControls.getByTag(tag);
        ccs.load("items");
        await context.sync();

        if (ccs.items.length > 0) {
            const cc = ccs.items[0];
            // Replace text inside
            cc.insertText(newText, Word.InsertLocation.replace);
            // Optionally remove CC after replacement? Or keep it to show it was edited?
            // "apply a chosen rewrite... replace the original sentence"
            // Usually we'd want to remove the control wrapper after finalizing, 
            // but keeping it might be useful for history. 
            // For now, let's keep it but maybe change color to green to indicate done?
            cc.color = "#008000";
            cc.title = "Simplified";
            return true;
        }
        return false;
    });
};

export const replaceAndRemoveTrackingControl = async (tag: string, newText: string): Promise<boolean> => {
    return Word.run(async (context) => {
        console.log(`[wordService] replaceAndRemoveTrackingControl for tag: ${tag}`);
        const ccs = context.document.contentControls.getByTag(tag);
        ccs.load("items");
        await context.sync();

        if (ccs.items.length > 0) {
            const cc = ccs.items[0];
            cc.insertText(newText, Word.InsertLocation.replace);
            cc.delete(true); // Remove wrapper, keep new text
            console.log(`[wordService] Replaced text and deleted CC for tag: ${tag}`);
            return true;
        }
        console.warn(`[wordService] No CC found for tag: ${tag}`);
        return false;
    });
};

export const getExistingTrackingTags = async (tags: string[]): Promise<string[]> => {
    return Word.run(async (context) => {
        const foundTags: string[] = [];
        // This might be slow for many tags, but filtering client side after load might be better?
        // Or load all content controls and check their tags?
        // Loading all CCs is safer.
        const ccs = context.document.contentControls;
        ccs.load("tag");
        await context.sync();

        const existingTags = new Set(ccs.items.map(cc => cc.tag));
        for (const t of tags) {
            if (existingTags.has(t)) {
                foundTags.push(t);
            }
        }
        return foundTags;
    });
};

export const removeTrackingControl = async (tag: string): Promise<void> => {
    return Word.run(async (context) => {
        console.log(`[wordService] removeTrackingControl for tag: ${tag}`);
        const ccs = context.document.contentControls.getByTag(tag);
        ccs.load("items");
        await context.sync();

        if (ccs.items.length > 0) {
            // Delete the control wrapper but keep text? Or delete everything?
            // Usually "Remove from list" implies just stop tracking.
            const count = ccs.items.length;
            ccs.items.forEach(cc => {
                cc.delete(true); // true = keep content
            });
            console.log(`[wordService] Deleted ${count} CC(s) for tag: ${tag}`);
        } else {
            console.warn(`[wordService] No CC found to remove for tag: ${tag}`);
        }
        await context.sync();
    });
};

