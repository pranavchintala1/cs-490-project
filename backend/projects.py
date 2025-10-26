from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Project(BaseModel):
    id: int | None = None
    name: str
    description: str
    role: str
    start_date: str
    end_date: str
    technologies: Optional[str] = None
    url: Optional[str] = None
    team_size: Optional[int] = None
    achievements: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = "Planned"  # Completed, Ongoing, Planned

projects_db: List[Project] = []
next_id = 1

# --- Routes --- #

@app.get("/")
def get_projects():
    return projects_db

@app.post("/")
def add_project(project: Project):
    global next_id
    project.id = next_id
    next_id += 1
    projects_db.append(project)
    return project

@app.put("/{project_id}")
def update_project(project_id: int, project: Project):
    for p in projects_db:
        if p.id == project_id:
            for field in project.__fields_set__:
                setattr(p, field, getattr(project, field))
            return p
    raise HTTPException(status_code=404, detail="Project not found")

@app.delete("/{project_id}")
def delete_project(project_id: int):
    for p in projects_db:
        if p.id == project_id:
            projects_db.remove(p)
            return {"message": "Project removed"}
    raise HTTPException(status_code=404, detail="Project not found")
