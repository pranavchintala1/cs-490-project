from datetime import datetime, timezone
from bson.objectid import ObjectId
from mongo.dao_setup import db_client, RESUME_FEEDBACK


class ResumeFeedbackDAO:
    """Data Access Object for Resume Feedback/Comments"""

    def __init__(self):
        self.collection = db_client.get_collection(RESUME_FEEDBACK)

    async def add_feedback(self, data: dict) -> str:
        """Add a comment/feedback to a resume"""
        time = datetime.now(timezone.utc)
        data["date_created"] = time
        data["date_updated"] = time
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get_feedback(self, resume_id: str) -> list[dict]:
        """Get all feedback for a resume, sorted by creation date (newest first)"""
        cursor = self.collection.find({"resume_id": resume_id}).sort("date_created", -1)
        results = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results

    async def get_feedback_item(self, feedback_id: str) -> dict | None:
        """Get a specific feedback item by ID"""
        result = await self.collection.find_one({"_id": ObjectId(feedback_id)})
        if result:
            result["_id"] = str(result["_id"])
        return result

    async def update_feedback(self, feedback_id: str, data: dict) -> int:
        """Update a feedback item"""
        data["date_updated"] = datetime.now(timezone.utc)
        result = await self.collection.update_one(
            {"_id": ObjectId(feedback_id)},
            {"$set": data}
        )
        return result.matched_count

    async def delete_feedback(self, feedback_id: str) -> int:
        """Delete a feedback item"""
        result = await self.collection.delete_one({"_id": ObjectId(feedback_id)})
        return result.deleted_count

    async def delete_all_feedback(self, resume_id: str) -> int:
        """Delete all feedback for a resume (when resume is deleted)"""
        result = await self.collection.delete_many({"resume_id": resume_id})
        return result.deleted_count


# Create singleton instance
resume_feedback_dao = ResumeFeedbackDAO()
