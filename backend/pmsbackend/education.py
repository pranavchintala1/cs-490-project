# backend/education.py
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

class Education(BaseModel):
    id: int | None = None
    institution: str
    degree: str
    field_of_study: str
    graduation_date: Optional[str] = None
    currently_enrolled: bool = False
    gpa: Optional[float] = None
    gpa_private: bool = False
    achievements: Optional[str] = None

edu_db: List[Education] = []
next_id = 1

# --- Routes --- #

@app.get("/")  # GET /education
def get_education():
    # Reverse chronological order (currently_enrolled first, then by graduation_date)
    return sorted(
        edu_db,
        key=lambda e: (
            not e.currently_enrolled,
            e.graduation_date or "9999-12-31"
        )
    )

@app.post("/")  # POST /education
def add_education(entry: Education):
    global next_id
    entry.id = next_id
    next_id += 1
    edu_db.append(entry)
    return entry

@app.put("/{entry_id}")  # Update an entry
def update_education(entry_id: int, entry: Education):
    for e in edu_db:
        if e.id == entry_id:
            e.institution = entry.institution
            e.degree = entry.degree
            e.field_of_study = entry.field_of_study
            e.graduation_date = entry.graduation_date
            e.currently_enrolled = entry.currently_enrolled
            e.gpa = entry.gpa
            e.gpa_private = entry.gpa_private
            e.achievements = entry.achievements
            return e
    raise HTTPException(status_code=404, detail="Education entry not found")

@app.delete("/{entry_id}")
def delete_education(entry_id: int):
    for e in edu_db:
        if e.id == entry_id:
            edu_db.remove(e)
            return {"message": "Entry removed"}
    raise HTTPException(status_code=404, detail="Education entry not found")
