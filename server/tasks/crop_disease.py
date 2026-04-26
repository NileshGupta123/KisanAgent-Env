from server.models import FarmerState, AgentResponse, DiagnosisOutput, AdvisoryOutput

class CropDiseaseTask:
    def run(self, state: FarmerState) -> AgentResponse:
        # Dummy Logic for demo
        disease = "Wheat Rust" if state.crop == "Wheat" else "Bacterial Blight"
        
        return AgentResponse(
            diagnosis=DiagnosisOutput(
                disease=disease,
                confidence=0.88,
                severity="Medium"
            ),
            advisory=AdvisoryOutput(
                treatment="Apply Propiconazole 25% EC at 500ml/hectare.",
                fertilizer="Apply Potassium-rich fertilizer to strengthen stem.",
                irrigation="Reduce irrigation frequency to lower humidity around crop canopy.",
                precautions="Avoid walking through the field when wet to prevent spore spread."
            ),
            explanation=f"The symptoms like {', '.join(state.symptoms)} in {state.zone} suggest a fungal infection typical of {disease} under {state.temperature_c}°C conditions.",
            hindi_advice=f"आपकी {state.crop} की फसल में {disease} के लक्षण दिख रहे हैं। कृपया प्रोपिकोनाज़ोल का छिड़काव करें और सिंचाई कम करें।"
        )
