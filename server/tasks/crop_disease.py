from server.models import FarmerState, AgentResponse
from server.agents.diagnosis_agent import DiagnosisAgent
from server.agents.advisory_agent import AdvisoryAgent


class CropDiseaseTask:

    def __init__(self):
        self.diagnosis_agent = DiagnosisAgent()
        self.advisory_agent = AdvisoryAgent()

    def run(self, state: FarmerState) -> AgentResponse:
        # 🔹 Step 1: Diagnose
        diagnosis = self.diagnosis_agent.analyze(state)

        # 🔹 Step 2: Advisory based on diagnosis
        advisory = self.advisory_agent.suggest(
            state, diagnosis.disease
        )

        # 🔹 Step 3: Explanation
        explanation = (
            f"For your crop {state.crop}, the issue is {diagnosis.disease}. "
            f"This is {diagnosis.severity} severity. "
            f"We recommend: {advisory.treatment}. "
            f"Fertilizer: {advisory.fertilizer}. "
            f"Irrigation: {advisory.irrigation}."
        )

        hindi_advice = (
            f"{state.crop} fasal mein {diagnosis.disease} ki samasya hai. "
            f"Iska star {diagnosis.severity} hai. "
            f"Upchar: {advisory.treatment}. "
            f"Khad: {advisory.fertilizer}. "
            f"Paani: {advisory.irrigation}."
        )

        return AgentResponse(
            diagnosis=diagnosis,
            advisory=advisory,
            explanation=explanation,
            hindi_advice=hindi_advice
        )