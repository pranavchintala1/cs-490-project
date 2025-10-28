from pydantic import BaseModel
from typing import Optional

class LoginCred(BaseModel):
    username: str | None = None
    password: str | None = None

class RegistInfo(BaseModel):
    username: str
    password: str
    email: str
    name: str | None = None
    phone_number: str | None = None
    address: str | None = None

class ProfileSchema(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    title: Optional[str] = None
    biography: Optional[str] = None
    industry: Optional[str] = None
    experience_level: Optional[str] = None
    profile_picture: Optional[str] = None

class Skill(BaseModel):
    ...

class Employment(BaseModel):
    ...

class Education(BaseModel):
    ...

class Project(BaseModel):
    ...