from backend.mongo.dao_setup import db_client, USER_DATA_COLLECTION

from datetime import datetime

class UserDataDAO:
    def __init__(self):
        self.collection = db_client.get_collection(USER_DATA_COLLECTION)

    async def register_user(self, uuid: str, data: dict):
        return await self.collection.insert_one({
            "_id": uuid,
            "username": data["username"], # dict.get --> None if non-existent 
            "email": data["email"],       # dict["key"] --> must exist or KeyErrorException
            "full_name": data.get("name"), # first + last (can split if necessary)
            "phone_number": data.get("phone_number"),
            "address": data.get("address"), # home address
            "title": None, # job/career title i.e. student, engineer, etc.
            "biography": None, # 500 char limit
            "industry": None,
            "exp_level": None, # intern, junior, senior, etc.
            "profile_image": None, # url?
            "date_created": datetime.now(),
            "date_updated": datetime.now()
        })

    async def retrieve_user(self, uuid: str) -> dict | None:
        return await self.collection.find_one({"_id": uuid})
    
    async def update_user(self, uuid, data: dict):
        updated = await self.collection.update_one({"_id": uuid}, {"$set": data})
        return updated.matched_count

    async def delete_user(self, uuid: str) -> int:
        return await self.collection.delete_one({"_id": uuid})

user_data_dao = UserDataDAO()