from mongo.dao_setup import db_client, EMPLOYMENT

class EmploymentDAO:
    def __init__(self):
        self.collection = db_client.get_collection(EMPLOYMENT)

    async def add_employment(self, data: dict):
        return await self.collection.insert_one(data)

    async def retrieve_all_employment(self, uuid: str):
        return self.collection.find({"user_id": uuid})

    async def retrieve_employment(self, entry_id: str):
        return await self.collection.find({"_id": entry_id})

    async def update_employment(self, entry_id: str, data: dict):
        updated = await self.collection.update_one({"_id": entry_id}, {"$set": data})
        return updated.matched_count

    async def delete_employment(self, entry_id: str):
        result = await self.collection.delete_one({"_id": entry_id})
        return result.deleted_count

employment_dao = EmploymentDAO()