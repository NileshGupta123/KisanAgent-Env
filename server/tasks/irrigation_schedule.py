from server.models import FarmerState, AgentResponse
from server.agents.advisory_agent import AdvisoryAgent


class IrrigationScheduleTask:

    def __init__(self):
        self.advisory_agent = AdvisoryAgent()

    def run(self, state: FarmerState) -> AgentResponse:
        advisory = self.advisory_agent.suggest(state, "water stress")

        explanation = (
            f"Irrigation plan generated based on rainfall {state.rainfall_mm} mm "
            f"and temperature {state.temperature_c}°C."
        )

        return AgentResponse(
            advisory=advisory,
            explanation=explanation
        )