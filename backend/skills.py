# backend/skills.py
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

class Skill(BaseModel):
    id: int | None = None
    name: str
    category: str
    proficiency: str
    position: Optional[int] = None  # New position field

skills_db: List[Skill] = []
next_id = 1

# --- Routes --- #

@app.get("/")  # GET /skills
def get_skills():
    return sorted(skills_db, key=lambda s: s.position or 0)

@app.post("/")  # POST /skills
def add_skill(skill: Skill):
    global next_id
    if any(s.name.lower() == skill.name.lower() for s in skills_db):
        raise HTTPException(status_code=400, detail="Duplicate skill")
    skill.id = next_id
    skill.position = len(skills_db)
    next_id += 1
    skills_db.append(skill)
    return skill

@app.put("/{skill_id}")
def update_skill(skill_id: int, skill: Skill):
    for s in skills_db:
        if s.id == skill_id:
            s.proficiency = skill.proficiency
            s.category = skill.category
            return s
    raise HTTPException(status_code=404, detail="Skill not found")

@app.delete("/{skill_id}")
def delete_skill(skill_id: int):
    for s in skills_db:
        if s.id == skill_id:
            skills_db.remove(s)
            for i, skill in enumerate(skills_db):
                skill.position = i
            return {"message": "Skill removed"}
    raise HTTPException(status_code=404, detail="Skill not found")

@app.put("/reorder")
def reorder_skills(new_order: List[Skill]):
    global skills_db
    for i, skill in enumerate(new_order):
        for s in skills_db:
            if s.id == skill.id:
                s.position = i
    return {"message": "Skills reordered"}
