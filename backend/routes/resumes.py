from fastapi import APIRouter, HTTPException, Depends
from pymongo.errors import DuplicateKeyError

from mongo.resumes_dao import resumes_dao
from sessions.session_authorizer import authorize
from schema.Resume import Resume

resumes_router = APIRouter(prefix = "/resumes")

@resumes_router.post("", tags = ["resumes"])
async def add_resume(resume: Resume, uuid: str = Depends(authorize)):
    try:
        model = resume.model_dump()

        model["uuid"] = uuid
        result = await resumes_dao.add_resume(model)
    except DuplicateKeyError:
        raise HTTPException(400, "Resume already exists") # FIXME: redundant since keys are generated uniquely?
    except Exception as e:
        raise HTTPException(500, "Encountered internal server error")
    
    return {"detail": "Sucessfully added resume", "resume_id": result}

@resumes_router.get("", tags = ["resumes"])
async def get_resume(resume_id: str, uuid: str = Depends(authorize)):
    try:
        result = await resumes_dao.get_resume(resume_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    if result:
        result["_id"] = str(result["_id"])
        return result
    else:
        raise HTTPException(400, "Resume not found")

@resumes_router.get("/me", tags = ["resumes"])
async def get_all_resumes(uuid: str = Depends(authorize)):
    try:
        results = await resumes_dao.get_all_resumes(uuid)
        # NOTE: do not raise http exception for empty resumes, as it can lead to inconsistent behavior on the frontend
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    return results

@resumes_router.put("", tags = ["resumes"])
async def update_resume(resume_id: str, resume: Resume, uuid: str = Depends(authorize)):    
    try:
        model = resume.model_dump(exclude_unset = True)
        updated = await resumes_dao.update_resume(resume_id, model)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    if updated == 0:
        raise HTTPException(400, "Resume not found")
    else:
        return {"detail": "Successfully updated resume"}
    
@resumes_router.delete("", tags = ["resumes"])
async def delete_resume(resume_id: str, uuid: str = Depends(authorize)):
    try:
        deleted = await resumes_dao.delete_resume(resume_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if deleted == 0:
        raise HTTPException(400, "Resume not found")
    else:
        return {"detail": "Successfully deleted resume"}
    