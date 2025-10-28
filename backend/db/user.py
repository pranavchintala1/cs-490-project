
from typing import Any

PROFILES_COLL_NAME = "profiles"
JOBS_COLL_NAME = "jobs"

def profiles_coll(db: Any):
  
    return db[PROFILES_COLL_NAME]

def jobs_coll(db: Any):

    return db[JOBS_COLL_NAME]


async def ensure_user_indexes(db: Any) -> None:
    await profiles_coll(db).create_index("user_id", unique=True)
    await jobs_coll(db).create_index([("user_id", 1), ("job_id", 1)], unique=True)
    await jobs_coll(db).create_index([("user_id", 1), ("start_date", -1)])
