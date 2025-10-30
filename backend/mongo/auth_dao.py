from mongo.dao_setup import db_client, AUTH

import bcrypt
from datetime import datetime

class UserAuthenticationDAO:
    def __init__(self):
        self.collection = db_client.get_collection(AUTH)

    async def register_user(self, uuid: str, username: str, email: str, password: str):
        body = {
            "_id": uuid,
            "username": username,
            "email": email,
            "password": bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
            "date_created": datetime.now()
        }
        await self.collection.insert_one(body)

    async def get_password(self, email: str) -> str | None:
        user_data = await self.collection.find_one({"email": email})
        if user_data:
            return user_data["password"]
        else:
            return None
        
    async def get_uuid(self, email: str) -> str | None:
        result = await self.collection.find_one({"email": email})
        return result["_id"] if result else None
    
    async def delete_user(self, uuid: str):
        result = await self.collection.delete_one({"_id": uuid})
        return result.deleted_count

auth_dao = UserAuthenticationDAO()