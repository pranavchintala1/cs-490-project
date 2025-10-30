from fastapi import FastAPI, Header
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4

from mongo.profiles_dao import profiles_dao
from mongo.auth_dao import auth_dao
from mongo.skill_dao import skills_dao
from mongo.project_dao import projects_dao
from mongo.employment_dao import employment_dao
from mongo.education_dao import education_dao
from mongo.certification_dao import certifications_dao
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
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

def session_auth(uuid, auth_header: str = Header(..., alias = "Authorization")):
    return session_manager.authenticate_session(uuid, auth_header.removeprefix("Bearer ").strip())

def internal_server_error(message: str) -> JSONResponse:
    return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong: {message}"})

########################################################################################################################
#                                                     AUTHENTICATION                                                   #
########################################################################################################################

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
        return internal_server_error(str(e))
    return JSONResponse(status_code=200, content={"detail": "Sucessful Registration", "uuid": user_id, "session_token": session_token})

@app.post("/api/auth/login")
async def login(credentials: LoginCred):
    try:
        password_hash = await auth_dao.get_password(credentials.email)
        
        if not password_hash:
            return JSONResponse(status_code = 400, content = {"detail": "User not found"})

        authenticated = bcrypt.checkpw(credentials.password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception as e:
        return internal_server_error(str(e))
    
    if authenticated:
        try:
            user_id = await auth_dao.get_uuid(credentials.email) # we already checked if the username exists, don't need to check again
        except Exception as e:
            return internal_server_error(str(e))

        session_token = session_manager.begin_session(user_id)

        return JSONResponse(status_code = 200, content = {"detail": "Successful login", "uuid": user_id, "session_token": session_token})
    else:
        return JSONResponse(status_code = 401, content = {"detail": "Incorrect credentials"})

@app.post("/api/auth/logout")
async def logout(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    session_manager.kill_session(uuid)
    return JSONResponse(status_code = 200, content = {"detail": "Successfully logged out"})

########################################################################################################################
#                                                       PROFILES                                                       #
########################################################################################################################
@app.get("/api/users/me")
async def retrieve_profile(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        user_data = await profiles_dao.retrieve_user(uuid)
    except Exception as e:
        return internal_server_error(str(e))
    
    if not user_data:
        return JSONResponse(status_code = 400, content = {"detail": "User does not exist"})
    return user_data

@app.put("/api/users/me")
async def update_profile(uuid: str, profile: ProfileSchema, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        update_count = await profiles_dao.update_user(uuid, profile.model_dump(exclude_none = True))
    except Exception as e:
        return internal_server_error(str(e))
    if update_count == 0:
        return JSONResponse(status_code = 400, content = {"detail": "User does not exist"})
    return JSONResponse(status_code = 200, content = {"detail": "Successfully updated user"})

@app.delete("/api/users/me")
async def delete_profile(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    del_count = auth_dao.delete_user(uuid) # delete from auth
    if del_count == 0:
        return JSONResponse(status_code = 400, content = {"detail": "User does not exist"})
    
    del_count = profiles_dao.delete_user(uuid) # delete from profiles
    if del_count == 0:
        return JSONResponse(status_code = 400, content = {"detail": "User profile does not exist"})
    
    return JSONResponse(status_code = 200, content = {"detail": "User data successfully deleted"})

########################################################################################################################
#                                                       SKILLS                                                         #
########################################################################################################################
@app.post("/api/skills")
async def add_skill(uuid: str, entry: Skill, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        await skills_dao.add_skill(uuid, entry.model_dump(exclude_none = True))
    except DuplicateKeyError:
        return JSONResponse(status_code = 400, content = {"detail": "Skill already exists"})
    except Exception as e:
        return internal_server_error(str(e))

@app.get("/api/skills")
async def retrieve_skill(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        result = await skills_dao.retrieve_skill(entry_id)
    except Exception as e:
        return internal_server_error(str(e))
    
    if not result:
        return JSONResponse(status_code = 400, content = {"detail": "Skill does not exist"})
    return result

@app.get("/api/skills/me")
async def retrieve_all_skills(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        cursor = await skills_dao.retrieve_all_skills(uuid)
        results = list(cursor)

        if not results:
            return JSONResponse(status_code = 400, content = {"details": "User or skills not available"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return results

@app.put("/api/skills")
async def update_skill(uuid: str, entry_id: str, data: Skill, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        updated_count = await skills_dao.update_skill(entry_id, data.model_dump(exclude_none = True))

        if not updated_count:
            return JSONResponse(status_code = 400, content = {"detail": "Skill does not exist"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return JSONResponse(status_code = 200, content = {"detail": "Successfully updated skill"})

@app.delete("/api/skills")
async def delete_skill(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        del_count = await skills_dao.delete_skill(entry_id)

        if not del_count:
            return JSONResponse(status_code = 400, content = {"detail": "Skill does not exist"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return JSONResponse(status_code = 200, content = {"detail": "Successfully deleted skill"})

########################################################################################################################
#                                                      EDUCATION                                                       #
########################################################################################################################
@app.post("/api/education")
async def add_education(uuid: str, entry: Education, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        await education_dao.add_education(uuid, entry.model_dump(exclude_none = True))
    except DuplicateKeyError:
        return JSONResponse(status_code = 400, content = {"detail": "Education already exists"})
    except Exception as e:
        return internal_server_error(str(e))

@app.get("/api/education")
async def retrieve_education(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        result = await education_dao.retrieve_education(entry_id)
    except Exception as e:
        return internal_server_error(str(e))
    
    if not result:
        return JSONResponse(status_code = 400, content = {"detail": "Education does not exist"})
    return result

@app.get("/api/education/me")
async def retrieve_all_education(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        cursor = await education_dao.retrieve_all_education(uuid)
        results = list(cursor)

        if not results:
            return JSONResponse(status_code = 400, content = {"details": "User or education not available"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return results

@app.put("/api/education")
async def update_education(uuid: str, entry_id: str, data: Education, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        updated_count = await education_dao.update_education(entry_id, data.model_dump(exclude_none = True))

        if not updated_count:
            return JSONResponse(status_code = 400, content = {"detail": "Education does not exist"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return JSONResponse(status_code = 200, content = {"detail": "Successfully updated education"})

@app.delete("/api/education")
async def delete_education(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        del_count = await education_dao.delete_education(entry_id)

        if not del_count:
            return JSONResponse(status_code = 400, content = {"detail": "Education does not exist"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return JSONResponse(status_code = 200, content = {"detail": "Successfully deleted education"})

########################################################################################################################
#                                                      EMPLOYMENT                                                      #
########################################################################################################################
@app.post("/api/employment")
async def add_employment(uuid: str, entry: Employment, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        await employment_dao.add_employment(uuid, entry.model_dump(exclude_none = True))
    except DuplicateKeyError:
        return JSONResponse(status_code = 400, content = {"detail": "Employment already exists"})
    except Exception as e:
        return internal_server_error(str(e))

@app.get("/api/employment")
async def retrieve_employment(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        result = await employment_dao.retrieve_employment(entry_id)
    except Exception as e:
        return internal_server_error(str(e))
    
    if not result:
        return JSONResponse(status_code = 400, content = {"detail": "Employment does not exist"})
    return result

@app.get("/api/employment/me")
async def retrieve_all_employment(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        cursor = await employment_dao.retrieve_all_employment(uuid)
        results = list(cursor)

        if not results:
            return JSONResponse(status_code = 400, content = {"details": "User or employment not available"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return results

@app.put("/api/employment")
async def update_education(uuid: str, entry_id: str, data: Employment, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        updated_count = await employment_dao.update_employment(entry_id, data.model_dump(exclude_none = True))

        if not updated_count:
            return JSONResponse(status_code = 400, content = {"detail": "Employment does not exist"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return JSONResponse(status_code = 200, content = {"detail": "Successfully updated employment"})

@app.delete("/api/employment")
async def delete_employment(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        del_count = await employment_dao.delete_employment(entry_id)

        if not del_count:
            return JSONResponse(status_code = 400, content = {"detail": "Employment does not exist"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return JSONResponse(status_code = 200, content = {"detail": "Successfully deleted employment"})

########################################################################################################################
#                                                       PROJECTS                                                       #
########################################################################################################################
@app.post("/api/projects")
async def add_project(uuid: str, entry: Project, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        await projects_dao.add_project(uuid, entry.model_dump(exclude_none = True))
    except DuplicateKeyError:
        return JSONResponse(status_code = 400, content = {"detail": "Project already exists"})
    except Exception as e:
        return internal_server_error(str(e))

@app.get("/api/projects")
async def retrieve_project(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        result = await projects_dao.retrieve_project(entry_id)
    except Exception as e:
        return internal_server_error(str(e))
    
    if not result:
        return JSONResponse(status_code = 400, content = {"detail": "Project does not exist"})
    return result

@app.get("/api/projects/me")
async def retrieve_all_projects(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        cursor = await projects_dao.retrieve_all_projects(uuid)
        results = list(cursor)

        if not results:
            return JSONResponse(status_code = 400, content = {"details": "User or projects not available"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return results

@app.put("/api/projects")
async def update_project(uuid: str, entry_id: str, data: Project, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        updated_count = await projects_dao.update_project(entry_id, data.model_dump(exclude_none = True))

        if not updated_count:
            return JSONResponse(status_code = 400, content = {"detail": "Project does not exist"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return JSONResponse(status_code = 200, content = {"detail": "Successfully updated project"})

@app.delete("/api/projects")
async def delete_project(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        del_count = await projects_dao.delete_project(entry_id)

        if not del_count:
            return JSONResponse(status_code = 400, content = {"detail": "Project does not exist"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return JSONResponse(status_code = 200, content = {"detail": "Successfully deleted project"})

########################################################################################################################
#                                                     CERTIFICATION                                                    #
########################################################################################################################
@app.post("/api/certifications")
async def add_certification(uuid: str, entry: Certification, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        await certifications_dao.add_cert(uuid, entry.model_dump(exclude_none = True))
    except DuplicateKeyError:
        return JSONResponse(status_code = 400, content = {"detail": "Certification already exists"})
    except Exception as e:
        return internal_server_error(str(e))

@app.get("/api/certifications")
async def retrieve_certification(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        result = await certifications_dao.retrieve_cert(entry_id)
    except Exception as e:
        return internal_server_error(str(e))
    
    if not result:
        return JSONResponse(status_code = 400, content = {"detail": "Certification does not exist"})
    return result

@app.get("/api/certifications/me")
async def retrieve_all_certifications(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        cursor = await certifications_dao.retrieve_all_certs(uuid)
        results = list(cursor)

        if not results:
            return JSONResponse(status_code = 400, content = {"details": "User or certifications not available"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return results

@app.put("/api/certifications")
async def update_certification(uuid: str, entry_id: str, data: Certification, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        updated_count = await certifications_dao.update_cert(entry_id, data.model_dump(exclude_none = True))

        if not updated_count:
            return JSONResponse(status_code = 400, content = {"detail": "Certification does not exist"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return JSONResponse(status_code = 200, content = {"detail": "Successfully updated certification"})

@app.delete("/api/certifications")
async def delete_certification(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        del_count = await certifications_dao.delete_certification(entry_id)

        if not del_count:
            return JSONResponse(status_code = 400, content = {"detail": "Certification does not exist"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return JSONResponse(status_code = 200, content = {"detail": "Successfully deleted certification"})
