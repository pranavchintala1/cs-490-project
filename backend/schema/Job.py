from pydantic import BaseModel
from typing import Optional

# {
#   "title": "Geospatial Engineer (TS/SCI with Polygraph REQUIRED)",
#   "company": {
#     "size": "more than 10,000",
#     "industry": "Information Technology Support Services",
#     "location": "Falls Church, VA",
#     "website": "http://www.gdit.com",
#     "description": "GDIT is a global technology and professional services company that delivers technology solutions and mission services to every major agency across the U.S. government, defense and intelligence community.",
#     "image": ""
#   },
#   "location": "McLean, VA",
#   "salary": "$212,500 - $287,500 a year",
#   "deadline": null,
#   "industry": "Information Technology Support Services",
#   "job_type": "Full-time",
#   "description": ""
# }

class Company(BaseModel):
    size: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None

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

    company_data: Optional[Company] = None
    
    #reminderDays: Optional[int] = 3
    #emailReminder: Optional[bool] = True
    #reminderEmail: Optional[str] = None
    #lastReminderSent: Optional[str] = None
    #reminderSentForDeadline: Optional[str] = None

class UrlBody(BaseModel):
    url: str