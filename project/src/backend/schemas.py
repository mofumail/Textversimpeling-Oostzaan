from pydantic import BaseModel
from typing import List, Optional

class TextSubmission(BaseModel):
    text: str

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