from fastapi import FastAPI
from fastapi.responses import JSONResponse
from uuid import uuid4

from backend.mongo.user_data_dao import user_data_dao
from backend.mongo.user_auth_dao import user_auth_dao
from pymongo.errors import DuplicateKeyError, WriteError
import bcrypt

from schema import RegistInfo, LoginCred, ProfileSchema, Education, Employment, Project, Skill

app = FastAPI()

@app.post("/api/auth/register")
async def register(regist_info: RegistInfo):
    try:
        uuid = str(uuid4())
        # create auth entry
        await user_auth_dao.register_user(uuid, regist_info.username, regist_info.password)

        # create data entry
        await user_data_dao.register_user(uuid, regist_info.model_dump(exclude_none = True))

    except DuplicateKeyError:
        return JSONResponse(status_code = 400, content = {"detail": "User already exists"})
    except Exception as e:
        return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong {str(e)}"})
    return JSONResponse(status_code=200, content={"detail": "Sucessful Registration", "uuid": uuid})

@app.post("/api/auth/login")
async def login(credentials: LoginCred):
    try:
        password_hash = await user_auth_dao.get_password(credentials.username)
        authenticated = bcrypt.checkpw(credentials.password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception as e:
        return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong {str(e)}"}) # could pose security risk
    if authenticated:
        return JSONResponse(status_code = 200, content = {"detail": "Successful login"})
    else:
        return JSONResponse(status_code = 200, content = {"detail": "Incorrect credentials"})

@app.post("/api/auth/logout")
async def logout():
    return JSONResponse(status_code = 200, content = {"detail": "currently unimplemented"})

@app.get("/api/users/me")
async def retrieve_profile(uuid: str = None):
    try:
        user_data = await user_data_dao.retrieve_user(uuid)
    except Exception as e:
        return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong: {str(e)}"})
    
    if not user_data:
        return JSONResponse(status_code = 400, content = {"detail": "User does not exist"})
    return user_data

@app.put("/api/users/me")
async def update_profile(uuid: str, profile: ProfileSchema):
    cleaned_data = profile.model_dump(exclude_none = True)
    try:
        update_count = await user_data_dao.update_user(uuid, cleaned_data)
    except Exception as e:
        return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong: {str(e)}"})
    if update_count == 0:
        return JSONResponse(status_code = 400, content = {"detail": "User does not exist"})
    return JSONResponse(status_code = 200, content = {"detail": "Successfully updated user"})

@app.put("api/skills/add")
async def add_skill(uuid, entry: Skill):
    if not entry.uuid:
        return JSONResponse(status_code = 400, content = {"detail": "User required"})