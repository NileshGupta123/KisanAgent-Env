import os
import json
import re
from dotenv import load_dotenv
from openai import OpenAI

from server.models import FarmerState, AdvisoryOutput

# 🔹 Load env
load_dotenv(override=False)

client = OpenAI(
    api_key=os.environ.get("API_KEY"),
    base_url=os.environ.get("API_BASE_URL")
)

MODEL = os.environ.get("MODEL_NAME", "llama-3.1-8b-instant")


class AdvisoryAgent:

    def suggest(self, state: FarmerState, disease: str) -> AdvisoryOutput:
        prompt = f"""
You are an expert agricultural advisor helping Indian farmers.

Based on the crop and disease, provide practical recommendations.

Crop: {state.crop}
Location: {state.zone}
Disease: {disease}

Respond ONLY with VALID JSON. Do NOT include extra text.

Format:
{{
  "treatment": "what to do for disease",
  "fertilizer": "recommended fertilizer",
  "irrigation": "watering advice",
  "precautions": "additional precautions"
}}
"""

        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )

            output = response.choices[0].message.content.strip()

            print("ADVISORY RAW:", output)

            match = re.search(r"\{.*\}", output, re.DOTALL)

            if match:
                data = json.loads(match.group())
            else:
                raise ValueError("No JSON found")

            return AdvisoryOutput(
                treatment=data.get("treatment", "Use appropriate pesticide"),
                fertilizer=data.get("fertilizer", "Balanced NPK fertilizer"),
                irrigation=data.get("irrigation", "Moderate irrigation"),
                precautions=data.get("precautions", "Monitor crop regularly")
            )

        except Exception as e:
            print("AdvisoryAgent Error:", e)

            return AdvisoryOutput(
                treatment="General treatment recommended",
                fertilizer="Balanced fertilizer",
                irrigation="Regular irrigation",
                precautions="Monitor conditions"
            )