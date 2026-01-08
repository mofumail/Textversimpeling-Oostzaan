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



export const replaceText = async (targetText: string, replacement: string) => {
    return Word.run(async (context) => {
        const searchResults = context.document.body.search(targetText, { matchWholeWord: true });
        searchResults.load("items");
        await context.sync();

        if (searchResults.items.length > 0) {
            // For the demo, we replace the first occurrence in the selection or body
            // A more robust app would track specific ranges (OOXML or content controls)
            searchResults.items[0].insertText(replacement, Word.InsertLocation.replace);
        }
        await context.sync();
    });
};

export const highlightIssues = async (textsToHighlight: string[]) => {
    return Word.run(async (context: Word.RequestContext) => {
        // Optional: Clear existing formatting first? For now, we just add.

        for (const text of textsToHighlight) {
            const searchResults = context.document.body.search(text, { matchWholeWord: true, matchCase: false });
            searchResults.load("items");
            await context.sync();

            searchResults.items.forEach((range: Word.Range) => {
                // Native grammar check style
                // @ts-ignore - Avoiding type issues with Enums in older definitions
                range.font.underline = "Wavy";
                range.font.color = "Blue";
            });
        }
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
