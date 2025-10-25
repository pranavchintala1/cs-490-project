# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from skills import app as skills_app
from education import app as education_app

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount apps
app.mount("/skills/", skills_app)
app.mount("/education/", education_app)
