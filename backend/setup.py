from dotenv import load_dotenv
import os

load_dotenv("./backend/.env")

MONGO_CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")
DATABASE_NAME = os.getenv("MONGO_APPLICATION_DATABASE")
USER_AUTH_COLLECTION = os.getenv("USER_AUTH_COLLECTION")
USER_DATA_COLLECTION = os.getenv("USER_DATA_COLLECTION")

from motor.motor_asyncio import AsyncIOMotorClient
mongo_client = AsyncIOMotorClient(MONGO_CONNECTION_STRING)
db_client = mongo_client.get_database("app_data")