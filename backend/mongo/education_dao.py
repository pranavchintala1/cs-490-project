from mongo.dao_setup import db_client, EDUCATION

class EducationDAO:
    def __init__(self):
        self.collection = db_client.get_collection(EDUCATION)

    async def add_education(self, data: dict):
        return await self.collection.insert_one(data)

    async def retrieve_all_education(self, uuid: str):
        return self.collection.find({"user_id": uuid})

    async def retrieve_education(self, entry_id: str):
        return await self.collection.find({"_id": entry_id})

    async def update_education(self, entry_id: str, data: dict):
        updated = await self.collection.update_one({"_id": entry_id}, {"$set": data})
        return updated.matched_count

    async def delete_education(self, entry_id: str):
        result = await self.collection.delete_one({"_id": entry_id})
        return result.deleted_count

education_dao = EducationDAO()