from fastapi import FastAPI, Header
from fastapi.responses import JSONResponse
from uuid import uuid4

from mongo.user_data_dao import user_data_dao
from mongo.user_auth_dao import user_auth_dao
from sessions.session_manager import session_manager
from pymongo.errors import DuplicateKeyError, WriteError
import bcrypt

from schema import RegistInfo, LoginCred, ProfileSchema, Education, Employment, Project, Skill

app = FastAPI()

def parse_bearer(auth_header: str = Header(..., alias="Authorization")):
    return auth_header.removeprefix("Bearer ").strip()

@app.post("/api/auth/register")
async def register(regist_info: RegistInfo):
    try:
        uuid = str(uuid4())
        # create auth entry
        await user_auth_dao.register_user(uuid, regist_info.username, regist_info.email, regist_info.password)

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
        password_hash = await user_auth_dao.get_password(credentials.email)
        
        if not password_hash:
            return JSONResponse(status_code = 400, content = {"detail": "User not found"})

        authenticated = bcrypt.checkpw(credentials.password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception as e:
        return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong {str(e)}"}) # could pose security risk
    
    if authenticated:
        try:
            user_id = await user_auth_dao.get_uuid(credentials.email) # we already checked if the username exists, don't need to check again
        except Exception as e:
            return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong: {str(e)}"})

        session_token = session_manager.begin_session(user_id)

        return JSONResponse(status_code = 200, content = {"detail": "Successful login", "session_token": session_token})
    else:
        return JSONResponse(status_code = 401, content = {"detail": "Incorrect credentials"})

@app.post("/api/auth/logout")
async def logout(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if session_manager.authenticate_session(uuid, parse_bearer(auth)) and session_manager.kill_session(uuid): # successfully auth and kill session before proceeding
        return JSONResponse(status_code = 200, content = {"detail": "Successfully logged out"})
    return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})

@app.get("/api/users/me")
async def retrieve_profile(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if session_manager.authenticate_session(uuid, parse_bearer(auth)):
        try:
            user_data = await user_data_dao.retrieve_user(uuid)
        except Exception as e:
            return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong: {str(e)}"})
        
        if not user_data:
            return JSONResponse(status_code = 400, content = {"detail": "User does not exist"})
        return user_data
    return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})

@app.put("/api/users/me")
async def update_profile(uuid: str, profile: ProfileSchema, auth: str = Header(..., alias = "Authorization")):
    if session_manager.authenticate_session(uuid, parse_bearer(auth)):
        cleaned_data = profile.model_dump(exclude_none = True)
        try:
            update_count = await user_data_dao.update_user(uuid, cleaned_data)
        except Exception as e:
            return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong: {str(e)}"})
        if update_count == 0:
            return JSONResponse(status_code = 400, content = {"detail": "User does not exist"})
        return JSONResponse(status_code = 200, content = {"detail": "Successfully updated user"})
    return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})

@app.put("api/skills/add")
async def add_skill(uuid: str, entry: Skill, auth: str = Header(..., alias = "Authorization")):
    pass