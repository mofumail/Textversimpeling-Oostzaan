import re
from typing import List, Pattern
from dataclasses import dataclass

# De imports voor 'schemas' en 'ai_core' missen in dit bestand.
# Het script is alleen uitvoerbaar als deze imports elders zijn gedefinieerd.

@dataclass
class Rule:
    """Dataclass voor een enkele schrijfregel, inclusief het anti-patroon (regex)."""
    id: str
    description: str
    pattern: Pattern
    suggestion: str = ""

# --- SCHRIJFWIJZER REGELS ---
# Detectie van FOUTE patronen (anti-patterns) gebaseerd op de Schrijfwijzer OVER Gemeenten.

RULES_REGISTRY: List[Rule] = [

    # ==========================================
    # 1. BEDRAGEN (Details)
    # ==========================================
    # Regel: Spatie na euroteken (€ 10)
    Rule(
        id="bedrag_spatie",
        description="Zet een spatie tussen het euroteken en het bedrag.",
        pattern=re.compile(r"€(?=\d)"),
        suggestion="€ 1.234,56"
    ),
    # Regel: Komma voor decimalen, geen punt (€ 10.50 -> fout)
    Rule(
        id="bedrag_decimaal_punt",
        description="Gebruik een komma voor decimalen, geen punt.",
        pattern=re.compile(r"€\s?\d+(?:[.]\d{1,2})(?!\d)"),
        suggestion="€ 10,50"
    ),
    # Regel: Hele bedragen met ,-
    Rule(
        id="bedrag_heel_streepje",
        description="Schrijf hele bedragen met ,- erachter.",
        pattern=re.compile(r"€\s?\d+(?![.,]\d|-)\b"),
        suggestion="€ 100,-"
    ),

    # ==========================================
    # 2. ADRESSEN (Details)
    # ==========================================
    # Regel: Postcode gevolgd door PLAATS in HOOFDLETTERS
    Rule(
        id="adres_plaatsnaam_hoofdletters",
        description="Schrijf de plaatsnaam in hoofdletters achter de postcode (bijv. 1234 AB AMSTERDAM).",
        pattern=re.compile(r"\b[1-9]\d{3}\s?[A-Za-z]{2}\s+(?![A-Z]{2,}\b)[A-Z][a-z]+"),
        suggestion="1234 AB AMSTERDAM"
    ),

    # ==========================================
    # 3. DATA (Details) & Concreet Schrijven
    # ==========================================
    # Regel: Schrijf data voluit (15 januari 2025) en vermijd numerieke data
    Rule(
        id="datum_numeriek",
        description="Schrijf data volledig uit (niet numeriek, inclusief jaartal tenzij vanzelfsprekend).",
        pattern=re.compile(r"\b\d{1,2}[-./]\d{1,2}[-./]\d{2,4}\b"),
        suggestion="15 januari 2025"
    ),

    # ==========================================
    # 4. GETALLEN EN RANGTELWOORDEN (Details)
    # ==========================================
    # Regel: Getallen < 20 voluit schrijven
    Rule(
        id="getal_onder_20_voluit",
        description="Schrijf getallen onder de 20 voluit.",
        pattern=re.compile(r"\b([0-9]|1[0-9])\b(?!\.)"),  # 0 t/m 19, negatieve lookahead voor tijden (9.00)
        suggestion="twee, elf, negentien"
    ),
    # Regel: Rangtelwoorden voluit (1e, 2de)
    Rule(
        id="rangtelwoord_voluit",
        description="Schrijf rangtelwoorden voluit.",
        pattern=re.compile(r"\b\d+(e|de|ste|nde)\b"),
        suggestion="eerste, tweede"
    ),
    # Regel: Punt tussen duizendtallen (detecteer verkeerde komma)
    Rule(
        id="duizendtallen_scheiding",
        description="Gebruik punten tussen duizendtallen (niet komma's).",
        pattern=re.compile(r"\d{1,3},\d{3}\b"),
        suggestion="1.000"
    ),

    # ==========================================
    # 5. OPSOMMINGSTEKENS (Details)
    # ==========================================
    # Regel: Gebruik gesloten bullets (•). Detecteer regels die beginnen met - of *
    Rule(
        id="opsomming_stijl",
        description="Gebruik gesloten bullets (•) voor opsommingen.",
        pattern=re.compile(r"(?m)^\s*[-*]\s+"),
        suggestion="•"
    ),

    # ==========================================
    # 6. TELEFOONNUMMERS (Details)
    # ==========================================
    # Regel: Foute groepering van 06-nummers (moet 06 11 22 33 44 zijn)
    Rule(
        id="telefoon_mobiel_groepering",
        description="Controleer de groepering van 06-nummers (moet 06 11 22 33 44 zijn).",
        pattern=re.compile(r"\b06[-]?\d{8}\b|\b06\s\d{8}\b"),
        suggestion="06 11 22 33 44"
    ),
    # Regel: Foute groepering van netnummers (aan elkaar)
    Rule(
        id="telefoon_vast_groepering",
        description="Zet spaties in telefoonnummers volgens de regels.",
        pattern=re.compile(r"\b0[1-57-9]\d{8}\b"),
        suggestion="026 111 22 33"
    ),

    # ==========================================
    # 7. TIJDEN (Details)
    # ==========================================
    # Regel: Geen voorloopnul (09.00 -> 9.00)
    Rule(
        id="tijd_voorloopnul",
        description="Schrijf de ‘0’ als eerste getal niet op bij tijden.",
        pattern=re.compile(r"\b0[1-9][.:]\d{2}\s?(uur)?"),
        suggestion="9.00 uur"
    ),
    # Regel: Gebruik punt, geen dubbele punt (12:00 -> 12.00)
    Rule(
        id="tijd_scheidingsteken",
        description="Gebruik een punt in tijden, geen dubbele punt.",
        pattern=re.compile(r"\b\d{1,2}:\d{2}"),
        suggestion="14.00"
    ),
    # Regel: 'uur' alleen achter de laatste tijd in een reeks
    Rule(
        id="tijd_redundant_uur",
        description="Schrijf ‘uur’ alleen achter de laatste tijd in een reeks.",
        pattern=re.compile(r"\d{1,2}([.:]\d{2})?\s+uur\s+(en|tot|t/m)\s+\d"),
        suggestion="tussen 9.00 en 17.00 uur"
    ),

    # ==========================================
    # 8. AANHALINGSTEKENS (Details)
    # ==========================================
    # Regel: Gebruik altijd **enkele** aanhalingstekens. Detecteer dubbele.
    Rule(
        id="citaat_dubbele_quotes",
        description="Gebruik altijd enkele aanhalingstekens (').",
        pattern=re.compile(r'("|“)'),
        suggestion="'"
    ),

    # ==========================================
    # 9. IBAN (Details)
    # ==========================================
    # Regel: Groepjes van 4. NL12 ABCD 1234 5678 90. Detecteer IBAN aan elkaar.
    Rule(
        id="iban_spatie",
        description="Groepeer IBAN nummers per 4 tekens.",
        pattern=re.compile(r"\bNL\d{2}[A-Z]{4}\d{10}\b"),
        suggestion="NL12 ABCD 1234 5678 90"
    ),

    # ==========================================
    # 10. URL (Details)
    # ==========================================
    # Regel: Altijd www. voor een URL.
    Rule(
        id="url_www_ontbreekt",
        description="Zet altijd ‘www’ voor een URL.",
        pattern=re.compile(r"\b(https?://(?!www)|\b(?<!www\.)(?<!@)[a-z0-9-]+\.(nl|com|org))\b"),
        suggestion="www.over-gemeenten.nl"
    ),

    # ==========================================
    # 11. LEESTEKENS (Details)
    # ==========================================
    # Regel: Geen puntkomma
    Rule(
        id="leesteken_puntkomma",
        description="Vermijd puntkomma’s. Maak zinnen korter.",
        pattern=re.compile(r";"),
        suggestion="."
    ),
    # Regel: Geen gedachtestreepjes
    Rule(
        id="leesteken_gedachtestreepjes",
        description="Vermijd gedachtestreepjes, gebruik komma's of nieuwe zinnen.",
        pattern=re.compile(r"(\s–\s|\s—\s)"),
        suggestion="."
    ),

    # ==========================================
    # 12. SCHRIJFSTIJL & TOON
    # ==========================================
    # Regel: Vermijd hulpwerkwoorden (worden, zullen, hebben) -> Schrijf actief
    Rule(
        id="stijl_passieve_hulpwerkwoorden",
        description="Vermijd hulpwerkwoorden (worden, zullen, hebben). Schrijf actief.",
        pattern=re.compile(r"\b(worden|wordt|werden|werd|zullen|zal|zouden|zou|hebben|heeft|hadden|had)\b", re.IGNORECASE),
        suggestion="Probeer de zin actief te maken."
    ),
    # Regel: Vermijd dwangwoorden (moeten, dienen, verplicht)
    Rule(
        id="stijl_dwangwoorden",
        description="Vermijd dwang- en machtswoorden (moeten, dienen, verplicht). Formuleer positief of als advies.",
        pattern=re.compile(r"\b(moeten|moet|moest|dienen|dient|verplicht|verplichte)\b", re.IGNORECASE),
        suggestion="kunnen, mogen, wij adviseren"
    ),
    # Regel: Vermijd Engelse woorden en termen
    Rule(
        id="stijl_vreemde_woorden",
        description="Vermijd buitenlandse/Engelse woorden en termen. Gebruik eenvoudig Nederlands.",
        pattern=re.compile(r"\b(online|website|app|call-to-action|out of office|disclaimer|notebooklm)\b", re.IGNORECASE),
        suggestion="Internet, webstek, actieknop, uitsluiting"
    ),
    # Regel: Vermijd afkortingen van zinsdelen (m.b.t, a.s.)
    Rule(
        id="stijl_afkortingen_voluit",
        description="Schrijf afkortingen van zinsdelen voluit (m.b.t., a.s.).",
        pattern=re.compile(r"\b(m\.b\.t|a\.s|i\.o\.d|n\.a\.v)\b", re.IGNORECASE),
        suggestion="met betrekking tot, aanstaande, in opdracht van, naar aanleiding van"
    ),
    # Regel: Vermijd schrijftaal/ouderwets taalgebruik. Detecteer 'schriftelijk' en 'toegezonden'
    Rule(
        id="stijl_ambtelijke_taal",
        description="Vermijd schrijftaal en formele woorden.",
        pattern=re.compile(r"\b(schriftelijk|toegezonden|het indienen van een bezwaarschrift|schorsende werking)\b", re.IGNORECASE),
        suggestion="per brief, sturen, bezwaar maken, uitstellen"
    ),
    # Regel: Inclusief taalgebruik (Beste meneer/mevrouw -> Beste inwoner)
    Rule(
        id="stijl_inclusieve_aanhef",
        description="Schrijf inclusief. Gebruik 'Beste inwoner' als het geslacht onbekend is.",
        pattern=re.compile(r"\b(Geachte|Beste)\s+(heer|mevrouw|meneer)([\s/]+(mevrouw|heer|meneer))?\b", re.IGNORECASE),
        suggestion="Beste inwoner"
    ),
    # Regel: Gebruik u-vorm (geen je/jij in brieven/e-mails)
    Rule(
        id="stijl_u_vorm",
        description="Gebruik de u-vorm in brieven en e-mails.",
        pattern=re.compile(r"\b(je|jij|jou|jouw)\b", re.IGNORECASE),
        suggestion="u, uw"
    ),
]


def analyze_text(text: str):
    """
    Analyseert de tekst op basis van de definities in RULES_REGISTRY,
    zinslengte (max. 15 woorden) en alinea-telling (max. 6), en berekent mock B1-scores.
    """
    # De imports voor 'schemas' en 'ai_core' missen in dit bestand.
    # Dit deel is afhankelijk van de projectdefinitie elders.
    try:
        from schemas import RuleViolation, AnalysisResult, ComplianceStats, B1Score
        from ai_core import identify_complex_words
    except ImportError:
        # Placeholder/Mock objecten voor de schemamodules
        class MockRuleViolation:
            def __init__(self, **kwargs): self.__dict__.update(kwargs)
        class MockAnalysisResult:
            def __init__(self, **kwargs): self.__dict__.update(kwargs)
        class MockComplianceStats:
            def __init__(self, **kwargs): self.__dict__.update(kwargs)
        class MockB1Score:
            def __init__(self, **kwargs): self.__dict__.update(kwargs)
        RuleViolation = MockRuleViolation
        AnalysisResult = MockAnalysisResult
        ComplianceStats = MockComplianceStats
        B1Score = MockB1Score
        def identify_complex_words(t): return [] # Mock functie
    
    violations = []

    # 1. Regex Rules Check
    for rule in RULES_REGISTRY:
        for match in rule.pattern.finditer(text):
            violations.append(
                RuleViolation(
                    rule_name=rule.id, # Gebruik de vertaalde ID als naam
                    message=rule.description,
                    match_text=match.group(),
                    start_index=match.start(),
                    end_index=match.end(),
                    suggestion=rule.suggestion
                )
            )

    # 2. Complex Words Check (AI Core)
    complex_words = identify_complex_words(text)
    
    # 3. Sentence Complexity Check (Max. 15 woorden)
    sentence_pattern = re.compile(r'[^.?!]+[.?!]+')
    
    total_words = 0
    long_sentences_count = 0
    sentence_count = 0
    
    for match in sentence_pattern.finditer(text):
        sentence_text = match.group().strip()
        if not sentence_text: continue
        
        sentence_count += 1
        words = re.findall(r'\b\w+\b', sentence_text)
        word_count = len(words)
        total_words += word_count
        
        if word_count > 15: # Maximaal 15 woorden is de richtlijn
            long_sentences_count += 1
            violations.append(
                RuleViolation(
                    rule_name="zin_te_lang", # Vertaalde ID
                    message=f"Deze zin is te lang ({word_count} woorden). Maximaal 15 woorden.",
                    match_text=sentence_text,
                    start_index=match.start(),
                    end_index=match.end(),
                    suggestion="Splits de zin of kort hem in."
                )
            )

    avg_sentence_length = total_words / sentence_count if sentence_count > 0 else 0
    
    # 4. Paragraph Count Check (Max. 6 alinea's)
    paragraphs = [p for p in text.split('\n\n') if p.strip()]
    if len(paragraphs) > 6:
        violations.append(
            RuleViolation(
                rule_name="teveel_alineas", # Vertaalde ID
                message=f"De tekst bevat {len(paragraphs)} alinea's. Maximaal 6 toegestaan (incl. inleiding/slot).",
                match_text="",
                start_index=0,
                end_index=0,
                suggestion="Kort de tekst in of voeg alinea's samen."
            )
        )

    # 5. Calculate B1 Score (Mock Logic)
    score = 100
    score -= (long_sentences_count * 3)
    score -= (len(complex_words) * 3)
    score -= (len(violations) * 1)
    
    if score < 0: score = 0
    
    if score > 90: level = "A2/B1"
    elif score > 70: level = "B1"
    elif score > 50: level = "B2"
    else: level = "C1"

    compliance_stats = ComplianceStats(
        avg_sentence_length=round(avg_sentence_length, 1),
        long_sentences_count=long_sentences_count,
        jargon_count=len(complex_words),
        b1_score=B1Score(score=score, level=level)
    )

    return AnalysisResult(
        is_clean=(len(violations) == 0 and len(complex_words) == 0 and long_sentences_count == 0),
        violations=violations,
        complex_words=complex_words,
        compliance_stats=compliance_stats
    )