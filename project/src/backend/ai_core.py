import json
import os
import re
from typing import List
from schemas import ComplexWord # Aangenomen schema voor dit bestand

# Load jargon list
JARGON_FILE = os.path.join(os.path.dirname(__file__), "data", "jargon.json")

def load_jargon_list():
    """Laadt de jargonlijst uit een JSON-bestand."""
    try:
        with open(JARGON_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        # Foutafhandeling toegevoegd: retourneer een lege lijst als het bestand niet bestaat
        print(f"Waarschuwing: Jargonbestand niet gevonden op {JARGON_FILE}. Retourneer lege lijst.")
        return []
    except json.JSONDecodeError:
        print(f"Fout: Kan {JARGON_FILE} niet decoderen. Controleer of het geldige JSON is.")
        return []

JARGON_LIST = load_jargon_list()

def identify_complex_words(text: str) -> List[ComplexWord]:
    """
    Identificeert complexe woorden in de tekst op basis van de jargonlijst.
    Retourneert een lijst met unieke ComplexWord objecten.
    """
    complex_words = []
    text_lower = text.lower()
    
    # Check against jargon list
    for item in JARGON_LIST:
        word = item["word"]
        
        # Gebruik word boundaries (\b) om te zorgen dat alleen complete woorden matchen
        pattern = r"\b" + re.escape(word) + r"\b"
        matches = re.finditer(pattern, text, re.IGNORECASE)
        
        for match in matches:
            # Voeg gevonden instantie toe
            complex_words.append(ComplexWord(
                word=match.group(), # Gebruik originele casing uit tekst
                alternatives=item["alternatives"]
            ))
            
    # Dedupliceer op basis van het woord (lowercase) voor een nette zijbalk/samenvatting
    seen = set()
    unique_complex_words = []
    for cw in complex_words:
        if cw.word.lower() not in seen:
            seen.add(cw.word.lower())
            unique_complex_words.append(cw)
            
    return unique_complex_words

def rewrite_to_b1(text: str) -> str:
    """
    Herschrijft de tekst naar B1-niveau door jargon te vervangen (Mock).
    """
    # 1. Vervang jargonwoorden
    simplified_text = text
    
    for item in JARGON_LIST:
        word = item["word"]
        alternatives = item["alternatives"]
        if alternatives:
            best_alt = alternatives[0]
            # Simple replace (case insensitive)
            pattern = re.compile(r"\b" + re.escape(word) + r"\b", re.IGNORECASE)
            # Voer vervanging uit
            simplified_text = pattern.sub(best_alt, simplified_text)
            
    # 2. Heuristiek: Splits lange zinnen (dit is een mock, echte LLM nodig voor semantiek)
    # Dit gedeelte blijft abstract zonder LLM of geavanceerde NLP.
    
    return simplified_text