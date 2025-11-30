import re
from typing import List, Pattern
from dataclasses import dataclass


@dataclass
class Rule:
    id: str
    description: str
    pattern: Pattern
    suggestion: str = ""


# --- HULP REGEX ---
# Regex is krachtig, maar sommige regels zijn context-afhankelijk.
# We richten ons hier op het detecteren van FOUTE patronen (anti-patterns).

RULES_REGISTRY: List[Rule] = [

    # ==========================================
    # 1. BEDRAGEN
    # ==========================================
    # Regel: Spatie na euroteken (€ 10)
    Rule(
        id="amount_spacing",
        description="Zet een spatie tussen het euroteken en het bedrag.",
        pattern=re.compile(r"€(?=\d)"),
        suggestion="€ 1.234,56"
    ),
    # Regel: Komma voor decimalen, geen punt (€ 10.50 -> fout)
    Rule(
        id="amount_decimal_dot",
        description="Gebruik een komma voor decimalen, geen punt.",
        pattern=re.compile(r"€\s?\d+(?:[.]\d{1,2})(?!\d)"),
        suggestion="€ 10,50"
    ),
    # Regel: Hele bedragen met ,- (€ 100 -> fout, moet € 100,- zijn)
    # Dit is lastig omdat € 100 ook in een zin kan staan.
    # We checken hier specifiek op € 100 zonder decimalen en zonder ,-
    Rule(
        id="amount_whole_hyphen",
        description="Schrijf hele bedragen met ,- erachter.",
        pattern=re.compile(r"€\s?\d+(?![.,]\d|-)\b"),
        suggestion="€ 100,-"
    ),

    # ==========================================
    # 2. ADRESSEN
    # ==========================================
    # Regel: Postcode gevolgd door PLAATS in hoofdletters.
    # We zoeken naar "1234 AB Plaats" (Plaats niet volledig hoofdletters)
    Rule(
        id="address_city_caps",
        description="Schrijf de plaatsnaam in hoofdletters achter de postcode.",
        pattern=re.compile(r"\b[1-9]\d{3}\s?[A-Za-z]{2}\s+(?![A-Z]{2,}\b)[A-Z][a-z]+"),
        suggestion="1234 AB AMSTERDAM"
    ),

    # ==========================================
    # 3. DATA (DATES)
    # ==========================================
    # Regel: Schrijf data voluit (15 januari). Detecteer numerieke data (15-01-2025)
    Rule(
        id="date_numeric",
        description="Schrijf data volledig uit (niet numeriek).",
        pattern=re.compile(r"\b\d{1,2}[-]\d{1,2}[-]\d{2,4}\b"),
        suggestion="15 januari 2025"
    ),
    # Regel: Jaartal weglaten als vanzelfsprekend.
    # Dit is contextueel lastig, maar we kunnen wel flaggen dat er een jaartal staat
    # zodat de gebruiker kan checken of het nodig is. (Optioneel, hier 'soft' check)
    # Voor nu laten we deze achterwege om valse positieven te voorkomen, tenzij strikt gewenst.

    # ==========================================
    # 4. GETALLEN EN RANGTELWOORDEN
    # ==========================================
    # Regel: Getallen < 20 voluit schrijven.
    Rule(
        id="numbers_under_20",
        description="Schrijf getallen onder de 20 voluit.",
        pattern=re.compile(r"\b([0-9]|1[0-9])\b"),  # 0 t/m 19
        suggestion="twee, elf, negentien"
    ),
    # Regel: Rangtelwoorden voluit (1e, 2de)
    Rule(
        id="ordinals",
        description="Schrijf rangtelwoorden voluit.",
        pattern=re.compile(r"\b\d+(e|de|ste)\b"),
        suggestion="eerste, tweede"
    ),
    # Regel: Punt tussen duizendtallen.
    # We detecteren hier het gebruik van komma's als scheiding (Engelse stijl): 1,000
    Rule(
        id="thousands_wrong_separator",
        description="Gebruik punten tussen duizendtallen (niet komma's).",
        pattern=re.compile(r"\d{1,3},\d{3}\b"),
        suggestion="1.000"
    ),

    # ==========================================
    # 5. OPSOMMINGSTEKENS
    # ==========================================
    # Regel: Gebruik bullets (•). Detecteer regels die beginnen met - of *
    Rule(
        id="bullet_style",
        description="Gebruik gesloten bullets (•) voor opsommingen.",
        pattern=re.compile(r"(?m)^\s*[-*]\s+"),
        suggestion="•"
    ),

    # ==========================================
    # 6. TELEFOONNUMMERS
    # ==========================================
    # Regel: 06-nummers groeperen: 06 11 22 33 44
    # Detecteer 06 nummers die aan elkaar geschreven zijn of streepjes hebben
    Rule(
        id="phone_mobile_format",
        description="06-nummers format: 06 11 22 33 44",
        pattern=re.compile(r"\b06\s?[-]?\s?\d{8}\b"),
        # Let op: Deze regex vindt ook de GOEDE versie niet, hij zoekt naar 'aan elkaar' of 'streepjes'
        # Een betere aanpak voor validatie is complex, we zoeken hier specifiek de FOUTE formaten:
        # 0612345678 of 06-12345678
        pattern=re.compile(r"\b06[-]?\d{8}\b|\b06\s\d{8}\b"),
        suggestion="06 11 22 33 44"
    ),
    # Regel: Netnummers (Vast).
    # Detecteer lange reeksen van 10 cijfers die met 0 beginnen (niet 06) en geen spaties hebben.
    Rule(
        id="phone_landline_spacing",
        description="Zet spaties in telefoonnummers volgens de regels.",
        pattern=re.compile(r"\b0[1-57-9]\d{8}\b"),  # 0101234567 (aan elkaar)
        suggestion="026 111 22 33"
    ),

    # ==========================================
    # 7. TIJDEN
    # ==========================================
    # Regel: Geen voorloopnul (09.00 -> 9.00)
    Rule(
        id="time_leading_zero",
        description="Schrijf de ‘0’ als eerste getal niet op bij tijden.",
        pattern=re.compile(r"\b0[1-9][.:]\d{2}\s?(uur)?"),
        suggestion="9.00 uur"
    ),
    # Regel: Gebruik punt, geen dubbele punt (12:00 -> 12.00)
    Rule(
        id="time_separator_colon",
        description="Gebruik een punt in tijden, geen dubbele punt.",
        pattern=re.compile(r"\b\d{1,2}:\d{2}"),
        suggestion="14.00"
    ),
    # Regel: 'uur' alleen achter laatste tijd.
    # Detecteer "uur" in het midden van een reeks: "9.00 uur en 17.00 uur"
    Rule(
        id="time_redundant_uur",
        description="Schrijf ‘uur’ alleen achter de laatste tijd in een reeks.",
        pattern=re.compile(r"\d{1,2}([.:]\d{2})?\s+uur\s+(en|tot|t/m)\s+\d"),
        suggestion="tussen 9.00 en 17.00 uur"
    ),

    # ==========================================
    # 8. AANHALINGSTEKENS
    # ==========================================
    # Regel: Enkele quotes. Detecteer dubbele.
    Rule(
        id="quotes_double",
        description="Gebruik altijd enkele aanhalingstekens.",
        pattern=re.compile(r'("|“)'),
        suggestion="'"
    ),

    # ==========================================
    # 9. IBAN
    # ==========================================
    # Regel: Groepjes van 4. NL12 ABCD 1234 5678 90
    # Detecteer een IBAN die aan elkaar geschreven is (NL + 16 tekens zonder spaties)
    Rule(
        id="iban_spacing",
        description="Groepeer IBAN nummers per 4 tekens.",
        pattern=re.compile(r"\bNL\d{2}[A-Z]{4}\d{10}\b"),
        suggestion="NL12 ABCD 1234 5678 90"
    ),

    # ==========================================
    # 10. URL
    # ==========================================
    # Regel: Altijd www.
    # Detecteer http/https zonder www, of domein startend zonder www
    Rule(
        id="url_www_missing",
        description="Zet altijd ‘www’ voor een URL.",
        pattern=re.compile(r"\b(https?://(?!www)|\b(?<!www\.|@)[a-z0-9-]+\.(nl|com|org))\b"),
        suggestion="www.over-gemeenten.nl"
    ),

    # ==========================================
    # 11. LEESTEKENS
    # ==========================================
    # Regel: Geen puntkomma
    Rule(
        id="punctuation_semicolon",
        description="Vermijd puntkomma’s. Maak zinnen korter.",
        pattern=re.compile(r";"),
        suggestion="."
    ),
    # Regel: Geen gedachtestreepjes
    Rule(
        id="punctuation_dashes",
        description="Vermijd gedachtestreepjes, gebruik komma's of nieuwe zinnen.",
        pattern=re.compile(r"(\s–\s|\s—\s)"),
        suggestion="."
    ),
]


def analyze_text(text: str):
    # Import hier om circulaire imports te voorkomen in grotere projecten
    from schemas import RuleViolation

    violations = []

    for rule in RULES_REGISTRY:
        for match in rule.pattern.finditer(text):
            violations.append(
                RuleViolation(
                    rule_name=rule.id,
                    message=rule.description,
                    match_text=match.group(),
                    start_index=match.start(),
                    end_index=match.end(),
                    suggestion=rule.suggestion
                )
            )

    return violations