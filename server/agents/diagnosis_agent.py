import os
import json
import re
from dotenv import load_dotenv
from openai import OpenAI

from server.models import FarmerState, DiagnosisOutput

# 🔹 Load environment variables
load_dotenv(override=False)

client = OpenAI(
    api_key=os.environ.get("API_KEY"),
    base_url=os.environ.get("API_BASE_URL")
)

MODEL = os.environ.get("MODEL_NAME", "llama-3.1-8b-instant")


class DiagnosisAgent:

    def analyze(self, state: FarmerState) -> DiagnosisOutput:
        prompt = f"""
You are an expert agricultural scientist helping Indian farmers.

Analyze the following farm data and identify the most likely crop disease.

Crop: {state.crop}
Location: {state.zone}
Symptoms: {", ".join(state.symptoms)}
Soil Type: {state.soil_type}
Rainfall: {state.rainfall_mm} mm
Temperature: {state.temperature_c} C
Humidity: {state.humidity} %

Respond ONLY with VALID JSON. Do NOT include any explanation.

Return strictly in this format:
{{
  "disease": "Bacterial Leaf Blight",
  "confidence": 0.85,
  "severity": "medium"
}}
"""

        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )

            output = response.choices[0].message.content.strip()

            print("RAW OUTPUT:", output)

            # 🔹 Extract JSON safely
            match = re.search(r"\{.*\}", output, re.DOTALL)

            if match:
                json_str = match.group()
                data = json.loads(json_str)
            else:
                raise ValueError("No JSON found")

            return DiagnosisOutput(
                disease=data.get("disease", "Unknown Disease"),
                confidence=float(data.get("confidence", 0.5)),
                severity=data.get("severity", "medium")
            )

        except Exception as e:
            print("DiagnosisAgent Error:", e)

            return DiagnosisOutput(
                disease="Unknown Disease",
                confidence=0.3,
                severity="low"
            )