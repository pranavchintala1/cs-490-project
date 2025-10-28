import os, certifi

from dotenv import load_dotenv
from pymongo import AsyncMongoClient

load_dotenv("./mongo/.env")

MONGO_CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")
DATABASE_NAME = os.getenv("MONGO_APPLICATION_DATABASE")
USER_AUTH_COLLECTION = os.getenv("USER_AUTH_COLLECTION")
USER_DATA_COLLECTION = os.getenv("USER_DATA_COLLECTION")

mongo_client = AsyncMongoClient(MONGO_CONNECTION_STRING, tls = True, tlsCAFile=certifi.where())
db_client = mongo_client.get_database(DATABASE_NAME)
