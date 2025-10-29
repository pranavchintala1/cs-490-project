from mongo.dao_setup import db_client, SKILLS

class SkillDAO:
    def __init__(self):
        self.collection = db_client.get_collection(SKILLS)
    
    async def add_skill(self, uuid, data: dict):
        return await self.collection.insert_one(data)

    async def retrieve_skills(self, uuid: str): # all skills
        return await self.collection.find({"uuid": uuid})
    
    async def retrieve_skill(self, entry_id: str): # one skill
        return await self.collection.find_one({"uuid": entry_id})

    async def update_skill(self, entry_id, data: dict):
        updated = await self.collection.update_one({"_id": entry_id}, {"$set": data})
        return updated.matched_count

    async def delete_skill(self, entry_id):
        result = await self.collection.delete_one({"_id": entry_id})
        return result.deleted_count
    
skill_dao = SkillDAO()