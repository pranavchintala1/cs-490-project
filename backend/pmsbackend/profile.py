from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
from typing import Optional
from db.clients import get_db
from models.user import UserProfile, UserUpdate
import os

router = APIRouter()

UPLOAD_DIR = Path("uploads/profile_pictures")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/me")
async def profile_get_me(user_id: str, db = Depends(get_db)):
    col = db["user_data"]
    doc = await col.find_one({"user_id": user_id})
    if not doc:
        doc = UserProfile(user_id=user_id).model_dump()
        await col.insert_one(doc)
    doc["_id"] = str(doc.get("_id", "")) if "_id" in doc else ""
    return doc

@router.put("/me")
async def profile_put_me(user_id: str, payload: UserUpdate, db = Depends(get_db)):
    col = db["user_data"]
    update = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if update:
        await col.update_one({"user_id": user_id}, {"$set": update}, upsert=True)
    doc = await col.find_one({"user_id": user_id})
    if not doc:
        raise HTTPException(status_code=500, detail="Upsert failed")
    doc["_id"] = str(doc.get("_id", "")) if "_id" in doc else ""
    return doc

@router.post("/upload-profile-picture")
async def profile_upload_picture(user_id: str, file: UploadFile = File(...), db = Depends(get_db)):
    if file.content_type not in ("image/jpeg", "image/png", "image/gif"):
        raise HTTPException(status_code=400, detail="Invalid image type")
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    ext = ".jpg" if file.content_type == "image/jpeg" else ".png"
    fname = f"{user_id}{ext}"
    outpath = UPLOAD_DIR / fname
    outpath.write_bytes(data)
    col = db["user_data"]
    url = f"/uploads/profile_pictures/{fname}"
    await col.update_one({"user_id": user_id}, {"$set": {"profile_picture": url}}, upsert=True)
    return {"url": url}
