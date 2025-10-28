from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
from bson import ObjectId  # ✅ Required for Mongo IDs

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
        "id": str(skill_doc["_id"]),
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
    try:
        # ✅ Duplicate check matches frontend (name + category)
        existing = SKILLS_COLLECTION.find_one({
            "user_id": skill.user_id,
            "name": {"$regex": f"^{skill.name}$", "$options": "i"},
            "category": skill.category
        })
        if existing:
            raise HTTPException(status_code=400, detail="Duplicate skill in same category")

        skill_doc = skill.dict()
        last_skill = list(SKILLS_COLLECTION.find({"user_id": skill.user_id}).sort("position", -1).limit(1))
        skill_doc["position"] = last_skill[0]["position"] + 1 if last_skill else 0

        result = SKILLS_COLLECTION.insert_one(skill_doc)
        inserted = SKILLS_COLLECTION.find_one({"_id": result.inserted_id})
        return skill_serializer(inserted)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/{skill_id}")
def update_skill(skill_id: str, skill: SkillUpdate, user_id: str = Query(...)):
    try:
        update_data = {k: v for k, v in skill.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")

        # ✅ Convert to ObjectId
        result = SKILLS_COLLECTION.update_one(
            {"_id": ObjectId(skill_id), "user_id": user_id},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Skill not found")

        updated = SKILLS_COLLECTION.find_one({"_id": ObjectId(skill_id)})
        return skill_serializer(updated)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/{skill_id}")
def delete_skill(skill_id: str, user_id: str = Query(...)):
    try:
        result = SKILLS_COLLECTION.delete_one({"_id": ObjectId(skill_id), "user_id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Skill not found")

        remaining = list(SKILLS_COLLECTION.find({"user_id": user_id}).sort("position", 1))
        for i, s in enumerate(remaining):
            SKILLS_COLLECTION.update_one({"_id": s["_id"]}, {"$set": {"position": i}})

        return {"message": "Skill removed"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
