from fastapi import FastAPI
from fastapi.exceptions import HTTPException

from routes.auth import auth_router

app = FastAPI()

api_prefix = "/api"

app.include_router(auth_router, prefix = api_prefix)
# ... include more routers here