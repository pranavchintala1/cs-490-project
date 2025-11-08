from datetime import datetime, timezone
from bson.objectid import ObjectId
from mongo.dao_setup import db_client, RESUMES


class ResumeDAO:
    """Data Access Object for Resume operations"""

    def __init__(self):
        self.collection = db_client.get_collection(RESUMES)

    async def add_resume(self, data: dict) -> str:
        """Create a new resume"""
        time = datetime.now(timezone.utc)
        data["date_created"] = time
        data["date_updated"] = time
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get_all_resumes(self, uuid: str) -> list[dict]:
        """Get all resumes for a user"""
        cursor = self.collection.find({"uuid": uuid})
        results = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results

    async def get_resume(self, resume_id: str) -> dict | None:
        """Get a single resume by ID"""
        result = await self.collection.find_one({"_id": ObjectId(resume_id)})
        if result:
            result["_id"] = str(result["_id"])
        return result

    async def update_resume(self, resume_id: str, data: dict) -> int:
        """Update a resume"""
        data["date_updated"] = datetime.now(timezone.utc)
        result = await self.collection.update_one(
            {"_id": ObjectId(resume_id)},
            {"$set": data}
        )
        return result.matched_count

    async def delete_resume(self, resume_id: str) -> int:
        """Delete a resume"""
        result = await self.collection.delete_one({"_id": ObjectId(resume_id)})
        return result.deleted_count

    async def set_default_resume(self, uuid: str, resume_id: str) -> int:
        """Set a resume as the user's default"""
        # First, unset all other resumes as default
        await self.collection.update_many(
            {"uuid": uuid},
            {"$set": {"is_default": False}}
        )
        # Then set the specified resume as default
        result = await self.collection.update_one(
            {"_id": ObjectId(resume_id)},
            {"$set": {"is_default": True, "date_updated": datetime.now(timezone.utc)}}
        )
        return result.matched_count


# Create singleton instance
resume_dao = ResumeDAO()
