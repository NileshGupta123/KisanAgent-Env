from server.models import FarmerState

SCENARIOS = [
    FarmerState(
        zone="North India (Punjab)",
        crop="Wheat",
        symptoms=["Yellowing of leaves", "Brown rust spots", "Stunted growth"],
        soil_type="Alluvial",
        rainfall_mm=120.5,
        temperature_c=22.4,
        humidity=65.0
    ),
    FarmerState(
        zone="South India (Andhra Pradesh)",
        crop="Rice",
        symptoms=["Wilting", "Brown spots on grain", "Root decay"],
        soil_type="Clayey",
        rainfall_mm=450.0,
        temperature_c=30.2,
        humidity=85.0
    ),
    FarmerState(
        zone="West India (Maharashtra)",
        crop="Cotton",
        symptoms=["Leaf curling", "White spots", "Premature ball dropping"],
        soil_type="Black Soil",
        rainfall_mm=250.0,
        temperature_c=28.5,
        humidity=70.0
    )
]

def get_scenario(index: int = 0):
    if 0 <= index < len(SCENARIOS):
        return SCENARIOS[index]
    return SCENARIOS[0]
