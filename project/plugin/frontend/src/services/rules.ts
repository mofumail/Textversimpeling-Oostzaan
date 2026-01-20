export interface Rule {
    id: string;
    description: string;
    pattern: RegExp;
    suggestion: string;
    category: 'Word Choice' | 'Complexity' | 'Passive Voice';
}

export const RULES_REGISTRY: Rule[] = [
    // 1. BEDRAGEN
    {
        id: "bedrag_spatie",
        description: "Zet een spatie tussen het euroteken en het bedrag.",
        pattern: /€\d+/g,
        suggestion: "€ 1.234,56",
        category: 'Word Choice'
    },
    {
        id: "bedrag_decimaal_punt",
        description: "Gebruik een komma voor decimalen, geen punt.",
        pattern: /€\s?\d+(?:[.]\d{1,2})(?!\d)/g,
        suggestion: "€ 10,50",
        category: 'Word Choice'
    },
    {
        id: "bedrag_heel_streepje",
        description: "Schrijf hele bedragen met ,- erachter.",
        pattern: /€\s?\d+(?![.,]\d|-)\b/g,
        suggestion: "€ 100,-",
        category: 'Word Choice'
    },

    // 2. ADRESSEN
    {
        id: "adres_plaatsnaam_hoofdletters",
        description: "Schrijf de plaatsnaam in hoofdletters achter de postcode (bijv. 1234 AB AMSTERDAM).",
        // JS adaptation: [1-9]\d{3}\s?[A-Za-z]{2}\s+(?![A-Z]{2,}\b)[A-Z][a-z]+
        pattern: /\b[1-9]\d{3}\s?[A-Za-z]{2}\s+(?![A-Z]{2,}\b)[A-Z][a-z]+/g,
        suggestion: "1234 AB AMSTERDAM",
        category: 'Word Choice'
    },

    // 3. DATA
    {
        id: "datum_numeriek",
        description: "Schrijf data volledig uit (niet numeriek, inclusief jaartal tenzij vanzelfsprekend).",
        pattern: /\b\d{1,2}[-./]\d{1,2}[-./]\d{2,4}\b/g,
        suggestion: "15 januari 2025",
        category: 'Word Choice'
    },

    // 4. GETALLEN EN RANGTELWOORDEN
    {
        id: "getal_onder_20_voluit",
        description: "Schrijf getallen onder de 20 voluit.",
        pattern: /\b([0-9]|1[0-9])\b(?!\.)/g,
        suggestion: "twee, elf, negentien",
        category: 'Word Choice'
    },
    {
        id: "rangtelwoord_voluit",
        description: "Schrijf rangtelwoorden voluit.",
        pattern: /\b\d+(e|de|ste|nde)\b/g,
        suggestion: "eerste, tweede",
        category: 'Word Choice'
    },
    {
        id: "duizendtallen_scheiding",
        description: "Gebruik punten tussen duizendtallen (niet komma's).",
        pattern: /\d{1,3},\d{3}\b/g,
        suggestion: "1.000",
        category: 'Word Choice'
    },

    // 5. OPSOMMINGSTEKENS
    {
        id: "opsomming_stijl",
        description: "Gebruik gesloten bullets (•) voor opsommingen.",
        pattern: /^\s*[-*]\s+/gm, // Multiline flag
        suggestion: "•",
        category: 'Word Choice'
    },

    // 6. TELEFOONNUMMERS
    {
        id: "telefoon_mobiel_groepering",
        description: "Controleer de groepering van 06-nummers (moet 06 11 22 33 44 zijn).",
        pattern: /\b06[-]?\d{8}\b|\b06\s\d{8}\b/g,
        suggestion: "06 11 22 33 44",
        category: 'Word Choice'
    },
    {
        id: "telefoon_vast_groepering",
        description: "Zet spaties in telefoonnummers volgens de regels.",
        pattern: /\b0[1-57-9]\d{8}\b/g,
        suggestion: "026 111 22 33",
        category: 'Word Choice'
    },

    // 7. TIJDEN
    {
        id: "tijd_voorloopnul",
        description: "Schrijf de ‘0’ als eerste getal niet op bij tijden.",
        pattern: /\b0[1-9][.:]\d{2}\s?(uur)?/g,
        suggestion: "9.00 uur",
        category: 'Word Choice'
    },
    {
        id: "tijd_scheidingsteken",
        description: "Gebruik een punt in tijden, geen dubbele punt.",
        pattern: /\b\d{1,2}:\d{2}/g,
        suggestion: "14.00",
        category: 'Word Choice'
    },
    {
        id: "tijd_redundant_uur",
        description: "Schrijf ‘uur’ alleen achter de laatste tijd in een reeks.",
        pattern: /\d{1,2}([.:]\d{2})?\s+uur\s+(en|tot|t\/m)\s+\d/g,
        suggestion: "tussen 9.00 en 17.00 uur",
        category: 'Word Choice'
    },

    // 8. AANHALINGSTEKENS
    {
        id: "citaat_dubbele_quotes",
        description: "Gebruik altijd enkele aanhalingstekens (').",
        pattern: /("|“)/g,
        suggestion: "'",
        category: 'Word Choice'
    },

    // 9. IBAN
    {
        id: "iban_spatie",
        description: "Groepeer IBAN nummers per 4 tekens.",
        pattern: /\bNL\d{2}[A-Z]{4}\d{10}\b/g,
        suggestion: "NL12 ABCD 1234 5678 90",
        category: 'Word Choice'
    },

    // 10. URL
    // Note: JS lookbehind support varies. Using simplified regex if possible or assuming environment supports it.
    // Python: r"\b(https?://(?!www)|\b(?<!www\.)(?<!@)[a-z0-9-]+\.(nl|com|org))\b"
    // Trying standard structure.
    {
        id: "url_www_ontbreekt",
        description: "Zet altijd ‘www’ voor een URL.",
        // Simplified to avoid complex lookbehinds if not strictly necessary, or using what works.
        // Captures domain.tld or http://domain.tld without www.
        pattern: /\b(https?:\/\/(?!www)|(?<!www\.)(?<!@)[a-z0-9-]+\.(nl|com|org))\b/g,
        suggestion: "www.over-gemeenten.nl",
        category: 'Word Choice'
    },

    // 11. LEESTEKENS
    {
        id: "leesteken_puntkomma",
        description: "Vermijd puntkomma’s. Maak zinnen korter.",
        pattern: /;/g,
        suggestion: ".",
        category: 'Complexity'
    },
    {
        id: "leesteken_gedachtestreepjes",
        description: "Vermijd gedachtestreepjes, gebruik komma's of nieuwe zinnen.",
        pattern: /(\s–\s|\s—\s)/g,
        suggestion: ".",
        category: 'Complexity'
    },

    // 12. SCHRIJFSTIJL & TOON
    {
        id: "stijl_passieve_hulpwerkwoorden",
        description: "Vermijd hulpwerkwoorden (worden, zullen, hebben). Schrijf actief.",
        pattern: /\b(worden|wordt|werden|werd|zullen|zal|zouden|zou|hebben|heeft|hadden|had)\b/gi,
        suggestion: "Probeer de zin actief te maken.",
        category: 'Passive Voice'
    },
    {
        id: "stijl_dwangwoorden",
        description: "Vermijd dwang- en machtswoorden (moeten, dienen, verplicht). Formuleer positief of als advies.",
        pattern: /\b(moeten|moet|moest|dienen|dient|verplicht|verplichte)\b/gi,
        suggestion: "kunnen, mogen, wij adviseren",
        category: 'Word Choice'
    },
    {
        id: "stijl_vreemde_woorden",
        description: "Vermijd buitenlandse/Engelse woorden en termen. Gebruik eenvoudig Nederlands.",
        pattern: /\b(online|website|app|call-to-action|out of office|disclaimer|notebooklm)\b/gi,
        suggestion: "Internet, webstek, actieknop, uitsluiting",
        category: 'Word Choice'
    },
    {
        id: "stijl_afkortingen_voluit",
        description: "Schrijf afkortingen van zinsdelen voluit (m.b.t., a.s.).",
        pattern: /\b(m\.b\.t|a\.s|i\.o\.d|n\.a\.v)\b/gi,
        suggestion: "met betrekking tot, aanstaande, in opdracht van, naar aanleiding van",
        category: 'Word Choice'
    },
    {
        id: "stijl_ambtelijke_taal",
        description: "Vermijd schrijftaal en formele woorden.",
        pattern: /\b(schriftelijk|toegezonden|het indienen van een bezwaarschrift|schorsende werking)\b/gi,
        suggestion: "per brief, sturen, bezwaar maken, uitstellen",
        category: 'Word Choice'
    },
    {
        id: "stijl_inclusieve_aanhef",
        description: "Schrijf inclusief. Gebruik 'Beste inwoner' als het geslacht onbekend is.",
        pattern: /\b(Geachte|Beste)\s+(heer|mevrouw|meneer)([\s/]+(mevrouw|heer|meneer))?\b/gi,
        suggestion: "Beste inwoner",
        category: 'Word Choice'
    },
    {
        id: "stijl_u_vorm",
        description: "Gebruik de u-vorm in brieven en e-mails.",
        pattern: /\b(je|jij|jou|jouw)\b/gi,
        suggestion: "u, uw",
        category: 'Word Choice'
    }
];

// Helper for complex words (placeholders for now, or moved from analysisService/json)
// Analysis Service already handles jargon via JSON check. 
