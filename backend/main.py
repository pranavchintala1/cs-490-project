from fastapi import FastAPI,Header,Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from datetime import datetime, timedelta
import bcrypt

from mongo.user_data_dao import user_data_dao
from mongo.user_auth_dao import user_auth_dao
from sessions.session_manager import session_manager
from pymongo.errors import DuplicateKeyError, WriteError
import bcrypt

from google.oauth2 import id_token
from google.auth.transport import requests
from google.auth.exceptions import GoogleAuthError

from mongo.forgotPassword import ForgotPassword

from schema import RegistInfo, LoginCred, ProfileSchema, Education, Employment, Project, Skill

app = FastAPI()

def parse_bearer(auth_header: str = Header(..., alias="Authorization")):
    return auth_header.removeprefix("Bearer ").strip()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      
    allow_credentials=True,
    allow_methods=["*"],         
    allow_headers=["*"],         
)

@app.post("/api/auth/register")
async def register(regist_info: RegistInfo):
    try:
        uuid = str(uuid4())
        # create auth entry
        await user_auth_dao.register_user(uuid,regist_info.username, regist_info.email, regist_info.password)

        # create data entry
        await user_data_dao.register_user(uuid, regist_info.model_dump(exclude_none = True))

        session_token = session_manager.begin_session(uuid)
        

    except DuplicateKeyError:
        return JSONResponse(status_code = 400, content = {"detail": "User already exists"})
    except Exception as e:
        return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong {str(e)}"})
    return JSONResponse(status_code=200, content={"detail": "Sucessful Registration", "uuid": uuid,"session_token":session_token})

@app.post("/api/auth/login")
async def login(credentials: LoginCred):
    try:
        password_hash = await user_auth_dao.get_password(credentials.email)
        
        if not password_hash:
            return JSONResponse(status_code = 400, content = {"detail": "Invalid email or password."})

        authenticated = bcrypt.checkpw(credentials.password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception as e:
        return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong {str(e)}"}) # could pose security risk
    
    if authenticated:
        try:
            user_id = await user_auth_dao.get_uuid(credentials.email) # we already checked if the username exists, don't need to check again
        except Exception as e:
            return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong: {str(e)}"})

        session_token = session_manager.begin_session(user_id)

        return JSONResponse(status_code = 200, content = {"detail": "Successful login","uuid":user_id, "session_token": session_token})
    else:
        return JSONResponse(status_code = 401, content = {"detail": "Invalid email or password."})

@app.post("/api/auth/logout")
async def logout(uuid: str, auth: str = Header(..., alias = "Authorization")):
    if session_manager.authenticate_session(uuid, parse_bearer(auth)) and session_manager.kill_session(uuid): # successfully auth and kill session before proceeding
        return JSONResponse(status_code = 200, content = {"detail": "Successfully logged out"})
    return JSONResponse(status_code = 401, content = {"detail": "Invalid session"})

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
    
@app.post("/api/auth/forgotpassword")
async def forgotPassword(email: str = Body(..., embed=True)):


    exists = await user_auth_dao.get_uuid(email)

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
            print("uuid is good")
            print(datetime.now())
            print(expires)
            if(datetime.now() < expires ): # The link is still valid.
                return JSONResponse(status_code = 200, content = {"uuid": uuid})
    except Exception as e:
        print(e)
        return None
    

@app.put("/api/user/updatepassword")
async def updatePassword(data):
    uuid = data.uuid
    newPass = data.password

    try:
        old_data = user_auth_dao.retieve_user(uuid)
        old_data["password"] = bcrypt.hashpw(newPass.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        user_data_dao.update_user(uuid,data)
        session_token = session_manager.begin_session(uuid)
    except Exception as e:
        return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong {str(e)}"})
    return JSONResponse(status_code=200, content={"detail": "Sucessful Registration","uuid":uuid, "session_token": session_token})



@app.post("/api/auth/verify-google-token")
async def verify_google_token(token: str = Body(...)):
    try:
        uuid = str(uuid4())

        idinfo = id_token.verify_oauth2_token(token, requests.Request()) # returns user data such as email and profile picture

        data = user_auth_dao.get_uuid(idinfo["email"])

        if (data): # if the user already exists, still log in because it doesn't matter.
            uuid = data["_id"]
        else:
            await user_data_dao.register_user(uuid, idinfo.model_dump(exclude_none = True))
        
        session_token = session_manager.begin_session(uuid)

        return JSONResponse(status_code = 200,content={"detail": "success","uuid":uuid,"session_token": session_token})

    except ValueError:
        
        return JSONResponse(status_code=400, content={"detail":"invalid token"})

    except GoogleAuthError as e:
      
        return JSONResponse(status_code=401, content={"detail":f"Google auth failed: {str(e)}"})

    except Exception as e:

        return JSONResponse(status_code=500, content={"detail":f"Unknown Error while authenticating: {str(e)}"})
    