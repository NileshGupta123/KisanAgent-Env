from server.models import FarmerState, AgentResponse
from server.agents.advisory_agent import AdvisoryAgent


class PlantingAdviceTask:

    def __init__(self):
        self.advisory_agent = AdvisoryAgent()

    def run(self, state: FarmerState) -> AgentResponse:
        advisory = self.advisory_agent.suggest(state, "crop planning")

        explanation = (
            f"Planting strategy based on region {state.zone} "
            f"and climate conditions."
        )

        return AgentResponse(
            advisory=advisory,
            explanation=explanation
        )