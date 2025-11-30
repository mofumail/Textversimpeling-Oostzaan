import re

def test_regex():
    text = "De kosten zijn €10 en de datum is 15-01-2025."
    
    # 1. Amount Spacing
    # Old: r"€(?=\d)"
    # New: r"€\d+(?:[.,]\d+)?"
    amount_pattern = re.compile(r"€\d+(?:[.,]\d+)?")
    print(f"Testing amount pattern on '{text}'")
    for match in amount_pattern.finditer(text):
        print(f"MATCH AMOUNT: {match.group()}")

    # 2. Numbers under 20
    # New: r"(?<!€)(?<!€\s)(?<!-)\b([0-9]|1[0-9])\b(?!-)"
    number_pattern = re.compile(r"(?<!€)(?<!€\s)(?<!-)\b([0-9]|1[0-9])\b(?!-)")
    print(f"Testing number pattern on '{text}'")
    for match in number_pattern.finditer(text):
        print(f"MATCH NUMBER: {match.group()}")

if __name__ == "__main__":
    test_regex()
