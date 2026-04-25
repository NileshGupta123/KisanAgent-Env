from fastapi import FastAPI
from dotenv import load_dotenv

from server.env import KisanAgentEnv

# Load env
load_dotenv(override=False)

app = FastAPI(title="KisanAgent OpenEnv")

env = KisanAgentEnv()


@app.get("/")
def root():
    return {"message": "KisanAgent Environment Running"}


# -------------------------------
# RESET
# -------------------------------
@app.post("/reset")
def reset_env(scenario: int = 0):
    result = env.reset(scenario)

    return {
        "status": "reset",
        "state": result["state"]
    }


# -------------------------------
# STEP
# -------------------------------
@app.post("/step")
def step_env():
    result = env.step()

    return {
        "state": result.state,
        "action": result.action,
        "reward": result.reward,
        "done": result.done,
        "feedback": result.feedback
    }


# -------------------------------
# STATE (NEW)
# -------------------------------
@app.post("/state")
def get_state():
    if env.state is None:
        return {"error": "Environment not initialized. Call /reset first."}

    return {"state": env.state}


# -------------------------------
# HEALTH CHECK (NEW)
# -------------------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "KisanAgent",
        "version": "1.0"
    }