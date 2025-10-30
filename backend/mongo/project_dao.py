from mongo.dao_setup import db_client, PROJECTS

class ProjectDAO:
    def __init__(self):
        self.collection = db_client.get_collection(PROJECTS)

    async def add_project(self, uuid, data: dict):
        return await self.collection.insert_one(data)

    async def retrieve_all_projects(self, uuid: str):
        return await self.collection.find({"uuid": uuid})

    async def retrieve_project(self, entry_id: str):
        return await self.collection.find({"uuid": entry_id})

    async def update_project(self, entry_id: str, data: dict):
        updated = await self.collection.update_one({"_id": entry_id}, {"$set": data})
        return updated.matched_count

    async def delete_project(self, entry_id: str):
        result = await self.collection.delete_one({"_id": entry_id})
        return result.deleted_count

project_dao = ProjectDAO()