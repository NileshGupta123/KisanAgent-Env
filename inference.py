import os
import requests
from dotenv import load_dotenv

# 🔹 Load environment variables
load_dotenv(override=False)

# 🔹 IMPORTANT: This will be replaced with HF URL later
ENV_BASE_URL = os.environ.get("ENV_BASE_URL", "http://127.0.0.1:8000")


def run_inference(scenario: int = 0):
    try:
        # 🔹 Step 1: Reset environment
        reset_url = f"{ENV_BASE_URL}/reset?scenario={scenario}"
        reset_response = requests.get(reset_url)
        reset_data = reset_response.json()

        # 🔹 Step 2: Take a step
        step_url = f"{ENV_BASE_URL}/step"
        step_response = requests.get(step_url)
        step_data = step_response.json()

        return {
            "status": "success",
            "state": step_data.get("state"),
            "diagnosis": step_data.get("action", {}).get("diagnosis"),
            "advisory": step_data.get("action", {}).get("advisory"),
            "reward": step_data.get("reward"),
            "feedback": step_data.get("feedback")
        }

    except Exception as e:
        print("Inference Error:", e)
        return {
            "status": "error",
            "message": str(e)
        }


# 🔹 For local testing
if __name__ == "__main__":
    result = run_inference(0)
    print(result)