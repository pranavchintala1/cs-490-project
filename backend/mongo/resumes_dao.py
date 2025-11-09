from mongo.dao_setup import db_client, RESUMES
from datetime import datetime, timezone
from bson import ObjectId

class ResumeDAO:
    def __init__(self):
        self.collection = db_client.get_collection(RESUMES)

    async def add_resume(self, data: dict) -> str:
        time = datetime.now(timezone.utc)
        data["date_created"] = time
        data["date_updated"] = time
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get_all_resumes(self, uuid: str) -> list[dict]:
        cursor = self.collection.find({"uuid": uuid})
        results = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results

    async def get_resume(self, resume_id: str) -> dict | None:
        return await self.collection.find_one({"_id": ObjectId(resume_id)})

    async def update_resume(self, resume_id: str, data: dict) -> int:
        data["date_updated"] = datetime.now(timezone.utc)
        updated = await self.collection.update_one({"_id": ObjectId(resume_id)}, {"$set": data})
        return updated.matched_count

    async def delete_resume(self, resume_id: str) -> int:
        result = await self.collection.delete_one({"_id": ObjectId(resume_id)})
        return result.deleted_count

resumes_dao = ResumeDAO()