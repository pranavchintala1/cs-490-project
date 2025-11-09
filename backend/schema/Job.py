from pydantic import BaseModel
from typing import Optional

class Job(BaseModel):
    # job specific data
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    url: Optional[str] = None
    deadline: Optional[str] = None
    industry: Optional[str] = None
    job_type: Optional[str] = None
    description: Optional[str] = None
    
    # purely user generated data
    status: Optional[str] = None
    notes: Optional[str] = None
    contacts: Optional[str] = None
    salary_notes: Optional[str] = None
    interview_notes: Optional[str] = None
    status_history: Optional[list[tuple[str, str]]] = None
    archived: Optional[bool] = False
    archive_reason: Optional[str] = None
    archive_date: Optional[str] = None

class UrlBody(BaseModel):
    url: str
