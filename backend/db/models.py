from pydantic import BaseModel, Field
from typing import Optional, List
from pymongo.collection import Collection
from .clients import get_collection
from datetime import datetime, timedelta

# --- Skills Model ---
class SkillModel(BaseModel):
    id: Optional[str] = Field(alias="_id")
    user_id: str
    name: str
    category: str
    proficiency: str
    position: Optional[int] = 0

    class Config:
        arbitrary_types_allowed = True
        validate_by_name = True

SKILLS_COLLECTION: Collection = get_collection("skills")

# --- Education Model ---
class EducationModel(BaseModel):
    id: Optional[str] = Field(alias="_id")
    institution: str
    degree: str
    field_of_study: str
    graduation_date: Optional[str]
    currently_enrolled: bool = False
    gpa: Optional[float]
    gpa_private: bool = False
    achievements: Optional[str]

EDUCATION_COLLECTION: Collection = get_collection("education")

# --- Certifications Model ---
class CertificationModel(BaseModel):
    id: Optional[str] = Field(alias="_id")
    user_id: str
    name: str
    issuer: str
    date_earned: str
    expiration_date: Optional[str]
    does_not_expire: bool = False
    cert_id: Optional[str]
    category: Optional[str]
    verified: bool = False
    document_url: Optional[str]
    position: Optional[int] = 0

    # Derived properties for frontend
    def is_expired(self) -> bool:
        if self.does_not_expire or not self.expiration_date:
            return False
        return datetime.strptime(self.expiration_date, "%Y-%m-%d").date() < datetime.today().date()

    def expiring_soon(self, days: int = 90) -> bool:
        if self.does_not_expire or not self.expiration_date:
            return False
        exp_date = datetime.strptime(self.expiration_date, "%Y-%m-%d").date()
        return datetime.today().date() <= exp_date <= datetime.today().date() + timedelta(days=days)

CERTIFICATIONS_COLLECTION: Collection = get_collection("certifications")

# --- Projects Model ---
class ProjectModel(BaseModel):
    id: Optional[str] = Field(alias="_id")
    name: str
    description: str
    role: str
    start_date: str
    end_date: Optional[str]
    skills_used: List[str] = []
    team_size: Optional[int]
    details: Optional[str]
    outcomes: Optional[str]
    industry_type: Optional[str]
    media_urls: List[str] = []
    status: Optional[str] = "Planned"

PROJECTS_COLLECTION: Collection = get_collection("projects")
