from mongo.dao_setup import db_client, USER_AUTH_COLLECTION

import bcrypt
from datetime import datetime

class UserAuthenticationDAO:
    def __init__(self):
        self.collection = db_client.get_collection(USER_AUTH_COLLECTION)

    async def register_user(self, uuid: str, username: str, password: str) -> bool:
        body = {
            "_id": uuid,
            "username": username,
            "password": bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
            "date_created": datetime.now()
        }
        await self.collection.insert_one(body)

    async def get_password(self, username: str) -> bool:
        user_data = await self.collection.find_one({"username": username})
        if user_data:
            return user_data["password"]
        else:
            return None

user_auth_dao = UserAuthenticationDAO()