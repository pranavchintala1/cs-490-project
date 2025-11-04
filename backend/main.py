from fastapi import FastAPI, Header, Body, UploadFile, Form, File, Request
from fastapi.responses import JSONResponse, Response, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from datetime import datetime, timedelta
import bcrypt, zipfile, base64
from io import BytesIO


from mongo.profiles_dao import profiles_dao
from mongo.auth_dao import auth_dao
from mongo.skill_dao import skills_dao
from mongo.project_dao import projects_dao
from mongo.employment_dao import employment_dao
from mongo.education_dao import education_dao
from mongo.certification_dao import certifications_dao
from mongo.forgotPassword import ForgotPassword
from sessions.session_manager import session_manager
from pymongo.errors import DuplicateKeyError, WriteError
import bcrypt
import os

from google.oauth2 import id_token
from google.auth.transport import requests
from google.auth.exceptions import GoogleAuthError

import httpx
from jose import jwt, JWTError

from schema import RegistInfo, LoginCred, Education, Employment, Project, Skill, Certification

app = FastAPI()

def parse_bearer(auth_header: str = Header(..., alias="Authorization")):
    return auth_header.removeprefix("Bearer ").strip()

app = FastAPI()

origins = [ # domains to provide access to
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",

]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      
    allow_credentials=True,
    allow_methods=["*"],         
    allow_headers=["*"],         
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
        print(str(e))
        return internal_server_error(str(e))
    return JSONResponse(status_code=200, content={"detail": "Sucessful Registration", "uuid": user_id, "session_token": session_token})

@app.post("/api/auth/login")
async def login(credentials: LoginCred):
    try:
        password_hash = await auth_dao.get_password(credentials.email)
        
        if not password_hash:
            return JSONResponse(status_code = 400, content = {"detail": "Invalid email or password"})

        authenticated = bcrypt.checkpw(credentials.password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception as e:
        return internal_server_error(str(e))
    
    if authenticated:
        try:
            user_id = await auth_dao.get_uuid(credentials.email)
        except Exception as e:
            return internal_server_error(str(e))

        session_token = session_manager.begin_session(user_id)

        return JSONResponse(status_code = 200, content = {"detail": "Successful login", "uuid": user_id, "session_token": session_token})
    else:
        return JSONResponse(status_code = 401, content = {"detail": "Invalid email or password"})

@app.post("/api/auth/logout")
async def logout(data: dict = Body(...), auth: str = Header(..., alias = "Authorization")):
    uuid = data.get("uuid")
    if not session_auth(uuid, auth) and session_manager.kill_session(uuid):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"}) # successfully auth and kill session before proceeding
    
    session_manager.kill_session(uuid)
    return JSONResponse(status_code = 200, content = {"detail": "Successfully logged out"})
@app.post("/api/auth/forgotpassword")
async def forgotPassword(email: str = Body(..., embed=True)):

    exists = await auth_dao.get_uuid(email)

    try:
        if exists:
            fp = ForgotPassword() # ugly naming scheme fix later.
            token = fp.send_email(email)
            uuid = str(uuid4())
            await fp.store_link(uuid,email,token)
            return True
    except Exception as e:
        print(e)
        return None
    
    
@app.get("/api/auth/resetpassword")
async def resetPassword(token: str):
    fp = ForgotPassword()
    uuid,expires = await fp.verify_link(token)
    try:
        if (uuid):
            if(datetime.now() < expires ): # The link is still valid.
                return JSONResponse(status_code = 200, content = {"uuid": uuid})
    except Exception as e:
        print(e)
        return None
    

@app.put("/api/user/updatepassword")
async def updatePassword(token: str = Body(...),password: str = Body(...)):

    try:
        old_data = await profiles_dao.retrieve_user(token)
        old_data["password"] = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        await auth_dao.update_password(token,old_data)
        session_token = session_manager.begin_session(token)
    except Exception as e:

        return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong {str(e)}"})
    return JSONResponse(status_code=200, content={"detail": "Sucessful Registration","uuid":token, "session_token": session_token})



@app.post("/api/auth/verify-google-token")
async def verify_google_token(token: dict = Body(...)):

    credentials = token.get("credential")
    try:

        GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

        idinfo = id_token.verify_oauth2_token(credentials, requests.Request(),GOOGLE_CLIENT_ID) # returns user data such as email and profile picture

        data = await auth_dao.get_uuid(idinfo["email"]) # this returns a uuid

        #SEMI-IMPORTANT ---> If a user exists in profiles, but not auth, it will throw an error. I don't think
        # I need to account for this, since this shouldn't ever happen, but I'm making a note of it here.

        if (data): # if the user already exists, still log in because it doesn't matter.
            uuid = data
        else:

            uuid = str(uuid4())
            idinfo["username"] = idinfo["email"]
            await auth_dao.register_user(uuid,idinfo["email"],idinfo["email"],"")
    
            await profiles_dao.register_user(uuid, idinfo)
        
        session_token = session_manager.begin_session(uuid)

        return JSONResponse(status_code = 200,content={"detail": "success","uuid":uuid,"session_token": session_token})

    except ValueError:
        
        return JSONResponse(status_code=400, content={"detail":"invalid token"})

    except GoogleAuthError as e:
      
        return JSONResponse(status_code=401, content={"detail":f"Google auth failed: {str(e)}"})

    except Exception as e:
        print(e)
        print("look up")

        return JSONResponse(status_code=500, content={"detail":f"Unknown Error while authenticating: {str(e)}"})
    
@app.put("/api/login/microsoft")
async def verify_microsoft_token(request: Request):

    MICROSOFT_ISSUER = os.getenv("MICROSOFT_ISSUER")
    MICROSOFT_KEYS_URL = os.getenv("MICROSOFT_KEYS_URL")
    MICROSOFT_CLIENT_ID = os.getenv("MICROSOFT_CLIENT_ID")

    data = await request.json()
    token = data.get("token")

    if not token:
        return JSONResponse(status_code=400, content={"detail": "Missing token"})

    async with httpx.AsyncClient() as client:
        jwks_resp = await client.get(MICROSOFT_KEYS_URL)
        if jwks_resp.status_code != 200:
            return JSONResponse(status_code=500, content={"detail": "Could not fetch Microsoft keys"})

        jwks = jwks_resp.json()

    try:
        header = jwt.get_unverified_header(token)
        key = next((k for k in jwks["keys"] if k["kid"] == header["kid"]), None)
        if not key:
            return JSONResponse(status_code=400, content={"detail": "Key not found"})

        claims = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=MICROSOFT_CLIENT_ID,
            issuer=MICROSOFT_ISSUER,
        )
    except JWTError as e:
        print(e)
        return JSONResponse(status_code=401, content={"detail": f"Invalid token: {e}"})

    email = claims.get("email") or claims.get("preferred_username")
    claims["username"] = email # neccesary so register_user doesn't throw a fit.
    name = claims.get("name")
    sub = claims.get("sub")

    data = await auth_dao.get_uuid(email)  # this returns a uuid

    if data:  # if the user already exists, still log in because it doesn't matter.
        uuid = data
    else:
        uuid = str(uuid4())
        await auth_dao.register_user(uuid, email, email, "")
        await profiles_dao.register_user(uuid, claims)

    if not email:
        return JSONResponse(status_code=400, content={"detail": "Email not found in token"})

    session_token = session_manager.begin_session(uuid)

    return JSONResponse(
        status_code=200,
        content={"detail": "success", "uuid": uuid, "session_token": session_token},
    )
########################################################################################################################
#                                                       PROFILES                                                       #
########################################################################################################################
@app.get("/api/users/me")
async def retrieve_profile(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        user_data = await profiles_dao.retrieve_user(uuid)

        if user_data:
            if "_id" in user_data:
                user_data["_id"] = str(user_data["_id"])
            if "date_created" in user_data and user_data["date_created"]:
                user_data["date_created"] = user_data["date_created"].isoformat()
            if "date_updated" in user_data and user_data["date_updated"]:
                user_data["date_updated"] = user_data["date_updated"].isoformat()
    except Exception as e:
        return internal_server_error(str(e))

    if not user_data:
        return JSONResponse(status_code = 400, content = {"detail": "User does not exist"})
    return user_data

@app.get("/api/users/me/image")
async def retrieve_profile_picture(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        user_data = await profiles_dao.retrieve_user(uuid)
        picture = user_data["profile_image"]
        pic_type = user_data["image_type"]
        pic_name = user_data["image_name"]
    except Exception as e:
        return internal_server_error(str(e))
    
    if not picture:
        return JSONResponse(status_code = 400, content = {"detail": "Profile picture does not exist"})
    return StreamingResponse(BytesIO(picture), media_type = pic_type, headers = {"Content-Disposition": f"inline; filename={pic_name}"})

@app.put("/api/users/me")
async def update_profile(
    uuid: str,
    pfp: UploadFile = File(None), 
    auth: str = Header(..., alias = "Authorization"),
    username: str = Form(None, alias = "username"),
    email: str = Form(None, alias = "email"),
    full_name: str = Form(None, alias = "full_name"),
    phone_number: str = Form(None, alias = "phone_number"),
    address: str = Form(None, alias = "address"),
    title: str = Form(None, alias = "title"),
    biography: str = Form(None, alias = "biography"),
    industry: str = Form(None, alias = "industry"),
    experience_level: str = Form(None, alias = "experience_level")
    ):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        # Build parsed_data without None values for unmodified fields
        parsed_data = {
            "username": username,
            "email": email,
            "full_name": full_name,
            "phone_number": phone_number,
            "address": address,
            "title": title,
            "biography": biography,
            "industry": industry,
            "experience_level": experience_level,
        }

        # Only include profile image fields if a file was uploaded
        if pfp:
            file_content = await pfp.read()
            # Encode binary content as base64 for MongoDB storage
            base64_content = base64.b64encode(file_content).decode("utf-8")
            parsed_data["profile_image"] = base64_content
            parsed_data["image_type"] = pfp.content_type
            parsed_data["image_name"] = pfp.filename
            print(f"[DEBUG] Image uploaded: size={len(file_content)} bytes, base64_size={len(base64_content)} bytes")

        update_count = await profiles_dao.update_user(uuid, parsed_data)
    except Exception as e:
        return internal_server_error(str(e))
    if update_count == 0:
        return JSONResponse(status_code = 400, content = {"detail": "User does not exist"})

  
    try:
        updated_profile = await profiles_dao.retrieve_user(uuid)
        #convert to string
        if updated_profile:
            if "_id" in updated_profile:
                updated_profile["_id"] = str(updated_profile["_id"])
            if "date_created" in updated_profile and updated_profile["date_created"]:
                updated_profile["date_created"] = updated_profile["date_created"].isoformat()
            if "date_updated" in updated_profile and updated_profile["date_updated"]:
                updated_profile["date_updated"] = updated_profile["date_updated"].isoformat()
        print(f"[DEBUG] Returning profile with image: {'profile_image' in updated_profile and updated_profile['profile_image'] is not None}")
        return JSONResponse(status_code = 200, content = updated_profile)
    except Exception as e:
        # If we can't fetch the updated profile, at least return success
        print(f"[DEBUG] Error fetching updated profile: {str(e)}")
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
        parsed_data = entry.model_dump()
        parsed_data["_id"] = str(uuid4())
        parsed_data["user_id"] = uuid

        await skills_dao.add_skill(parsed_data)
    except DuplicateKeyError:
        return JSONResponse(status_code = 400, content = {"detail": "Skill already exists"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return JSONResponse(status_code = 200, content = {"detail": "Successfully added skill", "entry_id": parsed_data["_id"]})

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
        results = await cursor.to_list(None)

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
        parsed_data = entry.model_dump()
        parsed_data["_id"] = str(uuid4())
        parsed_data["user_id"] = uuid

        await education_dao.add_education(parsed_data)
    except DuplicateKeyError:
        return JSONResponse(status_code = 400, content = {"detail": "Education already exists"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return JSONResponse(status_code = 200, content = {"detail": "Successfully added education", "entry_id": parsed_data["_id"]})

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
        results = await cursor.to_list(None)

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
        parsed_data = entry.model_dump()
        parsed_data["_id"] = str(uuid4())
        parsed_data["user_id"] = uuid

        await employment_dao.add_employment(parsed_data)
    except DuplicateKeyError:
        return JSONResponse(status_code = 400, content = {"detail": "Employment already exists"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return JSONResponse(status_code = 200, content = {"detail": "Successfully added employment", "entry_id": parsed_data["_id"]})

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
        results = await cursor.to_list(None)

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
async def add_project(
    uuid: str,
    media: list[UploadFile] = File(None), 
    auth: str = Header(..., alias = "Authorization"),
    project_name: str = Form(..., alias = "project_name"),
    description: str = Form(None, alias = "description"),
    role: str = Form(None, alias = "role"),
    start_date: str = Form(None, alias = "start_date"),
    end_date: str = Form(None, alias = "end_date"),
    skills: list[str] = Form(None, alias = "skills"),
    team_size: int = Form(None, alias = "team_size"),
    details: str = Form(None, alias = "details"),
    achievements: str = Form(None, alias = "achievements"),
    industry: str = Form(None, alias = "industry"),
    status: str = Form(None, alias = "status")
    ):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        ready_media = {}
        if media:
            for file in media:
                contents = await file.read()
                ready_media[file.filename()] = contents
        
        parsed_data = {
            "_id": str(uuid4()),
            "user_id": uuid,
            "project_name": project_name,
            "description": description,
            "role": role,
            "start_date": start_date,
            "end_date": end_date,
            "skills": skills,
            "details": details,
            "team_size": team_size,
            "achievements": achievements,
            "industry": industry,
            "status": status,
            "media": ready_media,
        }

        await projects_dao.add_project(parsed_data)
    except DuplicateKeyError:
        return JSONResponse(status_code = 400, content = {"detail": "Project already exists"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return JSONResponse(status_code = 200, content = {"detail": "Successfully added projects", "entry_id": parsed_data["_id"]})

@app.get("/api/projects/media")
async def download_project_media(uuid: str, entry_id: str, filename: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        result = await projects_dao.retrieve_project(entry_id)
        if not result and not result["media"]:
            return JSONResponse(status_code = 400, content = {"detail": "Media not found"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return Response(content = result["media"][filename], media_type = "application/octet-stream", headers = {"Content-Disposition": f"attachment; filename={filename}"})

@app.get("/api/projects/media/all")
async def download_all_project_media(uuid: str, entry_id, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        result = projects_dao.retrieve_project(entry_id)
    except Exception as e:
        return internal_server_error(str(e))
    
    if not result and not result["media"]:
        return JSONResponse(status_code = 400, content = {"detail": "Project and associated media do not exist"})
    
    buffer = BytesIO()
    files = result["media"]
    with zipfile.ZipFile(buffer, "w") as zf:
        for filename in files:
            zf.writestr(filename, files[filename])

    buffer.seek(0)
    return StreamingResponse(content = buffer, media_type = "application/zip", headers = {"Content-Disposition": "attachment; filename=media.zip"})


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
        results = await cursor.to_list(None)

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
async def add_certification(
    uuid: str, 
    document: UploadFile = File(None), 
    auth: str = Header(..., alias = "Authorization"),
    name: str = Form(..., alias = "name"),
    issuer: str = Form(None, alias = "issuer"),
    date_earned: str = Form(None, alias = "date_earned"),
    date_expiry: str = Form(None, alias = "date_expiry"),
    cert_number: str = Form(None, alias = "cert_number"),
    category: str = Form(None, alias = "category"),
    position: str = Form(None, alias = "position"),
    verified: bool = Form(False, alias = "verified"),
    document_name: str = Form(None, alias = "document_name")
    ):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        if document:
            contents = await document.read()

        parsed_data = {
            "_id": str(uuid4()),
            "user_id": uuid,
            "name": name,
            "issuer": issuer,
            "date_earned": date_earned,
            "date_expiry": date_expiry,
            "cert_number": cert_number,
            "category": category,
            "position": position,
            "verified": verified,
            "document_name": document_name,
            "document": contents
        }

        await certifications_dao.add_cert(parsed_data)
    except DuplicateKeyError:
        return JSONResponse(status_code = 400, content = {"detail": "Certification already exists"})
    except Exception as e:
        return internal_server_error(str(e))
    
    return JSONResponse(status_code = 200, content = {"detail": "Successfully added certifications", "entry_id": parsed_data["_id"]})

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

@app.get("/api/certifications/media")
async def download_cert_media(uuid: str, entry_id: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        result = await certifications_dao.retrieve_cert(entry_id)
        if not result and not result["document"]:
            return JSONResponse(status_code = 400, content = {"detail": "Certification and associated media not found"})
    except Exception as e:
        return internal_server_error(str(e))
    filename = result["document_name"]
    return Response(content = result["document"], media_type = "application/octet-stream", headers = {"Content-Disposition": f"attachment; filename={filename}"})

@app.get("/api/certifications/me")
async def retrieve_all_certifications(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if not session_auth(uuid, auth):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})
    
    try:
        cursor = await certifications_dao.retrieve_all_certs(uuid)
        results = await cursor.to_list(None)

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
