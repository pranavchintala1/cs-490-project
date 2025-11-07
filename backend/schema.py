from pydantic import BaseModel
from typing import Optional

class LoginCred(BaseModel):
    email: str
    password: str

class RegistInfo(BaseModel):
    username: str
    password: str
    email: str
    full_name: str

# TODO: anything noted as required for creation should be validated in the endpoints

class Profile(BaseModel):
    username: Optional[str] = None # NOTE: required for creation
    email: Optional[str] = None # NOTE: required for creation
    full_name: Optional[str] = None # NOTE: required for creation
    phone_number: Optional[str] = None
    address: Optional[str] = None
    title: Optional[str] = None
    biography: Optional[str] = None
    industry: Optional[str] = None
    experience_level: Optional[str] = None
    # TODO: requires image-media
    
class Skill(BaseModel):
    name: Optional[str] = None # NOTE: required for creation
    proficiency: Optional[str] = None
    category: Optional[str] = None
    position: Optional[int] = None

class Employment(BaseModel):
    title: Optional[str] = None # NOTE: required for creation
    company: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None # end?
    end_date: Optional[str] = None # end?
    description: Optional[str] = None

class Education(BaseModel):
    institution_name: Optional[str] = None # NOTE: required for creation
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    graduation_date: Optional[str] = None # date?
    gpa: Optional[float] = None
    gpa_private: Optional[bool] = False
    education_level: Optional[str] = None
    achievements: Optional[str] = None
    position: Optional[int] = None

class Project(BaseModel):
    project_name: Optional[str] = None # NOTE: required for creation
    description: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None # date?
    end_date: Optional[str] = None # date?
    skills: Optional[list[str]] = None
    team_size: Optional[int] = None
    details: Optional[str] = None
    project_url: Optional[str] = None
    achievements: Optional[str] = None
    industry: Optional[str] = None
    status: Optional[str] = None
    # TODO: requires multi-media

class Certification(BaseModel): 
    name: Optional[str] = None # NOTE: required for creation
    issuer: Optional[str] = None
    date_earned: Optional[str] = None # date?
    date_expiry: Optional[str] = None # date?
    cert_number: Optional[str] = None
    category: Optional[str] = None
    position: Optional[str] = None
    verified: Optional[bool] = False
    document_name: Optional[str] = None
    # TODO: requires docu-media

class Job(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    url: Optional[str] = None
    deadline: Optional[str] = None
    industry: Optional[str] = None
    job_type: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    contacts: Optional[str] = None
    salary_notes: Optional[str] = None
    interview_notes: Optional[str] = None
    status_history: Optional[list[tuple[str, str]]] = None
    archived: Optional[bool] = False
    archive_reason: Optional[str] = None
    archive_date: Optional[str] = None

class CoverLetter(BaseModel):
    category: str
    industry: str
    data: dict
    
