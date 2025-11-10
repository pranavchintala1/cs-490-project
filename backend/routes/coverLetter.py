from fastapi import APIRouter, HTTPException, Header, Path, Body
from pydantic import BaseModel
from typing import List
from datetime import datetime
from uuid import uuid4

from schema.CoverLetter import CoverLetterIn, CoverLetterOut
from mongo.cover_letters_dao import cover_letters_dao

coverletter_router = APIRouter()

# ------------------------------------------------------------
# GET a single cover letter by ID
# ------------------------------------------------------------
@coverletter_router.get("/cover-letters/{letter_id}", response_model=CoverLetterOut)
async def get_coverletter(
    letter_id: str = Path(...),
    uuid: str = Header(...)
):
    """
    Fetch a single cover letter by ID if it belongs to the current user.
    """
    letter = await cover_letters_dao.get_cover_letter(letter_id, uuid)

    if not letter:
        raise HTTPException(status_code=404, detail="Cover letter not found or not owned by user")

    return {
        "id": str(letter["_id"]),
        "user_id": letter.get("uuid"),
        "title": letter.get("title"),
        "company": letter.get("company"),
        "position": letter.get("position"),
        "content": letter.get("content"),
        "created_at": letter.get("created_at"),
    }

# ------------------------------------------------------------
# GET all cover letters for the current user
# ------------------------------------------------------------
@coverletter_router.get("/cover-letters/me/{uuid}", response_model=List[CoverLetterOut])
async def get_my_coverletters(uuid: str = Path(...)):
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
@coverletter_router.post("/cover-letters")
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
@coverletter_router.put("/cover-letters/{letter_id}")
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
        # Check if the document exists
        letter_exists = await cover_letters_dao.get_cover_letter(letter_id, uuid)
        if not letter_exists:
            raise HTTPException(status_code=404, detail="Cover letter not found or not owned by user")
        # If it exists, nothing changed → return success
        return {"message": "No changes to update"}

    return {"message": "Updated successfully"}

# ------------------------------------------------------------
# DELETE a cover letter
# ------------------------------------------------------------
@coverletter_router.delete("/cover-letters/{letter_id}")
async def delete_coverletter(letter_id: str = Path(...)):
    """
    Delete a cover letter belonging to the current user.
    """
    # pass both letter_id and uuid to ensure only the owner can delete
    deleted_count = await cover_letters_dao.delete_cover_letter(letter_id)

    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cover letter not found or not owned by user")

    return {"message": "Deleted successfully"}
