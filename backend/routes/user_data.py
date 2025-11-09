from fastapi import APIRouter, Depends, HTTPException
from sessions.session_authorizer import authorize
from mongo.education_dao import education_dao
from mongo.skills_dao import skills_dao
from mongo.jobs_dao import jobs_dao
from mongo.employment_dao import employment_dao
from mongo.profiles_dao import profiles_dao
import asyncio

user_router = APIRouter(prefix="/user")

@user_router.get("/me/all_data")
async def get_all_user_data(uuid: str = Depends(authorize)):
    try:
        # Avengers... assemble!
        education_task = education_dao.get_all_education(uuid)
        skills_task = skills_dao.get_all_skills(uuid)
        jobs_task = jobs_dao.get_all_jobs(uuid)
        employment_task = employment_dao.get_all_employment(uuid)
        profiles_task = profiles_dao.get_profile(uuid)

        education, skills, jobs, employment, profile = await asyncio.gather(
            education_task, skills_task, jobs_task, employment_task, profiles_task
        )

        return {
            "profile": profile,
            "education": education,
            "skills": skills,
            "jobs": jobs,
            "employment": employment
        }

    except Exception as e:
        raise HTTPException(500, f"Internal server error: {str(e)}")
