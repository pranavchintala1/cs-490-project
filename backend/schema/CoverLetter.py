from pydantic import BaseModel
from typing import Optional

class CoverLetter(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    content: Optional[str] = None