from server.data.scenarios import get_scenario
from server.tasks.crop_disease import CropDiseaseTask
from server.graders.grader import CropDiseaseGrader
from server.models import StepResult


class KisanAgentEnv:

    def __init__(self):
        self.task = CropDiseaseTask()
        self.grader = CropDiseaseGrader()
        self.current_step = 0
        self.max_steps = 5
        self.state = None

        # 🔥 Memory (for learning simulation)
        self.memory = []

    # -------------------------------
    # RESET
    # -------------------------------
    def reset(self, scenario_index: int = 0):
        self.state = get_scenario(scenario_index)
        self.current_step = 0

        return {
            "state": self.state
        }

    # -------------------------------
    # STEP
    # -------------------------------
    def step(self):
        if self.state is None:
            raise ValueError("Call reset() before step().")

        # 🔹 Agent decision
        action = self.task.run(self.state)

        # 🔹 Evaluate
        reward_breakdown = self.grader.grade(self.state, action)

        # 🔹 Feedback
        feedback = self.grader.generate_feedback(
            self.state, action, reward_breakdown
        )

        # 🔹 Save memory (for demo storytelling)
        self.memory.append({
            "state": self.state.dict(),
            "action": action.dict(),
            "reward": reward_breakdown.total_score
        })

        # 🔹 Step count
        self.current_step += 1
        done = self.current_step >= self.max_steps

        return StepResult(
            state=self.state,
            action=action,
            reward=reward_breakdown.total_score,
            done=done,
            feedback=feedback
        )