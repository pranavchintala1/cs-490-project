# backend/db/models.py
from pydantic import BaseModel, Field
from typing import Optional, List
from bson import ObjectId
from pymongo.collection import Collection
from .clients import get_collection

# Helper to handle ObjectId serialization
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# Skills Model
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
        json_encoders = {ObjectId: str}

SKILLS_COLLECTION: Collection = get_collection("skills")

# --- Education Model --- #
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


# --- Certifications Model --- #
class CertificationModel(BaseModel):
    id: Optional[str] = Field(alias="_id")
    name: str
    issuer: str
    date_earned: str
    expiration_date: Optional[str]
    does_not_expire: bool = False
    cert_id: Optional[str]
    category: Optional[str]
    verified: bool = False
    document_url: Optional[str]

CERTIFICATIONS_COLLECTION: Collection = get_collection("certifications")


# --- Projects Model --- #
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
