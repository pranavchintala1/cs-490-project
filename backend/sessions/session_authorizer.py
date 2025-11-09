from fastapi import Header, HTTPException
from sessions.session_manager import session_manager

async def authorize(uuid: str = Header(...), authorization: str = Header(...)):
    if authorization.startswith("Bearer ") and session_manager.authenticate_session(uuid, authorization.removeprefix("Bearer ").strip()):
        return uuid
    else:
        raise HTTPException(401, "Invalid session")