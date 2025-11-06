from fastapi import APIRouter, Header, UploadFile, File, Depends, HTTPException
import gridfs
from datetime import datetime, timezone

from mongo.profiles_dao import profiles_dao
from sessions.session_authorizer import authorize
from schema import Profile

profiles_router = APIRouter(prefix = "/users")

# NOTE: creation of profile not available here as that should only be done via /api/auth/register

@profiles_router.get("/me", tags = ["profiles"])
async def get_profile(uuid: str = Depends(authorize)):    
    try:
        profile = await profiles_dao.get_profile(uuid)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if profile:
        return profile
    else:
        raise HTTPException(400, "User profile not found")

@profiles_router.put("/me", tags = ["profiles"])
async def update_profile(profile: Profile, uuid: str = Depends(authorize)):
    try:
        model = profile.model_dump(exclude_unset = True)
        model["date_updated"] = datetime.now(timezone.utc)
        updated = await profiles_dao.update_profile(uuid, model)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if updated == 0:
        raise HTTPException(400, "User profile not found")  
    else:
        return {"detail": "Successfully updated profile"}
    
@profiles_router.post("/me/avatar", tags = ["profiles"])
async def upload_pfp(image: UploadFile = File(...), uuid: str = Depends(authorize)):
    pass   
    # TODO: Implement profile picture upload

@profiles_router.get("/me/avatar", tags = ["profiles"])
async def download_pfp(uuid: str = Depends(authorize)):
    pass
    # TODO: Implement profile picture download

@profiles_router.delete("/me", tags = ["profiles"])
async def delete_profile(uuid: str = Depends(authorize)):
    try:
        deleted = await profiles_dao.delete_profile(uuid)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if deleted == 0:
        raise HTTPException(400, "User profile not found")  
    else:
        return {"detail": "Successfully deleted profile"}

