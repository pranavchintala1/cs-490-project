from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import auth_router
from routes.profiles import profiles_router
from routes.skills import skills_router
from routes.projects import projects_router
from routes.employment import employment_router
from routes.certifications import certifications_router
from routes.education import education_router
from routes.jobs import jobs_router

app = FastAPI()

api_prefix = "/api"

origins = [ # domains to provide access to
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      
    allow_credentials=True,
    allow_methods=["*"],         
    allow_headers=["*"],         
)

app.include_router(auth_router, prefix = api_prefix) 
app.include_router(profiles_router, prefix = api_prefix)
app.include_router(skills_router, prefix = api_prefix)
app.include_router(projects_router, prefix = api_prefix)
app.include_router(education_router, prefix = api_prefix)
app.include_router(employment_router, prefix = api_prefix)
app.include_router(certifications_router, prefix = api_prefix)
app.include_router(jobs_router, prefix = api_prefix)

# TODO: add user deletion services (deletes all data, requires password authentication)
# Where to put it though?

# TODO: resumes?