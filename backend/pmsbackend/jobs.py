# pmsbackend/jobs.py
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from pydantic import BaseModel
import uuid
from db.clients import get_db
from db.user import jobs_coll  # your existing helper returns the Mongo collection

router = APIRouter()

# ----- Schemas -----
class JobIn(BaseModel):
    user_id: str
    job_title: str
    company_name: str
    location: str = ""
    start_date: Optional[str] = None   # "YYYY-MM-DD"
    end_date: Optional[str] = None     # null if current
    current: bool = False
    description: str = ""
    position: Optional[int] = 0

class JobUpdate(BaseModel):
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    current: Optional[bool] = None
    description: Optional[str] = None
    position: Optional[int] = None

# ----- Serializer (Education-style) -----
def job_serializer(doc: dict) -> dict:
    return {
        "id": doc["_id"],
        "user_id": doc["user_id"],
        "job_title": doc["job_title"],
        "company_name": doc.get("company_name", ""),
        "location": doc.get("location", ""),
        "start_date": doc.get("start_date"),
        "end_date": doc.get("end_date"),
        "current": doc.get("current", False),
        "description": doc.get("description", ""),
        "position": doc.get("position", 0),
    }

# ----- Routes (match Education pattern) -----
@router.get("/", response_model=List[dict])
async def list_jobs(user_id: str = Query("temp_user"), db=Depends(get_db)):
    coll = jobs_coll(db)
    entries = coll.find({"user_id": user_id}).sort("position", 1)
    return [job_serializer(e) for e in await entries.to_list(length=10000)]

@router.post("/", response_model=dict, status_code=201)
async def add_job(entry: JobIn, db=Depends(get_db)):
    coll = jobs_coll(db)

    last = await coll.find({"user_id": entry.user_id}).sort("position", -1).limit(1).to_list(length=1)
    entry.position = (last[0]["position"] + 1) if last else 0

    doc = entry.model_dump()
    doc["_id"] = str(uuid.uuid4())
    await coll.insert_one(doc)
    return job_serializer(doc)

@router.put("/{entry_id}/", response_model=dict)
async def update_job(entry_id: str, entry: JobUpdate, user_id: str = Query(...), db=Depends(get_db)):
    coll = jobs_coll(db)
    update_data = {k: v for k, v in entry.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = await coll.update_one({"_id": entry_id, "user_id": user_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")

    updated = await coll.find_one({"_id": entry_id})
    return job_serializer(updated)

@router.delete("/{entry_id}/", status_code=200)
async def delete_job(entry_id: str, user_id: str = Query(...), db=Depends(get_db)):
    coll = jobs_coll(db)
    result = await coll.delete_one({"_id": entry_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")

    # reindex positions like Education
    remaining = await coll.find({"user_id": user_id}).sort("position", 1).to_list(length=10000)
    for i, e in enumerate(remaining):
        await coll.update_one({"_id": e["_id"]}, {"$set": {"position": i}})
    return {"message": "Entry removed"}
