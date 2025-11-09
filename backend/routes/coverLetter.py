from fastapi import APIRouter, HTTPException, Path, Body
from pydantic import BaseModel
from typing import List
from datetime import datetime
from uuid import uuid4

from schema import CoverLetterIn, CoverLetterOut
from mongo.coverletter_dao import cover_letters_dao  

coverletter_router = APIRouter()


@coverletter_router.get("/api/coverletters/me/{uuid}", response_model=List[CoverLetterOut])
async def get_my_coverletters(uuid: str = Path(...)):
    letters = await cover_letters_dao.get_all_cover_letters(uuid)
    if not letters:
        raise HTTPException(status_code=404, detail="No cover letters found")

    mapped_letters = []
    for l in letters:
        mapped_letters.append({
            "id": str(l["_id"]),         
            "user_id": l.get("uuid"),     
            "title": l.get("title"),
            "company": l.get("company"),
            "position": l.get("position"),
            "content": l.get("content"),
            "created_at": l.get("created_at"),
        })
    return mapped_letters


@coverletter_router.post("/api/coverletters")
async def add_coverletter(
    coverletter: CoverLetterIn,
    uuid: str = Body(..., embed=True)  
):
    new_letter = {
        "_id": str(uuid4()),
        "uuid": uuid,
        "title": coverletter.title,
        "company": coverletter.company,
        "position": coverletter.position,
        "content": coverletter.content,
        "created_at": datetime.utcnow().isoformat()
    }
    inserted_id = await cover_letters_dao.add_cover_letter(new_letter)
    return {"coverletter_id": inserted_id}


@coverletter_router.put("/api/coverletters/{letter_id}")
async def update_coverletter(
    letter_id: str = Path(...),
    coverletter: CoverLetterIn = Body(...)
):
    updates = {
        "title": coverletter.title,
        "company": coverletter.company,
        "position": coverletter.position,
        "content": coverletter.content
    }
    modified_count = await cover_letters_dao.update_cover_letter(letter_id, updates)
    if modified_count == 0:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return {"message": "Updated successfully"}


@coverletter_router.delete("/api/coverletters/{letter_id}")
async def delete_coverletter(letter_id: str = Path(...)):
    deleted_count = await cover_letters_dao.delete_cover_letter(letter_id)
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return {"message": "Deleted successfully"}
