from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any
from datetime import datetime, timezone
from pathlib import Path
import uuid

from db.clients import get_db            # your Motor client factory
from db.user import profiles_coll        # NEW: pull collection via db.user

app = APIRouter()
UPLOAD_DIR = Path("uploads/profile_pics")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# ---------- Schemas ----------
class ProfileBase(BaseModel):
    full_name: str = Field(default="", max_length=200)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default="", max_length=40)
    location: Optional[str] = Field(default="", max_length=200)
    headline: Optional[str] = Field(default="", max_length=200)
    industry: Optional[str] = Field(default="", max_length=120)
    experience_level: Optional[str] = None  # Entry/Mid/Senior/Executive
    bio: Optional[str] = Field(default="", max_length=500)

class ProfileUpdate(ProfileBase):
    pass

class ProfileOut(ProfileBase):
    user_id: str
    profile_picture: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# ---------- Serializer ----------
def _iso(v: Any) -> Any:
    return v.isoformat() if isinstance(v, datetime) else v

def profile_serializer(doc: dict[str, Any]) -> dict[str, Any]:
    if not doc:
        return doc
    d = dict(doc)
    d.pop("_id", None)
    d.setdefault("full_name", "")
    d.setdefault("phone", "")
    d.setdefault("location", "")
    d.setdefault("headline", "")
    d.setdefault("industry", "")
    d.setdefault("experience_level", None)
    d.setdefault("bio", "")
    for k in ("created_at", "updated_at"):
        if k in d and d[k] is not None:
            d[k] = _iso(d[k])
    return d

# ---------- Routes ----------
@app.get("/me", response_model=ProfileOut)
async def get_me(user_id: str = Query("temp_user"), db=Depends(get_db)):
    coll = profiles_coll(db)
    doc = await coll.find_one({"user_id": user_id})
    if not doc:
        now = datetime.now(timezone.utc)
        doc = {
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
            "created_at": now,
            "updated_at": now,
        }
        await coll.insert_one(doc)
    return profile_serializer(doc)

@app.put("/me", response_model=ProfileOut)
async def update_me(
    body: ProfileUpdate,
    user_id: str = Query("temp_user"),
    db=Depends(get_db),
):
    coll = profiles_coll(db)
    patch = {k: v for k, v in body.model_dump().items()}
    patch["updated_at"] = datetime.now(timezone.utc)

    res = await coll.find_one_and_update(
        {"user_id": user_id},
        {"$set": patch, "$setOnInsert": {"created_at": datetime.now(timezone.utc), "user_id": user_id}},
        upsert=True,
        return_document=True,
    )
    if not res:
        res = await coll.find_one({"user_id": user_id})
    return profile_serializer(res)

@app.post("/upload-profile-picture", response_model=ProfileOut)
async def upload_profile_picture(
    file: UploadFile = File(...),
    user_id: str = Query("temp_user"),
    db=Depends(get_db),
):
    # Save file
    ext = Path(file.filename).suffix.lower() or ".bin"
    safe_name = f"{user_id}_{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / safe_name
    with dest.open("wb") as f:
        f.write(await file.read())

    # Update doc
    coll = profiles_coll(db)
    patch = {"profile_picture": str(dest.as_posix()), "updated_at": datetime.now(timezone.utc)}
    res = await coll.find_one_and_update(
        {"user_id": user_id},
        {"$set": patch, "$setOnInsert": {"created_at": datetime.now(timezone.utc), "user_id": user_id}},
        upsert=True,
        return_document=True,
    )
    if not res:
        res = await coll.find_one({"user_id": user_id})
    return profile_serializer(res)
