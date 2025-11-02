from fastapi import APIRouter, Body, Header, Form
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse

from pymongo.errors import DuplicateKeyError

from uuid import uuid4
import bcrypt
import datetime

from google.oauth2 import id_token
from google.auth.transport import requests
from google.auth.exceptions import GoogleAuthError

from mongo.auth_dao import auth_dao
from mongo.profiles_dao import profiles_dao
from mongo.forgotPassword import ForgotPassword
from sessions.session_manager import session_manager
from schema import RegistInfo, LoginCred

auth_router = APIRouter("/auth")

@auth_router.post("/register")
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
        return HTTPException(status_code = 400, detail = f"Something went wrong {str(e)}")
    return JSONResponse(status_code=200, content={"detail": "Sucessful Registration", "uuid": user_id, "session_token": session_token})

@auth_router.post("/login")
async def login(credentials: LoginCred):
    try:
        password_hash = await auth_dao.get_password(credentials.email)
        
        if not password_hash:
            return JSONResponse(status_code = 400, content = {"detail": "Invalid email"})

        authenticated = bcrypt.checkpw(credentials.password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception as e:
        return HTTPException(status_code = 400, detail = f"Something went wrong {str(e)}")
    
    if authenticated:
        try:
            user_id = await auth_dao.get_uuid(credentials.email)
        except Exception as e:
            return HTTPException(status_code = 400, detail = f"Something went wrong {str(e)}")

        session_token = session_manager.begin_session(user_id)

        return JSONResponse(status_code = 200, content = {"detail": "Successful login", "uuid": user_id, "session_token": session_token})
    else:
        return JSONResponse(status_code = 401, content = {"detail": "Invalid email or password"})

@auth_router.post("/logout")
async def logout(data: dict = Body(...), authorization: str = Header(...)):
    uuid = data.get("uuid")
    if not session_manager.authenticate_session(uuid, authorization.removeprefix("Bearer ").strip()) and session_manager.kill_session(uuid):
        return JSONResponse(status_code = 401, content = {"detail": "Invalid session"}) # successfully auth and kill session before proceeding
    
    session_manager.kill_session(uuid)
    return JSONResponse(status_code = 200, content = {"detail": "Successfully logged out"})
@auth_router.post("/forgotpassword")
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
    
    
@auth_router.get("/resetpassword")
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
    

@auth_router.put("/user/updatepassword")
async def updatePassword(token: str = Body(...),password: str = Body(...)):

    try:
        old_data = await profiles_dao.retrieve_user(token)
        old_data["password"] = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        await auth_dao.update_password(token,old_data)
        session_token = session_manager.begin_session(token)
    except Exception as e:

        return JSONResponse(status_code = 500, content = {"detail": f"Something went wrong {str(e)}"})
    return JSONResponse(status_code=200, content={"detail": "Sucessful Registration","uuid":token, "session_token": session_token})



@auth_router.post("/verify-google-token")
async def verify_google_token(token: dict = Body(...)):

    credentials = token.get("credential")
    try:

        idinfo = id_token.verify_oauth2_token(credentials, requests.Request()) # returns user data such as email and profile picture

        data = await auth_dao.get_uuid(idinfo["email"]) # this returns a uuid

        if (data): # if the user already exists, still log in because it doesn't matter.
            uuid = data
        else:

            uuid = str(uuid4())
            idinfo["username"] = idinfo["email"]
            await auth_dao.register_user(uuid,idinfo["email"],idinfo["email"],"")
    
            await profiles_dao.register_user(uuid, idinfo)
        
        session_token = session_manager.begin_session(uuid)

        return {
            "detail": "success",
            "uuid":uuid,
            "session_token": session_token
        }

    except ValueError:
        return HTTPException(status_code=400, detail = "invalid token")

    except GoogleAuthError as e:
        return HTTPException(status_code=401, detail = f"Google auth failed: {str(e)}")

    except Exception as e:
        return HTTPException(status_code=500, detail = f"Unknown Error while authenticating: {str(e)}")
    