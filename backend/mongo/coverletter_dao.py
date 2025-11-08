from mongo.dao_setup import db_client, COVER_LETTERS
from bson import ObjectId


class CoverLettersDAO:

    def __init__(self):
        self.collection = db_client.get_collection(COVER_LETTERS)

    async def add_cover_letter(self, data: dict):
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get_cover_letter(self, letter_id: str):
        return await self.collection.find_one({"_id": ObjectId(letter_id)})

    async def get_all_cover_letter(self, user_id: str):
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1)
        return [doc async for doc in cursor]

    async def update_cover_letter(self, letter_id: str, updates: dict):
        result = await self.collection.update_one({"_id": ObjectId(letter_id)}, {"$set": updates})
        return result.modified_count

    async def delete_cover_letter(self, letter_id: str):
        result = await self.collection.delete_one({"_id": ObjectId(letter_id)})
        return result.deleted_count

cover_letters_dao = CoverLettersDAO()
