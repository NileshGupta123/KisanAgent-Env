from server.models import FarmerState, AgentResponse
from server.agents.advisory_agent import AdvisoryAgent


class FertilizerAdviceTask:

    def __init__(self):
        self.advisory_agent = AdvisoryAgent()

    def run(self, state: FarmerState) -> AgentResponse:
        advisory = self.advisory_agent.suggest(state, "general nutrient deficiency")

        explanation = (
            f"For the crop {state.crop} in {state.zone}, fertilizer advice "
            f"is provided based on soil type {state.soil_type}."
        )

        return AgentResponse(
            advisory=advisory,
            explanation=explanation
        )