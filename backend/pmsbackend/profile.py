# pmsbackend/profile.py
from fastapi import APIRouter, HTTPException, Query, Depends, UploadFile, File
from typing import Optional, List
from pydantic import BaseModel, EmailStr
import uuid, os
from db.clients import get_db
from db.user import profiles_coll  # your existing helper

router = APIRouter()

# ----- Schemas -----
class ProfileIn(BaseModel):
    user_id: str
    full_name: str = ""
    email: Optional[EmailStr] = None
    phone: str = ""
    location: str = ""
    headline: str = ""
    industry: str = ""
    experience_level: Optional[str] = None
    bio: str = ""
    profile_picture: Optional[str] = None

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    industry: Optional[str] = None
    experience_level: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None

# ----- Serializer -----
def profile_serializer(doc: dict) -> dict:
    return {
        "id": doc["_id"],
        "user_id": doc["user_id"],
        "full_name": doc.get("full_name", ""),
        "email": doc.get("email"),
        "phone": doc.get("phone", ""),
        "location": doc.get("location", ""),
        "headline": doc.get("headline", ""),
        "industry": doc.get("industry", ""),
        "experience_level": doc.get("experience_level"),
        "bio": doc.get("bio", ""),
        "profile_picture": doc.get("profile_picture"),
    }

# ----- Routes (Education-style) -----
@router.get("/", response_model=dict)
async def get_profile(user_id: str = Query("temp_user"), db=Depends(get_db)):
    coll = profiles_coll(db)
    doc = await coll.find_one({"user_id": user_id})
    if not doc:
        # create an empty profile on first read (handy for FE)
        doc = {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "full_name": "",
            "email": None,
            "phone": "",
            "location": "",
            "headline": "",
            "industry": "",
            "experience_level": None,
            "bio": "",
            "profile_picture": None,
        }
        await coll.insert_one(doc)
    return profile_serializer(doc)

@router.post("/", response_model=dict, status_code=201)
async def create_profile(entry: ProfileIn, db=Depends(get_db)):
    coll = profiles_coll(db)
    existing = await coll.find_one({"user_id": entry.user_id})
    if existing:
        raise HTTPException(status_code=409, detail="Profile already exists")
    doc = entry.model_dump()
    doc["_id"] = str(uuid.uuid4())
    await coll.insert_one(doc)
    return profile_serializer(doc)

@router.put("/{profile_id}/", response_model=dict)
async def update_profile(profile_id: str, user_id: str = Query(...), entry: ProfileUpdate = None, db=Depends(get_db)):
    coll = profiles_coll(db)
    update_data = {k: v for k, v in (entry.model_dump() if entry else {}).items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = await coll.update_one({"_id": profile_id, "user_id": user_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")

    updated = await coll.find_one({"_id": profile_id})
    return profile_serializer(updated)

@router.delete("/{profile_id}/", status_code=200)
async def delete_profile(profile_id: str, user_id: str = Query(...), db=Depends(get_db)):
    coll = profiles_coll(db)
    result = await coll.delete_one({"_id": profile_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"message": "Profile removed"}

# ----- Optional: picture upload, returns URL -----
UPLOAD_DIR = os.path.join("uploads", "profile")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-profile-picture", response_model=dict)
async def upload_profile_picture(user_id: str = Query(...), file: UploadFile = File(...), db=Depends(get_db)):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    ext = os.path.splitext(file.filename or "")[1] or ".png"
    fname = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, fname)
    with open(path, "wb") as f:
        f.write(await file.read())

    coll = profiles_coll(db)
    await coll.update_one({"user_id": user_id}, {"$set": {"profile_picture": f"/uploads/profile/{fname}"}})
    updated = await coll.find_one({"user_id": user_id})
    return profile_serializer(updated)
