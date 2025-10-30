from fastapi import FastAPI, Header
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4

from mongo.profiles_dao import profiles_dao
from mongo.auth_dao import auth_dao
from sessions.session_manager import session_manager
from pymongo.errors import DuplicateKeyError, WriteError
import bcrypt

from schema import RegistInfo, LoginCred, ProfileSchema, Education, Employment, Project, Skill, Certification

app = FastAPI()

origins = [ # domains to provide access to
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_orgins = origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

def parse_bearer(auth_header: str = Header(..., alias="Authorization")):
    return auth_header.removeprefix("Bearer ").strip()

@app.post("/api/auth/register")
async def register(regist_info: RegistInfo):
    try:
        user_id = str(uuid4())
        # create auth entry
        await auth_dao.register_user(user_id, regist_info.username, regist_info.email, regist_info.password)

        # create data entry
        await profiles_dao.register_user(user_id, regist_info.model_dump(exclude_none = True))

        session_token = session_manager.begin_session(user_id)

    except DuplicateKeyError:
        return JSONResponse(status_code = 400, content = {"detail": "User already exists"})
    except Exception as e:
        return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong {str(e)}"})
    return JSONResponse(status_code=200, content={"detail": "Sucessful Registration", "uuid": user_id, "session_token": session_token})

@app.post("/api/auth/login")
async def login(credentials: LoginCred):
    try:
        password_hash = await auth_dao.get_password(credentials.email)
        
        if not password_hash:
            return JSONResponse(status_code = 400, content = {"detail": "User not found"})

        authenticated = bcrypt.checkpw(credentials.password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception as e:
        return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong {str(e)}"}) # could pose security risk
    
    if authenticated:
        try:
            user_id = await auth_dao.get_uuid(credentials.email) # we already checked if the username exists, don't need to check again
        except Exception as e:
            return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong: {str(e)}"})

        session_token = session_manager.begin_session(user_id)

        return JSONResponse(status_code = 200, content = {"detail": "Successful login", "uuid": user_id, "session_token": session_token})
    else:
        return JSONResponse(status_code = 401, content = {"detail": "Incorrect credentials"})

@app.post("/api/auth/logout")
async def logout(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if session_manager.authenticate_session(uuid, parse_bearer(auth)) and session_manager.kill_session(uuid): # successfully auth and kill session before proceeding
        return JSONResponse(status_code = 200, content = {"detail": "Successfully logged out"})
    return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})

########################################################################################################################
#                                                       PROFILES                                                       #
########################################################################################################################
@app.get("/api/users/me")
async def retrieve_profile(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if session_manager.authenticate_session(uuid, parse_bearer(auth)):
        try:
            user_data = await profiles_dao.retrieve_user(uuid)
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
            update_count = await profiles_dao.update_user(uuid, cleaned_data)
        except Exception as e:
            return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong: {str(e)}"})
        if update_count == 0:
            return JSONResponse(status_code = 400, content = {"detail": "User does not exist"})
        return JSONResponse(status_code = 200, content = {"detail": "Successfully updated user"})
    return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})

########################################################################################################################
#                                                       SKILLS                                                         #
########################################################################################################################
@app.post("/api/skills")
async def add_skill(uuid: str, entry: Skill, auth: str = Header(..., alias = "Authorization")):
    pass

@app.get("/api/skills")
async def retrieve_skill(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    pass

@app.get("/api/skills/me")
async def retrieve_all_skills(uuid: str, auth: str = Header(..., alias = "Authorization")):
    pass

@app.put("/api/skills")
async def update_skill(uuid: str, entry_id: str, data: Skill, auth: str = Header(..., alias = "Authorization")):
    pass

@app.delete("/api/skills")
async def delete_skill(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    pass

########################################################################################################################
#                                                      EDUCATION                                                       #
########################################################################################################################
@app.post("/api/education")
async def add_education(uuid: str, entry: Education, auth: str = Header(..., alias = "Authorization")):
    pass

@app.get("/api/education")
async def retrieve_education(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    pass

@app.get("/api/education/me")
async def retrieve_all_education(uuid: str, auth: str = Header(..., alias = "Authorization")):
    pass

@app.put("/api/education")
async def update_education(uuid: str, entry_id: str, data: Education, auth: str = Header(..., alias = "Authorization")):
    pass

@app.delete("/api/education")
async def delete_education(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    pass

########################################################################################################################
#                                                      EMPLOYMENT                                                      #
########################################################################################################################
@app.post("/api/employment")
async def add_employment(uuid: str, entry: Employment, auth: str = Header(..., alias = "Authorization")):
    pass

@app.get("/api/employment")
async def retrieve_employment(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    pass

@app.get("/api/employment/me")
async def retrieve_all_employment(uuid: str, auth: str = Header(..., alias = "Authorization")):
    pass

@app.put("/api/employment")
async def update_education(uuid: str, entry_id: str, data: Employment, auth: str = Header(..., alias = "Authorization")):
    pass

@app.delete("/api/employment")
async def delete_employment(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    pass

########################################################################################################################
#                                                       PROJECTS                                                       #
########################################################################################################################
@app.post("/api/projects")
async def add_project(uuid: str, entry: Project, auth: str = Header(..., alias = "Authorization")):
    pass

@app.get("/api/projects")
async def retrieve_project(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    pass

@app.get("/api/projects/me")
async def retrieve_all_projects(uuid: str, auth: str = Header(..., alias = "Authorization")):
    pass

@app.put("/api/projects")
async def update_project(uuid: str, entry_id: str, data: Project, auth: str = Header(..., alias = "Authorization")):
    pass

@app.delete("/api/projects")
async def delete_project(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    pass

########################################################################################################################
#                                                     CERTIFICATION                                                    #
########################################################################################################################
@app.post("/api/certifications")
async def add_certification(uuid: str, entry: Certification, auth: str = Header(..., alias = "Authorization")):
    pass

@app.get("/api/certifications")
async def retrieve_certification(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    pass

@app.get("/api/certifications/me")
async def retrieve_all_certifications(uuid: str, auth: str = Header(..., alias = "Authorization")):
    pass

@app.put("/api/certifications")
async def update_certification(uuid: str, entry_id: str, data: Certification, auth: str = Header(..., alias = "Authorization")):
    pass

@app.delete("/api/certifications")
async def delete_certification(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    pass
