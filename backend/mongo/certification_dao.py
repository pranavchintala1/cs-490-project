from mongo.dao_setup import db_client, CERTIFICATION

class CertDAO:
    def __init__(self):
        self.collection = db_client.get_collection(CERTIFICATION)

    async def add_cert(self, data: dict):
        return await self.collection.insert_one(data)

    async def retrieve_all_certs(self, uuid: str): # all projects
        return await self.collection.find({"user_id": uuid})

    async def retrieve_cert(self, entry_id: str): # one project
        return await self.collection.find({"_id": entry_id})

    async def update_cert(self, entry_id: str, data: dict):
        updated = await self.collection.update_one({"_id": entry_id}, {"$set": data})
        return updated.matched_count

    async def delete_cert(self, entry_id: str):
        result = await self.collection.delete_one({"_id": entry_id})
        return result.deleted_count

certifications_dao = CertDAO()