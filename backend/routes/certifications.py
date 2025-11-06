from fastapi import APIRouter, HTTPException, Depends
from pymongo.errors import DuplicateKeyError

from mongo.certification_dao import certifications_dao
from sessions.session_authorizer import authorize
from schema import Certification

certifications_router = APIRouter(prefix = "/certifications")

@certifications_router.post("", tags = ["certifications"])
async def add_cert(cert: Certification, uuid: str = Depends(authorize)):
    try:
        model = cert.model_dump()

        if not model.get("name"):
            raise HTTPException(422, "Certification requires a name")

        model["uuid"] = uuid
        result = await certifications_dao.add_certification(model)
    except DuplicateKeyError:
        raise HTTPException(400, "Certification already exists") # FIXME: redundant since keys are generated uniquely?
    except Exception as e:
        raise HTTPException(500, "Encountered internal server error")
    
    return {"detail": "Sucessfully added certfication", "certification_id": result}

@certifications_router.get("", tags = ["certifications"])
async def get_certification(certification_id: str, uuid: str = Depends(authorize)):
    try:
        result = await certifications_dao.get_certification(certification_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    if result:
        id = result.pop("_id")
        result["_id"] = str(result["_id"])
        return result
    else:
        raise HTTPException(400, "Certification not found")

@certifications_router.get("/me", tags = ["certifications"])
async def get_all_certifications(uuid: str = Depends(authorize)):
    try:
        results = await certifications_dao.get_all_certifications(uuid)
        # NOTE: do not return http exception for empty skills, as it can lead to inconsistent behavior on the frontend
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    return results

@certifications_router.put("", tags = ["certifications"])
async def update_skill(certification_id: str, certification: Certification, uuid: str = Depends(authorize)):    
    try:
        model = certification.model_dump(exclude_unset = True)
        updated = await certifications_dao.update_certification(certification_id, model)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    if updated == 0:
        raise HTTPException(400, "Certification not found")
    else:
        return {"detail": "Successfully updated certification"}
    
@certifications_router.delete("", tags = ["certifications"])
async def delete_skill(certification_id: str, uuid: str = Depends(authorize)):
    try:
        deleted = await certifications_dao.delete_certification(certification_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if deleted == 0:
        raise HTTPException(400, "Certification not found")
    else:
        return {"detail": "Successfully deleted certification"}
    