import os, certifi

from dotenv import load_dotenv
from pymongo import AsyncMongoClient

load_dotenv("./mongo/.env")

MONGO_CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")
DATABASE_NAME = os.getenv("MONGO_APPLICATION_DATABASE")
AUTH = os.getenv("AUTH_COLLECTION")
PROFILES = os.getenv("PROFILES_COLLECTION")
SKILLS = os.getenv("SKILLS_COLLECTION")
EMPLOYMENT = os.getenv("EMPLOYMENT_COLLECTION")
EDUCATION = os.getenv("EDUCATION_COLLECTION")
CERTIFICATION = os.getenv("CERTIFICATION_COLLECTION")
PROJECTS = os.getenv("PROJECTS_COLLECTION")
RESET_LINKS = os.getenv("RESET_LINKS_COLLECTION")
GOOGLE_OAUTH = os.getenv("GOOGLE_OAUTH_CREDENTIALS")

mongo_client = AsyncMongoClient(MONGO_CONNECTION_STRING, tls = True, tlsCAFile=certifi.where())
db_client = mongo_client.get_database(DATABASE_NAME)
