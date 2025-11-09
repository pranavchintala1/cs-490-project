from fastapi import APIRouter, HTTPException, Header, Path, Body
from pydantic import BaseModel
from typing import List
from datetime import datetime
from uuid import uuid4

from schema.CoverLetter import CoverLetterIn, CoverLetterOut
from mongo.cover_letters_dao import cover_letters_dao

coverletter_router = APIRouter()


# ------------------------------------------------------------
# GET all cover letters for the current user
# ------------------------------------------------------------
@coverletter_router.get("/api/cover-letters/me", response_model=List[CoverLetterOut])
async def get_my_coverletters(uuid: str = Header(...)):
    """
    Fetch all cover letters belonging to the current user.
    The user's UUID is passed via the 'uuid' header (set by frontend axios interceptor).
    """
    letters = await cover_letters_dao.get_all_cover_letters(uuid)

    if not letters:
        return [] #No cover letters... yet!

    mapped_letters = [
        {
            "id": str(l["_id"]),
            "user_id": l.get("uuid"),
            "title": l.get("title"),
            "company": l.get("company"),
            "position": l.get("position"),
            "content": l.get("content"),
            "created_at": l.get("created_at"),
        }
        for l in letters
    ]

    return mapped_letters


# ------------------------------------------------------------
# POST create a new cover letter
# ------------------------------------------------------------
@coverletter_router.post("/api/cover-letters")
async def add_coverletter(
    coverletter: CoverLetterIn,
    uuid: str = Header(...)
):
    """
    Add a new cover letter for the current user.
    """
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


# ------------------------------------------------------------
# PUT update a cover letter
# ------------------------------------------------------------
@coverletter_router.put("/api/cover-letters/{letter_id}")
async def update_coverletter(
    letter_id: str = Path(...),
    coverletter: CoverLetterIn = Body(...),
    uuid: str = Header(...)
):
    """
    Update an existing cover letter if it belongs to the current user.
    """
    updates = {
        "title": coverletter.title,
        "company": coverletter.company,
        "position": coverletter.position,
        "content": coverletter.content
    }

    modified_count = await cover_letters_dao.update_cover_letter(letter_id, uuid, updates)

    if modified_count == 0:
        raise HTTPException(status_code=404, detail="Cover letter not found or not owned by user")

    return {"message": "Updated successfully"}


# ------------------------------------------------------------
# DELETE a cover letter
# ------------------------------------------------------------
@coverletter_router.delete("/api/cover-letters/{letter_id}")
async def delete_coverletter(
    letter_id: str = Path(...),
    uuid: str = Header(...)
):
    """
    Delete a cover letter belonging to the current user.
    """
    deleted_count = await cover_letters_dao.delete_cover_letter(letter_id, uuid)

    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cover letter not found or not owned by user")

    return {"message": "Deleted successfully"}
