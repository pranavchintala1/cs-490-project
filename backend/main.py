# main.py
from fastapi import FastAPI
from fastapi.routing import APIRoute
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from pmsbackend.jobs import router as jobs_router
from pmsbackend.profile import router as profile_router
from dotenv import load_dotenv
load_dotenv() 

app = FastAPI()

# CORS for CRA dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# static hosting for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# mount routers (Education-style paths)
app.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
app.include_router(profile_router, prefix="/profile", tags=["profile"])

# route lister (debug)
@app.get("/_routes")
def routes():
    return sorted(
        [{"path": r.path, "methods": sorted(list(r.methods))} for r in app.routes if isinstance(r, APIRoute)],
        key=lambda x: x["path"],
    )
