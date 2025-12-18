from fastapi.testclient import TestClient
from main import app
import sys
import os

# Add backend to path
sys.path.append(os.path.dirname(__file__))

client = TestClient(app)

def test_analyze_endpoint():
    # Test with clean text
    response = client.post("/api/analyze", json={"text": "Dit is een korte zin."})
    assert response.status_code == 200
    data = response.json()
    assert data["is_clean"] is True
    assert data["compliance_stats"]["long_sentences_count"] == 0

    # Test with jargon
    response = client.post("/api/analyze", json={"text": "Aangezien wij dit verzoeken."})
    assert response.status_code == 200
    data = response.json()
    assert data["compliance_stats"]["jargon_count"] > 0
    assert len(data["complex_words"]) > 0
    assert data["complex_words"][0]["word"] == "Aangezien"

    # Test with long sentence
    long_sentence = "Dit is een hele lange zin die waarschijnlijk meer dan vijftien woorden bevat om te testen of de lengte check goed werkt in onze applicatie."
    response = client.post("/api/analyze", json={"text": long_sentence})
    assert response.status_code == 200
    data = response.json()
    assert data["compliance_stats"]["long_sentences_count"] > 0

def test_rewrite_endpoint():
    response = client.post("/api/rewrite", json={"text": "Aangezien wij dit verzoeken."})
    assert response.status_code == 200
    data = response.json()
    # "Aangezien" -> "omdat" (or similar), "verzoeken" -> "vragen"
    # Exact output depends on order, but should be different
    assert data["simplified_text"] != "Aangezien wij dit verzoeken."
    assert "omdat" in data["simplified_text"] or "want" in data["simplified_text"]

def test_templates_endpoint():
    response = client.get("/api/templates")
    assert response.status_code == 200
    data = response.json()
    assert len(data["templates"]) > 0
    assert data["templates"][0]["name"] is not None

if __name__ == "__main__":
    try:
        test_analyze_endpoint()
        print("test_analyze_endpoint passed")
        test_rewrite_endpoint()
        print("test_rewrite_endpoint passed")
        test_templates_endpoint()
        print("test_templates_endpoint passed")
        print("All tests passed!")
    except AssertionError as e:
        print(f"Test failed: {e}")
        exit(1)
    except Exception as e:
        print(f"An error occurred: {e}")
        exit(1)
