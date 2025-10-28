# backend/pmsbackend/jobs.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from uuid import uuid4

from db.clients import get_db  # your existing Mongo client factory

router = APIRouter()
COLL = "jobs"

# ---------- Schemas (in-file, no separate models/ folder) ----------

class JobBase(BaseModel):
    job_title: str = Field(min_length=1, max_length=200)
    company_name: str = Field(min_length=1, max_length=200)
    location: Optional[str] = Field(default="", max_length=200)
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = Field(default="", max_length=1000)
    current: bool = False  # helper; not in your screenshot but useful

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = Field(default=None, max_length=1000)
    current: Optional[bool] = None

class JobOut(JobBase):
    user_id: str
    job_id: str
    created_at: datetime
    updated_at: datetime

# ---------- Helpers ----------

def _out(d: dict) -> JobOut:
    d = d.copy()
    d.pop("_id", None)
    return JobOut(**d)

def _validate_dates(j: JobBase):
    # If it's not current and end_date exists, ensure start <= end
    if (not j.current) and j.end_date and j.start_date > j.end_date:
        raise HTTPException(status_code=400, detail="start_date must be <= end_date")

# ---------- Routes ----------

@router.get("/", response_model=List[JobOut])
async def list_jobs(user_id: str, db = Depends(get_db)):
    cur = db[COLL].find({"user_id": user_id}).sort("start_date", -1)
    docs = await cur.to_list(length=200)
    return [_out(d) for d in docs]

@router.post("/", response_model=JobOut, status_code=201)
async def create_job(user_id: str, body: JobCreate, db = Depends(get_db)):
    _validate_dates(body)
    now = datetime.utcnow()
    doc = {
        "user_id": user_id,
        "job_id": str(uuid4()),  # string UUID per your spec
        **body.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    await db[COLL].insert_one(doc)
    return _out(doc)

@router.get("/{job_id}", response_model=JobOut)
async def get_job(job_id: str, user_id: str, db = Depends(get_db)):
    d = await db[COLL].find_one({"user_id": user_id, "job_id": job_id})
    if not d:
        raise HTTPException(status_code=404, detail="Job not found")
    return _out(d)

@router.put("/{job_id}", response_model=JobOut)
async def update_job(job_id: str, user_id: str, body: JobUpdate, db = Depends(get_db)):
    patch = {k: v for k, v in body.model_dump(exclude_none=True).items()}

    # If dates/current are changing, validate against merged doc
    if {"start_date", "end_date", "current"} & set(patch.keys()):
        cur = await db[COLL].find_one({"user_id": user_id, "job_id": job_id})
        if not cur:
            raise HTTPException(status_code=404, detail="Job not found")
        merged = {**cur, **patch}
        to_validate = JobCreate(
            job_title=merged["job_title"],
            company_name=merged["company_name"],
            location=merged.get("location", ""),
            start_date=merged["start_date"],
            end_date=merged.get("end_date"),
            description=merged.get("description", ""),
            current=merged.get("current", False),
        )
        _validate_dates(to_validate)

    patch["updated_at"] = datetime.utcnow()
    res = await db[COLL].find_one_and_update(
        {"user_id": user_id, "job_id": job_id},
        {"$set": patch},
        return_document=True,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Job not found")
    return _out(res)

@router.delete("/{job_id}", status_code=204)
async def delete_job(job_id: str, user_id: str, db = Depends(get_db)):
    res = await db[COLL].delete_one({"user_id": user_id, "job_id": job_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
