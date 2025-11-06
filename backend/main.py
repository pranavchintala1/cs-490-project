from fastapi import FastAPI
from fastapi.exceptions import HTTPException

from routes.auth import auth_router
from routes.profiles import profiles_router
from routes.skills import skills_router
from routes.projects import projects_router
from routes.employment import employment_router
from routes.certifications import certifications_router

app = FastAPI()

api_prefix = "/api"

app.include_router(auth_router, prefix = api_prefix) # FIXME: overhaul auth endpoints
app.include_router(profiles_router, prefix = api_prefix)
app.include_router(skills_router, prefix = api_prefix)
app.include_router(projects_router, prefix = api_prefix)
app.include_router(employment_router, prefix = api_prefix)
app.include_router(certifications_router, prefix = api_prefix)

# TODO: jobs, resumes?