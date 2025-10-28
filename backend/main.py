from fastapi import FastAPI
from fastapi.responses import JSONResponse
from uuid import uuid4

from mongo.user_data import user_data_api
from mongo.user_auth import user_auth_api
from pymongo.errors import DuplicateKeyError, WriteError
import bcrypt

from schema import RegistInfo, LoginCred, ProfileSchema, Education, Employment, Project, Skill

app = FastAPI()


@app.post("/api/auth/register")
async def register(regist_info: RegistInfo):
    try:
        uuid = str(uuid4())
        # create auth entry
        await user_auth_api.register_user(uuid, regist_info.username, regist_info.password)

        # create data entry
        await user_data_api.register_user(uuid, regist_info.username, regist_info.email, regist_info.name, regist_info.phone_number, regist_info.address)

    except DuplicateKeyError:
        return JSONResponse(status_code = 400, content = {"details": "User already exists"})
    except:
        return JSONResponse(status_code = 500, content = {"details": "Something went wrong"})
    return JSONResponse(status_code=200, content={"details": "Sucessful Registration", "uuid": uuid})

@app.post("/api/auth/login")
async def login(credentials: LoginCred):
    try:
        password_hash = await user_auth_api.get_password(credentials.username)
        authenticated = bcrypt.checkpw(credentials.password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception as e:
        return JSONResponse(status_code = 500, content = {"details": str(e)})
    if authenticated:
        return JSONResponse(status_code = 200, content = {"details": "Successful login"})
    else:
        return JSONResponse(status_code = 200, content = {"details": "Incorrect credentials"})

@app.post("/api/auth/logout")
async def logout():
    pass

@app.get("/api/users/me")
async def retrieve_profile(uuid: str = None):
    pass

@app.put("api/users/me")
async def update_profile(uuid: str, profile: ProfileSchema):
    pass