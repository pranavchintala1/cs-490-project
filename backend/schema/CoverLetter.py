from pydantic import BaseModel
from typing import Optional

class CoverLetterIn(BaseModel):
    title: str
    company: str
    position: str
    content: str

class CoverLetterOut(BaseModel):
    id: str
    user_id: str
    title: str
    company: str
    position: str
    content: str
    created_at: str
