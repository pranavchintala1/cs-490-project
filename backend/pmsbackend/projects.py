from fastapi import APIRouter, HTTPException, Form, File, UploadFile
from fastapi.responses import FileResponse
from typing import List, Optional
import shutil
from pathlib import Path
from db.models import PROJECTS_COLLECTION  # your MongoDB collection

app = APIRouter()

UPLOAD_DIR = Path("uploads/projects")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Serializer
def project_serializer(p):
    return {
        "id": str(p["_id"]),  # Directly return string-based ID
        "name": p.get("name"),
        "description": p.get("description"),
        "role": p.get("role"),
        "start_date": p.get("start_date"),
        "end_date": p.get("end_date"),
        "technologies": p.get("technologies"),
        "project_url": p.get("project_url"),
        "team_size": p.get("team_size"),
        "achievements": p.get("achievements"),
        "industry": p.get("industry"),
        "status": p.get("status", "Planned"),
        "media_files": p.get("media_files", []),
    }

# --- Routes --- #
@app.get("/")
def get_projects():
    projects = list(PROJECTS_COLLECTION.find().sort("start_date", -1))
    return [project_serializer(p) for p in projects]

@app.post("/")
def add_project(
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
    media_files: List[UploadFile] = File([]),
):
    uploaded_files = []
    for f in media_files:
        filename = f.filename
        file_path = UPLOAD_DIR / filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(f.file, buffer)
        uploaded_files.append(filename)

    doc = {
        "name": name,
        "description": description,
        "role": role,
        "start_date": start_date,
        "end_date": end_date,
        "technologies": technologies,
        "project_url": project_url,
        "team_size": team_size,
        "achievements": achievements,
        "industry": industry,
        "status": status,
        "media_files": uploaded_files,
    }

    result = PROJECTS_COLLECTION.insert_one(doc)
    doc["_id"] = str(result.inserted_id)  # Ensure ID is a string
    return project_serializer(doc)

@app.delete("/{project_id}")
def delete_project(project_id: str):
    result = PROJECTS_COLLECTION.delete_one({"_id": project_id})  # Use string ID directly
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}

@app.get("/download/{filename}")
def download_media(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type="application/octet-stream", filename=filename)
