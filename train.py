import time
from server.env import KisanAgentEnv


def run_training(episodes=5):
    env = KisanAgentEnv()

    all_scores = []

    print("\n🚀 Starting Training Loop...\n")

    for episode in range(episodes):
        print(f"Episode {episode + 1}")

        env.reset(0)

        result = env.step()

        score = result.reward
        all_scores.append(score)

        print(f"Score: {score:.2f}")
        print(f"Feedback: {result.feedback}")
        print("-" * 40)

        time.sleep(1)  # simulate training delay

    print("\n📈 Training Summary:")
    print("Scores:", all_scores)

    if len(all_scores) > 1:
        improvement = all_scores[-1] - all_scores[0]
        print(f"Improvement: {improvement:.2f}")

    return all_scores


if __name__ == "__main__":
    run_training(5)