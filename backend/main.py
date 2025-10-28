from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from pmsbackend.profile import app as profile_router
from pmsbackend.jobs import app as jobs_router
app = FastAPI(title="ATS API")

# CORS
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
if not origins:
    origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(profile_router, prefix="/profile", tags=["profile"])
app.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
os.makedirs("uploads/profile_pictures", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/ping")
def ping():
    return {"success": True, "message": "API is alive!"}
