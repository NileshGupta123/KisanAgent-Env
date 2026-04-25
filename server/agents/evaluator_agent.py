import os
import json
import re
from dotenv import load_dotenv
from openai import OpenAI

from server.models import FarmerState, AgentResponse

# 🔹 Load env
load_dotenv(override=False)

client = OpenAI(
    api_key=os.environ.get("API_KEY"),
    base_url=os.environ.get("API_BASE_URL")
)

MODEL = os.environ.get("MODEL_NAME", "llama-3.1-8b-instant")


class EvaluatorAgent:

    def evaluate(self, state: FarmerState, response: AgentResponse):
        prompt = f"""
You are an expert evaluator for an AI agricultural assistant.

Evaluate the quality of the agent's response.

INPUT:
Crop: {state.crop}
Location: {state.zone}
Symptoms: {", ".join(state.symptoms)}

Agent Output:
Disease: {response.diagnosis.disease if response.diagnosis else "None"}
Confidence: {response.diagnosis.confidence if response.diagnosis else 0}
Severity: {response.diagnosis.severity if response.diagnosis else "None"}
Explanation: {response.explanation}

---

Evaluate based on:
1. Disease correctness
2. Logical reasoning
3. Confidence alignment
4. Explanation clarity

---

Return ONLY JSON:

{{
  "score": 0.0 to 1.0,
  "feedback": "short improvement suggestion"
}}
"""

        try:
            res = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )

            output = res.choices[0].message.content.strip()

            print("EVALUATOR RAW:", output)

            match = re.search(r"\{.*\}", output, re.DOTALL)

            if match:
                data = json.loads(match.group())
            else:
                raise ValueError("No JSON found")

            score = float(data.get("score", 0.5))
            feedback = data.get("feedback", "Needs improvement")

            # 🔥 Safety clamp
            score = max(0.0, min(1.0, score))

            return score, feedback

        except Exception as e:
            print("EvaluatorAgent Error:", e)

            return 0.5, "Evaluation failed, default score applied"