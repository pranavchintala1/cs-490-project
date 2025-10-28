from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal

ExperienceLevel = Literal["Entry", "Mid", "Senior", "Executive"]

class UserProfile(BaseModel):
    user_id: str
    full_name: str = ""
    email: str = ""  # stored lowercase
    phone: str = ""
    location: str = ""
    headline: str = ""
    bio: str = Field(default="", max_length=500)
    industry: str = ""
    experience_level: Optional[ExperienceLevel] = None
    profile_picture: str = ""
    jobs: List[str] = []
    skills: List[str] = []
    education: List[str] = []
    certifications: List[str] = []
    projects: List[str] = []

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = Field(default=None, max_length=500)
    industry: Optional[str] = None
    experience_level: Optional[ExperienceLevel] = None
    profile_picture: Optional[str] = None
