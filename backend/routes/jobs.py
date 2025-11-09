from fastapi import APIRouter, HTTPException, Depends
from pymongo.errors import DuplicateKeyError

from backend.mongo.jobs_dao import jobs_dao
from sessions.session_authorizer import authorize
from schema import Job

jobs_router = APIRouter(prefix = "/jobs")

@jobs_router.post("", tags = ["jobs"])
async def add_job(job: Job, uuid: str = Depends(authorize)):
    try:
        model = job.model_dump()
        model["uuid"] = uuid
        result = await jobs_dao.add_job(model)
    except DuplicateKeyError:
        raise HTTPException(400, "Job already exists") # FIXME: redundant since keys are generated uniquely?
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal server error")
    
    return {"detail": "Sucessfully added job", "job_id": result}

@jobs_router.get("", tags = ["jobs"])
async def get_job(job_id: str, uuid: str = Depends(authorize)):
    try:
        result = await jobs_dao.get_job(job_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    if result:
        result["_id"] = str(result["_id"])
        return result
    else:
        raise HTTPException(400, "Job not found")

@jobs_router.get("/me", tags = ["jobs"])
async def get_all_jobs(uuid: str = Depends(authorize)):
    try:
        results = await jobs_dao.get_all_jobs(uuid)
        # NOTE: do not raise http exception for empty jobs, as it can lead to inconsistent behavior on the frontend
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    return results

@jobs_router.put("", tags = ["jobs"])
async def update_job(job_id: str, job: Job, uuid: str = Depends(authorize)):    
    try:
        model = job.model_dump(exclude_unset = True)
        updated = await jobs_dao.update_job(job_id, model)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    if updated == 0:
        raise HTTPException(400, "Job not found")
    else:
        return {"detail": "Successfully updated job"}
    
@jobs_router.delete("", tags = ["jobs"])
async def delete_job(job_id: str, uuid: str = Depends(authorize)):
    try:
        deleted = await jobs_dao.delete_job(job_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if deleted == 0:
        raise HTTPException(400, "Job not found")
    else:
        return {"detail": "Successfully deleted job"}
    