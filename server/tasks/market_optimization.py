from server.models import FarmerState, AgentResponse
from server.agents.advisory_agent import AdvisoryAgent


class MarketOptimizationTask:

    def __init__(self):
        self.advisory_agent = AdvisoryAgent()

    def run(self, state: FarmerState) -> AgentResponse:
        advisory = self.advisory_agent.suggest(state, "market timing")

        explanation = (
            f"Market strategy suggested for crop {state.crop} "
            f"in {state.zone} to maximize profit."
        )

        return AgentResponse(
            advisory=advisory,
            explanation=explanation
        )