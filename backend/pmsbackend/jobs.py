from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import date, datetime, timezone
from uuid import uuid4

from db.clients import get_db       
from db.user import jobs_coll          

app = APIRouter()

# ---------- Schemas ----------
class JobBase(BaseModel):
    job_title: str = Field(min_length=1, max_length=200)
    company_name: str = Field(min_length=1, max_length=200)
    location: Optional[str] = Field(default="", max_length=200)
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = Field(default="", max_length=1000)
    current: bool = False

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

# ---------- Serializers ----------
def _iso(v: Any) -> Any:
    if isinstance(v, (date, datetime)):
        return v.isoformat()
    return v

def job_serializer(doc: dict[str, Any]) -> dict[str, Any]:
    if not doc:
        return doc
    d = dict(doc)
    d.pop("_id", None)
    d.setdefault("location", "")
    d.setdefault("description", "")
    d.setdefault("current", False)
    for k in ("start_date", "end_date", "created_at", "updated_at"):
        if k in d and d[k] is not None:
            d[k] = _iso(d[k])
    return d

def jobs_serializer(docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [job_serializer(x) for x in docs]

# ---------- Helpers ----------
def _validate_dates(j: JobBase):
    if (not j.current) and j.end_date and j.start_date > j.end_date:
        raise HTTPException(status_code=400, detail="start_date must be <= end_date")

# ---------- Routes ----------
@app.get("/", response_model=list[JobOut])
async def list_jobs(user_id: str = Query("temp_user"), db=Depends(get_db)):
    coll = jobs_coll(db)
    cursor = coll.find({"user_id": user_id}).sort("start_date", -1)
    docs = await cursor.to_list(length=200)
    return jobs_serializer(docs)

@app.post("/", response_model=JobOut, status_code=201)
async def create_job(user_id: str = Query("temp_user"), body: JobCreate = ..., db=Depends(get_db)):
    _validate_dates(body)
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": user_id,
        "job_id": str(uuid4()),
        **body.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    await jobs_coll(db).insert_one(doc)
    return job_serializer(doc)

@app.get("/{job_id}", response_model=JobOut)
async def get_job(job_id: str, user_id: str = Query("temp_user"), db=Depends(get_db)):
    doc = await jobs_coll(db).find_one({"user_id": user_id, "job_id": job_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")
    return job_serializer(doc)

@app.put("/{job_id}", response_model=JobOut)
async def update_job(job_id: str, user_id: str = Query("temp_user"), body: JobUpdate = ..., db=Depends(get_db)):
    coll = jobs_coll(db)
    patch = {k: v for k, v in body.model_dump(exclude_none=True).items()}

    if {"start_date", "end_date", "current"} & set(patch.keys()):
        cur = await coll.find_one({"user_id": user_id, "job_id": job_id})
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

    patch["updated_at"] = datetime.now(timezone.utc)
    res = await coll.find_one_and_update(
        {"user_id": user_id, "job_id": job_id},
        {"$set": patch},
        return_document=True,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Job not found")
    return job_serializer(res)

@app.delete("/{job_id}", status_code=204)
async def delete_job(job_id: str, user_id: str = Query("temp_user"), db=Depends(get_db)):
    res = await jobs_coll(db).delete_one({"user_id": user_id, "job_id": job_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
