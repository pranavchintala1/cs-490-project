from pydantic import BaseModel
from typing import Optional

class LoginCred(BaseModel):
    email: str | None = None
    password: str | None = None

class RegistInfo(BaseModel):
    username: str
    password: str
    email: str
    name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None

class Skill(BaseModel):
    user_id: str
    name: str
    proficiency: Optional[str] = None
    category: Optional[str] = None

class Employment(BaseModel):
    user_id: str 
    #entry_id: str # uniquely identify entries
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None # end?
    end_date: Optional[str] = None # end?
    description: Optional[str] = None 

class Education(BaseModel):
    user_id: str
    #entry_id: str
    institution_name: str
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    graduation_date: Optional[str] = None # date?
    gpa: Optional[float] = None
    gpa_private: Optional[bool] = False
    education_level: Optional[str] = None
    achievements: Optional[str] = None

class Project(BaseModel):
    user_id: str
    # entry_id: str
    project_name: str
    description: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None # date?
    end_date: Optional[str] = None # date?
    skills: Optional[list[str]] = None
    team_size: Optional[int] = None
    details: Optional[str] = None
    achievements: Optional[str] = None
    industry: Optional[str] = None
    media: Optional[list[str]] = None # url?
    status: Optional[str] = None

class Certification(BaseModel):
    user_id: str
    #entry_id: str
    name: str
    issuer: Optional[str] = None
    date_earned: Optional[str] = None # date?
    date_expiry: Optional[str] = None # date?
    cert_number: Optional[str] = None
    document: Optional[str] = None # url?
    category: Optional[str] = None

class ProfileSchema(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    title: Optional[str] = None
    biography: Optional[str] = None
    industry: Optional[str] = None
    experience_level: Optional[str] = None
    profile_picture: Optional[str] = None # url?