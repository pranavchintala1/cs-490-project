# backend/db/clients.py
import os
from functools import lru_cache
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

_client = None
_db = None


async def get_db():
    """
    Async getter for the Motor database connection.
    Reuses a single client instance for the entire app.
    """
    global _client, _db

    if _db is not None:
        return _db

    uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME", "app_data")

    if not uri:
        raise RuntimeError("MONGO_URI is not set in .env")

    _client = AsyncIOMotorClient(uri)
    _db = _client[db_name]
    return _db


@lru_cache
def get_collection_name(name: str) -> str:
    """
    Simple helper for consistent naming or future namespace logic.
    """
    return name
