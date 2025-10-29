from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import uuid
from db.models import EDUCATION_COLLECTION

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Education(BaseModel):
    user_id: str
    institution: str
    degree: str
    field_of_study: str
    graduation_date: Optional[str] = None
    currently_enrolled: bool = False
    gpa: Optional[float] = None
    gpa_private: bool = False
    achievements: Optional[str] = None
    position: Optional[int] = 0

class EducationUpdate(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    graduation_date: Optional[str] = None
    currently_enrolled: Optional[bool] = None
    gpa: Optional[float] = None
    gpa_private: Optional[bool] = None
    achievements: Optional[str] = None
    position: Optional[int] = None

def education_serializer(entry):
    return {
        "id": entry["_id"],
        "user_id": entry["user_id"],
        "institution": entry["institution"],
        "degree": entry["degree"],
        "field_of_study": entry["field_of_study"],
        "graduation_date": entry.get("graduation_date"),
        "currently_enrolled": entry.get("currently_enrolled", False),
        "gpa": entry.get("gpa"),
        "gpa_private": entry.get("gpa_private", False),
        "achievements": entry.get("achievements"),
        "position": entry.get("position", 0),
    }

@app.get("/")
def get_education(user_id: str = Query("temp_user")):
    entries = list(EDUCATION_COLLECTION.find({"user_id": user_id}).sort("position", 1))
    return [education_serializer(e) for e in entries]

@app.post("/")
def add_education(entry: Education):
    last = list(EDUCATION_COLLECTION.find({"user_id": entry.user_id}).sort("position", -1).limit(1))
    entry.position = last[0]["position"] + 1 if last else 0

    doc = entry.dict()
    doc["_id"] = str(uuid.uuid4())
    EDUCATION_COLLECTION.insert_one(doc)
    return education_serializer(doc)

@app.put("/{entry_id}/")
def update_education(entry_id: str, entry: EducationUpdate, user_id: str = Query(...)):
    update_data = {k: v for k, v in entry.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = EDUCATION_COLLECTION.update_one({"_id": entry_id, "user_id": user_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Education entry not found")

    updated = EDUCATION_COLLECTION.find_one({"_id": entry_id})
    return education_serializer(updated)

@app.delete("/{entry_id}/")
def delete_education(entry_id: str, user_id: str = Query(...)):
    result = EDUCATION_COLLECTION.delete_one({"_id": entry_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Education entry not found")

    remaining = list(EDUCATION_COLLECTION.find({"user_id": user_id}).sort("position", 1))
    for i, e in enumerate(remaining):
        EDUCATION_COLLECTION.update_one({"_id": e["_id"]}, {"$set": {"position": i}})

    return {"message": "Entry removed"}
