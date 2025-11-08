from datetime import datetime, timezone
from bson.objectid import ObjectId
from mongo.dao_setup import db_client, RESUME_VERSIONS


class ResumeVersionDAO:
    """Data Access Object for Resume Versions (snapshots)"""

    def __init__(self):
        self.collection = db_client.get_collection(RESUME_VERSIONS)

    async def create_version(self, data: dict) -> str:
        """Create a new version snapshot of a resume"""
        time = datetime.now(timezone.utc)
        data["date_created"] = time
        data["date_updated"] = time
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get_versions(self, resume_id: str) -> list[dict]:
        """Get all versions for a resume, sorted by creation date (newest first)"""
        cursor = self.collection.find({"resume_id": resume_id}).sort("date_created", -1)
        results = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results

    async def get_version(self, version_id: str) -> dict | None:
        """Get a specific version by ID"""
        result = await self.collection.find_one({"_id": ObjectId(version_id)})
        if result:
            result["_id"] = str(result["_id"])
        return result

    async def update_version(self, version_id: str, data: dict) -> int:
        """Update a version"""
        data["date_updated"] = datetime.now(timezone.utc)
        result = await self.collection.update_one(
            {"_id": ObjectId(version_id)},
            {"$set": data}
        )
        return result.matched_count

    async def delete_version(self, version_id: str) -> int:
        """Delete a version"""
        result = await self.collection.delete_one({"_id": ObjectId(version_id)})
        return result.deleted_count

    async def delete_all_versions(self, resume_id: str) -> int:
        """Delete all versions of a resume (when resume is deleted)"""
        result = await self.collection.delete_many({"resume_id": resume_id})
        return result.deleted_count


# Create singleton instance
resume_version_dao = ResumeVersionDAO()
