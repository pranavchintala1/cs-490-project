from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import uuid
from db.models import SKILLS_COLLECTION

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic models ---
class Skill(BaseModel):
    user_id: str
    name: str
    category: str
    proficiency: str
    position: Optional[int] = None

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    proficiency: Optional[str] = None
    position: Optional[int] = None

# --- Serializer ---
def skill_serializer(skill_doc):
    return {
        "id": skill_doc["_id"],  # string ID
        "user_id": skill_doc["user_id"],
        "name": skill_doc["name"],
        "category": skill_doc["category"],
        "proficiency": skill_doc["proficiency"],
        "position": skill_doc.get("position", 0),
    }

# --- Routes ---
@app.get("/")
def get_skills(user_id: str = Query("temp_user")):
    skills = SKILLS_COLLECTION.find({"user_id": user_id}).sort("position", 1)
    return [skill_serializer(s) for s in skills]

@app.post("/")
def add_skill(skill: Skill):
    existing = SKILLS_COLLECTION.find_one({
        "user_id": skill.user_id,
        "name": {"$regex": f"^{skill.name}$", "$options": "i"},
        "category": skill.category
    })
    if existing:
        raise HTTPException(status_code=400, detail="Duplicate skill in same category")

    last = list(SKILLS_COLLECTION.find({"user_id": skill.user_id}).sort("position", -1).limit(1))
    position = last[0]["position"] + 1 if last else 0

    doc_id = str(uuid.uuid4())
    doc = skill.dict()
    doc["_id"] = doc_id
    doc["position"] = position

    SKILLS_COLLECTION.insert_one(doc)
    return skill_serializer(doc)

@app.put("/{skill_id}")
def update_skill(skill_id: str, skill: SkillUpdate, user_id: str = Query(...)):
    update_data = {k: v for k, v in skill.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = SKILLS_COLLECTION.update_one(
        {"_id": skill_id, "user_id": user_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Skill not found")

    updated = SKILLS_COLLECTION.find_one({"_id": skill_id})
    return skill_serializer(updated)

@app.delete("/{skill_id}")
def delete_skill(skill_id: str, user_id: str = Query(...)):
    result = SKILLS_COLLECTION.delete_one({"_id": skill_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Skill not found")

    remaining = list(SKILLS_COLLECTION.find({"user_id": user_id}).sort("position", 1))
    for i, s in enumerate(remaining):
        SKILLS_COLLECTION.update_one({"_id": s["_id"]}, {"$set": {"position": i}})

    return {"message": "Skill removed"}
