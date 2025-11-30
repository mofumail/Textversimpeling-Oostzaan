from pydantic import BaseModel
from typing import List, Optional

# --- Input Models ---

class TextSubmission(BaseModel):
    text: str

class RewriteRequest(BaseModel):
    text: str

# --- Output Models ---

class ComplexWord(BaseModel):
    word: str
    alternatives: List[str]

class B1Score(BaseModel):
    score: float # 0-100
    level: str # "A1", "A2", "B1", "B2", "C1", "C2" (Estimated)

class ComplianceStats(BaseModel):
    avg_sentence_length: float
    long_sentences_count: int
    jargon_count: int
    b1_score: B1Score

class RuleViolation(BaseModel):
    rule_name: str
    message: str
    match_text: str
    start_index: int
    end_index: int
    suggestion: Optional[str] = None

class AnalysisResult(BaseModel):
    is_clean: bool
    violations: List[RuleViolation]
    complex_words: List[ComplexWord]
    compliance_stats: ComplianceStats

class RewriteResponse(BaseModel):
    original_text: str
    simplified_text: str

class Template(BaseModel):
    id: int
    name: str
    content: str

class TemplateList(BaseModel):
    templates: List[Template]