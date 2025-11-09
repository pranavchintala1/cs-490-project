from pydantic import BaseModel
from typing import Optional

from schema.Employment import Employment
from schema.Education import Education
from schema.Skill import Skill

class ContactInfo(BaseModel): # related to Resume
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None # renamed from "location"
    linkedin: Optional[str] = None # link/url

class Colors(BaseModel):
    primary: Optional[str] = None
    accent: Optional[str] = None

class Fonts(BaseModel):
    heading: Optional[str] = None
    body: Optional[str] = None

class Resume(BaseModel):
    name: Optional[str] = None
    template: Optional[str] = None
    contact: Optional[ContactInfo] = None # can use above custom schema if needed
    summary: Optional[str] = None
    experience: Optional[list[Employment]] = None
    education: Optional[list[Education]] = None
    skills: Optional[list[Skill]] = None
    colors: Optional[Colors] = None
    fonts: Optional[Fonts] = None
    sections: Optional[list[str]] = None
    default_resume: Optional[bool] = False
