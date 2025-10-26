# backend/db/clients.py
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()  # loads variables from .env

MONGO_URI = os.getenv("MONGO_URI")  # this should be the env variable name
DB_NAME = os.getenv("DB_NAME", "app_data")  # default to app_data

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

def get_collection(name: str):
    return db[name]
