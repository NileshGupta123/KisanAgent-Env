from server.models import FarmerState

# 🔥 Raw scenarios (Claude dataset)
from typing import Dict

SCENARIOS: Dict = {
    # Only crop-disease used for now (safe)
    "cd_001": {
        "crop": "wheat",
        "zone": "Punjab",
        "symptoms": [
            "yellow leaves from tips",
            "orange-brown pustules under leaves"
        ],
        "soil_type": "loamy",
        "rainfall_mm": 3 * 10,   # approx
        "temperature_c": 18,
        "humidity": 70
    },
    "cd_002": {
        "crop": "tomato",
        "zone": "Maharashtra",
        "symptoms": [
            "white powder under leaves",
            "yellow patches"
        ],
        "soil_type": "sandy loam",
        "rainfall_mm": 0,
        "temperature_c": 32,
        "humidity": 50
    },
    "cd_003": {
        "crop": "rice",
        "zone": "Karnataka",
        "symptoms": [
            "water soaked lesions",
            "stem rot smell"
        ],
        "soil_type": "clay",
        "rainfall_mm": 200,
        "temperature_c": 28,
        "humidity": 85
    }
}


def get_scenario(index: int) -> FarmerState:
    keys = list(SCENARIOS.keys())
    key = keys[index % len(keys)]

    data = SCENARIOS[key]

    return FarmerState(
        zone=data["zone"],
        crop=data["crop"],
        symptoms=data["symptoms"],
        soil_type=data["soil_type"],
        rainfall_mm=data["rainfall_mm"],
        temperature_c=data["temperature_c"],
        humidity=data["humidity"]
    )