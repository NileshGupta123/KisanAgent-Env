from server.models import FarmerState, AgentResponse, RewardBreakdown


class CropDiseaseGrader:

    def grade(self, state: FarmerState, response: AgentResponse) -> RewardBreakdown:
        score = RewardBreakdown()

        expected_disease = self._get_expected_disease(state.crop)

        # -------------------------------
        # 1. Disease Accuracy (0.4)
        # -------------------------------
        if response.diagnosis:
            predicted = response.diagnosis.disease.lower()

            if expected_disease in predicted:
                score.disease_score = 0.4
            elif any(word in predicted for word in expected_disease.split()):
                score.disease_score = 0.2
            else:
                score.disease_score = 0.0

        # -------------------------------
        # 2. Severity Validity (0.2)
        # -------------------------------
        if response.diagnosis:
            severity = response.diagnosis.severity.lower()
            if severity in ["low", "medium", "high"]:
                score.severity_score = 0.2

        # -------------------------------
        # 3. Explanation Quality (0.2)
        # -------------------------------
        if response.explanation:
            length = len(response.explanation.split())

            if length > 20:
                score.language_score = 0.2
            elif length > 10:
                score.language_score = 0.1

        # -------------------------------
        # 4. Confidence Calibration (0.2)
        # -------------------------------
        if response.diagnosis:
            conf = response.diagnosis.confidence

            if score.disease_score >= 0.4 and conf >= 0.7:
                score.treatment_score = 0.2
            elif conf >= 0.5:
                score.treatment_score = 0.1

        # -------------------------------
        # 🔥 Anti-Hacking Rule
        # -------------------------------
        if score.disease_score == 0:
            score.treatment_score = 0.0

        # -------------------------------
        # Total Score
        # -------------------------------
        score.total_score = round(
            score.disease_score +
            score.severity_score +
            score.language_score +
            score.treatment_score,
            2
        )

        return score

    def generate_feedback(self, state: FarmerState, response: AgentResponse, score: RewardBreakdown) -> str:
        feedback_parts = []

        if score.disease_score < 0.4:
            feedback_parts.append("Improve disease identification accuracy")

        if score.severity_score == 0:
            feedback_parts.append("Provide valid severity (low/medium/high)")

        if score.language_score < 0.2:
            feedback_parts.append("Give more detailed explanation")

        if score.treatment_score < 0.2:
            feedback_parts.append("Confidence does not match accuracy")

        if not feedback_parts:
            return "Excellent decision. High-quality output."

        return " | ".join(feedback_parts)

    def _get_expected_disease(self, crop: str) -> str:
        mapping = {
            "rice": "bacterial leaf blight",
            "wheat": "rust",
            "tomato": "nutrient deficiency"
        }

        return mapping.get(crop.lower(), "unknown")