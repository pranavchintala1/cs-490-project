from fastapi import APIRouter, HTTPException, Depends
from pymongo.errors import DuplicateKeyError

from mongo.cover_letter_dao import cover_letters_dao
from sessions.session_authorizer import authorize
from schema import CoverLetter

cover_letters_router = APIRouter(prefix = "/cover-letters")

@cover_letters_router.post("", tags = ["cover-letters"])
async def add(cover_letter: CoverLetter, uuid: str = Depends(authorize)):
    try:
        model = cover_letter.model_dump()
        model["uuid"] = uuid
        result = await cover_letters_dao.add_cover_letter(model)
    except DuplicateKeyError:
        raise HTTPException(400, "Cover letter already exists")
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    return {"detail": "Sucessfully added cover letter", "cover_letter_id": result}

@cover_letters_router.get("", tags = ["cover-letters"])
async def get(cover_letter_id: str, uuid: str = Depends(authorize)):
    try:
        result = await cover_letters_dao.get_cover_letter(cover_letter_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    if result:
        result["_id"] = str(result["_id"])
        return result
    else:
        raise HTTPException(400, "Cover letter not found")
    
@cover_letters_router.get("/me", tags = ["cover-letters"])
async def get_all(uuid: str = Depends(authorize)):
    try:
        results = await cover_letters_dao.get_all_cover_letters(uuid)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    return results

@cover_letters_router.put("", tags = ["cover-letters"])
async def update(cover_letter_id: str, cover_letter: CoverLetter, uuid: str = Depends(authorize)):    
    try:
        model = cover_letter.model_dump(exclude_unset = True)
        updated = await cover_letters_dao.update_cover_letter(cover_letter_id, model)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    if updated == 0:
        raise HTTPException(400, "Cover letter not found")
    else:
        return {"detail": "Successfully updated cover letter"}
    
@cover_letters_router.delete("", tags = ["cover-letters"])
async def delete(cover_letter_id: str, uuid: str = Depends(authorize)):
    try:
        deleted = await cover_letters_dao.delete_cover_letter(cover_letter_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if deleted == 0:
        raise HTTPException(400, "Cover letter not found")
    else:
        return {"detail": "Successfully deleted cover letter"}