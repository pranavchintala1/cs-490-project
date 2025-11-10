from mongo.dao_setup import db_client, COVER_LETTERS
from datetime import datetime

class CoverLettersDAO:
    def __init__(self):
        self.collection = db_client.get_collection(COVER_LETTERS)

    async def add_cover_letter(self, data: dict) -> str:
        result = await self.collection.insert_one(data)
        return data["_id"]

    async def get_cover_letter(self, letter_id: str, uuid: str) -> dict | None:

        return await self.collection.find_one({"_id": letter_id, "uuid": uuid})

    async def get_all_cover_letters(self, user_uuid: str) -> list[dict]:
        cursor = self.collection.find({"uuid": user_uuid}).sort("created_at", -1)
        return [doc async for doc in cursor]

    async def update_cover_letter(self, letter_id: str, user_uuid: str, updates: dict) -> int:
    # Only update if _id AND uuid match
        result = await self.collection.update_one(
            {"_id": letter_id, "uuid": user_uuid},
            {"$set": updates}
        )
        return result.modified_count

    async def delete_cover_letter(self, letter_id: str) -> int:
        result = await self.collection.delete_one({"_id": letter_id})
        return result.deleted_count


# singleton instance to use in FastAPI routes
cover_letters_dao = CoverLettersDAO()
