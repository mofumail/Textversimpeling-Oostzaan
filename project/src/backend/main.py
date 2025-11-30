from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import TextSubmission, AnalysisResult
from rules import analyze_text

app = FastAPI(title="Text Simplification & Compliance API")

# Configure CORS (Important for React Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific React URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/analyze", response_model=AnalysisResult)
async def check_text_rules(payload: TextSubmission):
    """
    Analyzes text against 'Detailafspraken' style guide.
    Returns a list of violations with indices for frontend highlighting.
    """
    try:
        violations = analyze_text(payload.text)

        return AnalysisResult(
            is_clean=(len(violations) == 0),
            violations=violations
        )
    except Exception as e:
        # Log error in production
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health_check():
    return {"status": "operational"}