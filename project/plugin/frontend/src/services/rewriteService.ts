
const API_URL = "/lm-studio/chat/completions";

export const generateRewrites = async (originalText: string): Promise<string> => {
    // Construct the prompt 


    const requestBody = {
        model: "leesplank-municipal",
        messages: [
            {
                "role": "system",
                "content": `Je bent een tekstvereenvoudigings-API.
                    Taak:
                        - Herschrijf de gegeven Nederlandse juridische of administratieve tekst in eenvoudiger Nederlands.
                        - Behoud de oorspronkelijke betekenis exact.
                        - Voeg geen nieuwe informatie toe en laat geen informatie weg.
                        - Leg niets uit.
                        - Geef altijd een vereenvoudigde versie van de tekst`
            },
            {
                "role": "user",
                "content": `Vereenvoudig: ${originalText}`
            }
        ],
        max_tokens: 256,
        temperature: 0.7
    };

    console.log("[rewriteService] Request Body:", JSON.stringify(requestBody, null, 2));

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const rawText = data.choices[0]?.message?.content || "";

        console.log("LM Studio Raw Response:", rawText);

        console.log("Raw Text:", rawText);
        const plainReturn = rawText.trim();
        console.log("Trimmed::", plainReturn);
        return plainReturn;

    } catch (error) {
        console.error("Failed to generate rewrites:", error);
        throw error;
    }
};
