import secrets
from typing import Any

class SessionManager:
    def __init__(self):
        self.sessions: dict[str, dict[str, Any]] = {}

    def authenticate_session(self, uuid: str, usid: str) -> bool:
        return uuid in self.sessions and usid == self.sessions[uuid]["token"]

    def begin_session(self, uuid: str) -> str:
        self.sessions[uuid] = {
            "token": secrets.token_urlsafe(32),
            # "expiry": ... # expiry unused for now
        }
        return self.sessions[uuid]["token"]

    def kill_session(self, uuid: str) -> bool:
        return bool(self.sessions.pop(uuid, False))

    def clean_sessions(self):
        pass # for wiping all sessions in one go, not required as of now

session_manager = SessionManager()