from fastapi import FastAPI, Form, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from db.models import PROJECTS_COLLECTION
import uuid
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def project_serializer(p):
    media_files = [
        {
            "filename": f["filename"],
            "content_type": f.get("content_type"),
            "data": base64.b64encode(f["content"]).decode("utf-8")
        }
        for f in p.get("media_files", [])
    ]
    
    return {
        "id": p["_id"],
        "user_id": p["user_id"],
        "name": p["name"],
        "description": p["description"],
        "role": p["role"],
        "start_date": p["start_date"],
        "end_date": p.get("end_date"),
        "technologies": p.get("technologies", []),
        "project_url": p.get("project_url"),
        "team_size": p.get("team_size"),
        "achievements": p.get("achievements"),
        "industry": p.get("industry"),
        "status": p.get("status", "Planned"),
        "position": p.get("position", 0),
        "media_files": media_files,
    }

@app.get("/")
def get_projects(user_id: str = Query("temp_user")):
    projects = list(PROJECTS_COLLECTION.find({"user_id": user_id}).sort("position", 1))
    return [project_serializer(p) for p in projects]

@app.post("/")
async def add_project(
    user_id: str = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    role: str = Form(...),
    start_date: str = Form(...),
    end_date: Optional[str] = Form(None),
    technologies: Optional[str] = Form(None),
    project_url: Optional[str] = Form(None),
    team_size: Optional[int] = Form(None),
    achievements: Optional[str] = Form(None),
    industry: Optional[str] = Form(None),
    status: Optional[str] = Form("Planned"),
    media_files: Optional[List[UploadFile]] = File(None),
):
    last = list(PROJECTS_COLLECTION.find({"user_id": user_id}).sort("position", -1).limit(1))
    position = last[0]["position"] + 1 if last else 0

    files_data = []
    if media_files:
        for f in media_files:
            content = await f.read()
            files_data.append({
                "filename": f.filename,
                "content": content,
                "content_type": f.content_type
            })

    doc_id = str(uuid.uuid4())
    doc = {
        "_id": doc_id,
        "user_id": user_id,
        "name": name,
        "description": description,
        "role": role,
        "start_date": start_date,
        "end_date": end_date,
        "technologies": technologies.split(",") if technologies else [],
        "project_url": project_url,
        "team_size": team_size,
        "achievements": achievements,
        "industry": industry,
        "status": status,
        "position": position,
        "media_files": files_data,
    }

    PROJECTS_COLLECTION.insert_one(doc)
    return project_serializer(doc)

@app.delete("/{project_id}")
def delete_project(project_id: str, user_id: str = Query(...)):
    result = PROJECTS_COLLECTION.delete_one({"_id": project_id, "user_id": user_id})
    if result.deleted_count == 0:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Project not found")

    remaining = list(PROJECTS_COLLECTION.find({"user_id": user_id}).sort("position", 1))
    for i, p in enumerate(remaining):
        PROJECTS_COLLECTION.update_one({"_id": p["_id"]}, {"$set": {"position": i}})

    return {"message": "Project deleted successfully"}
