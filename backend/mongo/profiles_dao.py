from mongo.dao_setup import db_client, PROFILES

class UserDataDAO:
    def __init__(self):
        self.collection = db_client.get_collection(PROFILES)

    async def add_profile(self, uuid: str, data: dict) -> str:
        result = await self.collection.insert_one({"_id": uuid, **data})
        return result.inserted_id

    async def get_profile(self, uuid: str) -> dict | None:
        return await self.collection.find_one({"_id": uuid})
    
    async def update_profile(self, uuid, data: dict) -> int:
        updated = await self.collection.update_one({"_id": uuid}, {"$set": data})
        return updated.matched_count

    async def delete_profile(self, uuid: str) -> int:
        result = await self.collection.delete_one({"_id": uuid})
        return result.deleted_count

profiles_dao = UserDataDAO()