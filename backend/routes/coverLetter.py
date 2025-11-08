from fastapi import APIRouter, HTTPException, Path, Body
from pydantic import BaseModel
from typing import List
from uuid import uuid4
from datetime import datetime

coverletter_router = APIRouter()

# Simulated in-memory DB
COVER_LETTERS_DB = [
 
]


class CoverLetterIn(BaseModel):
    title: str
    company: str = None
    position: str = None
    content: str

class CoverLetterOut(CoverLetterIn):
    _id: str
    user_uuid: str
    created_at: str

# -----------------------
# GET all cover letters for a user
# -----------------------
@coverletter_router.get("/api/coverletters/me/{uuid}", response_model=List[CoverLetterOut])
async def get_my_coverletters(uuid: str = Path(...)):
    user_letters = [l for l in COVER_LETTERS_DB if l["user_uuid"] == uuid]
    if not user_letters:
        raise HTTPException(status_code=404, detail="No cover letters found")
    return user_letters

# -----------------------
# POST a new cover letter
# -----------------------
@coverletter_router.post("/api/coverletters")
async def add_coverletter(
    coverletter: CoverLetterIn,
    uuid: str = Body(..., embed=True)  # UUID passed in request body
):
    new_id = str(uuid4())
    now = datetime.utcnow().isoformat()
    new_letter = {
        "_id": new_id,
        "user_uuid": uuid,
        "title": coverletter.title,
        "company": coverletter.company,
        "position": coverletter.position,
        "content": coverletter.content,
        "created_at": now
    }
    COVER_LETTERS_DB.append(new_letter)
    return {"coverletter_id": new_id}

# -----------------------
# PUT update a cover letter by ID
# -----------------------
@coverletter_router.put("/api/coverletters/{letter_id}")
async def update_coverletter(
    letter_id: str = Path(...),
    coverletter: CoverLetterIn = Body(...)
):
    for l in COVER_LETTERS_DB:
        if l["_id"] == letter_id:
            l.update({
                "title": coverletter.title,
                "company": coverletter.company,
                "position": coverletter.position,
                "content": coverletter.content
            })
            return {"message": "Updated successfully"}
    raise HTTPException(status_code=404, detail="Cover letter not found")

# -----------------------
# DELETE a cover letter by ID
# -----------------------
@coverletter_router.delete("/api/coverletters/{letter_id}")
async def delete_coverletter(letter_id: str = Path(...)):
    for i, l in enumerate(COVER_LETTERS_DB):
        if l["_id"] == letter_id:
            COVER_LETTERS_DB.pop(i)
            return {"message": "Deleted successfully"}
    raise HTTPException(status_code=404, detail="Cover letter not found")
