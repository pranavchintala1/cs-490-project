from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import uuid
from db.models import PROJECTS_COLLECTION

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Project(BaseModel):
    name: str
    description: str
    role: str
    start_date: str
    end_date: Optional[str] = None
    skills_used: List[str] = []
    team_size: Optional[int] = None
    details: Optional[str] = None
    outcomes: Optional[str] = None
    industry_type: Optional[str] = None
    media_urls: List[str] = []
    status: Optional[str] = "Planned"
    position: Optional[int] = 0
    user_id: str

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    skills_used: Optional[List[str]] = None
    team_size: Optional[int] = None
    details: Optional[str] = None
    outcomes: Optional[str] = None
    industry_type: Optional[str] = None
    media_urls: Optional[List[str]] = None
    status: Optional[str] = None
    position: Optional[int] = None

def project_serializer(p):
    return {
        "id": p["_id"],
        "name": p["name"],
        "description": p["description"],
        "role": p["role"],
        "start_date": p["start_date"],
        "end_date": p.get("end_date"),
        "skills_used": p.get("skills_used", []),
        "team_size": p.get("team_size"),
        "details": p.get("details"),
        "outcomes": p.get("outcomes"),
        "industry_type": p.get("industry_type"),
        "media_urls": p.get("media_urls", []),
        "status": p.get("status", "Planned"),
        "position": p.get("position", 0),
        "user_id": p["user_id"]
    }

@app.get("/projects")
def get_projects(user_id: str = Query("temp_user")):
    projects = list(PROJECTS_COLLECTION.find({"user_id": user_id}).sort("position", 1))
    return [project_serializer(p) for p in projects]

@app.post("/projects")
def add_project(project: Project):
    last = list(PROJECTS_COLLECTION.find({"user_id": project.user_id}).sort("position", -1).limit(1))
    project.position = last[0]["position"] + 1 if last else 0

    doc = project.dict()
    doc["_id"] = str(uuid.uuid4())

    PROJECTS_COLLECTION.insert_one(doc)
    return project_serializer(doc)

@app.put("/projects/{project_id}")
def update_project(project_id: str, project: ProjectUpdate, user_id: str = Query(...)):
    update_data = {k: v for k, v in project.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = PROJECTS_COLLECTION.update_one({"_id": project_id, "user_id": user_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    updated = PROJECTS_COLLECTION.find_one({"_id": project_id})
    return project_serializer(updated)

@app.delete("/projects/{project_id}")
def delete_project(project_id: str, user_id: str = Query(...)):
    result = PROJECTS_COLLECTION.delete_one({"_id": project_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    remaining = list(PROJECTS_COLLECTION.find({"user_id": user_id}).sort("position", 1))
    for i, p in enumerate(remaining):
        PROJECTS_COLLECTION.update_one({"_id": p["_id"]}, {"$set": {"position": i}})

    return {"message": "Project removed"}
