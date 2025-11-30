from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import TextSubmission, AnalysisResult, RewriteRequest, RewriteResponse, TemplateList, Template
from rules import analyze_text
from ai_core import rewrite_to_b1
import json
import os

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
    Analyzes text against 'Detailafspraken' style guide, B1 rules, and Jargon list.
    """
    try:
        # The analyze_text function now returns a full AnalysisResult object
        result = analyze_text(payload.text)
        return result
    except Exception as e:
        # Log error in production
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rewrite", response_model=RewriteResponse)
async def rewrite_text(payload: RewriteRequest):
    """
    Rewrites the input text to B1 level.
    """
    try:
        simplified = rewrite_to_b1(payload.text)
        return RewriteResponse(
            original_text=payload.text,
            simplified_text=simplified
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/templates", response_model=TemplateList)
async def get_templates():
    """
    Returns a list of available letter templates.
    """
    try:
        templates_path = os.path.join(os.path.dirname(__file__), "data", "templates.json")
        with open(templates_path, "r", encoding="utf-8") as f:
            templates_data = json.load(f)
        
        # Validate/Parse with Pydantic
        templates = [Template(**t) for t in templates_data]
        return TemplateList(templates=templates)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "operational"}