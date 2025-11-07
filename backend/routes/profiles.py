from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone
from io import BytesIO

from mongo.profiles_dao import profiles_dao
from mongo.media_dao import media_dao
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
    
@profiles_router.post("/me/avatar", tags = ["profiles"])
async def upload_pfp(image: UploadFile = File(...), uuid: str = Depends(authorize)):
    try:
        media_id = await media_dao.add_media(uuid, image.filename, await image.read(), image.content_type)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    if not media_id:
        raise HTTPException(500, "Unable to upload image")
    
    return {"detail": "Sucess", "image_id": media_id}

@profiles_router.get("/me/avatar", tags = ["profiles"])
async def download_pfp(uuid: str = Depends(authorize)):
    try:
        media_ids = await media_dao.get_all_associated_media_ids(uuid)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    if not media_ids:
        raise HTTPException(400, "Could not find profile picture for user")
    
    try:
        media = await media_dao.get_media(media_ids[0])
    except:
        raise HTTPException(500, "Encountered internal server error")

    return StreamingResponse(
        BytesIO(media["contents"]),
        media_type = media["content_type"],
        headers = {
            "Content-Disposition": f"inline; filename=\"{media['filename']}\""
        }
    )

@profiles_router.put("/me/avatar", tags = ["profiles"])
async def update_pfp(media_id: str, media: UploadFile = File(...), uuid: str = Depends(authorize)):
    try:
        updated = media_dao.update_media(media_id, media.filename, await media.read(), uuid, media.content_type)
    except Exception as e:
        raise HTTPException(500, "Encountered internal server error")
    
    if not updated:
        raise HTTPException(400, "Could not update profile picture")
    
    return {"detail": "Sucessfully updated profile picture"}
    
@profiles_router.delete("/me/avatar", tags = ["projects"])
async def delete_media(media_id: str, uuid: str = Depends(authorize)):
    try:
        deleted = await media_dao.delete_media(media_id)
    except Exception as e:
        raise HTTPException(500, "Encountered interal service error")
    
    if not deleted:
        raise HTTPException(500, "Unable to delete profile picture")
    
    return {"detail": "Sucessfully deleted profile picture"}