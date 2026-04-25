from pydantic import BaseModel
from typing import List, Optional


# 🔹 Input from environment (scenario)
class FarmerState(BaseModel):
    zone: str
    crop: str
    symptoms: List[str]
    soil_type: str
    rainfall_mm: float
    temperature_c: float
    humidity: float


# 🔹 Agent output (Diagnosis)
class DiagnosisOutput(BaseModel):
    disease: str
    confidence: float
    severity: str  # low / medium / high


# 🔹 Agent output (Advice)
class AdvisoryOutput(BaseModel):
    treatment: str
    fertilizer: str
    irrigation: str
    precautions: Optional[str] = None


# 🔹 Task result (what agent returns finally)
class AgentResponse(BaseModel):
    diagnosis: Optional[DiagnosisOutput] = None
    advisory: Optional[AdvisoryOutput] = None
    explanation: str
    hindi_advice: Optional[str] = None   # 🔥 NEW


# 🔹 Reward breakdown (VERY IMPORTANT for judges)
class RewardBreakdown(BaseModel):
    disease_score: float = 0.0
    treatment_score: float = 0.0
    severity_score: float = 0.0
    language_score: float = 0.0
    total_score: float = 0.0


# 🔹 Step result (OpenEnv style)
class StepResult(BaseModel):
    state: FarmerState
    action: AgentResponse
    reward: float
    done: bool
    feedback: str