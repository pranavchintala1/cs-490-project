from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from pmsbackend.skills import app as skills_app
from pmsbackend.education import app as education_app
from pmsbackend.certifications import app as certifications_app
from pmsbackend.projects import app as projects_app

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
def ping():
    return {"success": True, "message": "API is alive!"}

# Mount sub-apps
app.mount("/skills", skills_app)
app.mount("/education", education_app)
app.mount("/certifications", certifications_app)
app.mount("/projects", projects_app)
