from mongo.setup import db_client, USER_DATA_COLLECTION

from datetime import datetime

class UserDataAPI:
    def __init__(self):
        self.collection = db_client.get_collection(USER_DATA_COLLECTION)

    async def register_user(
            self,
            uuid: str,
            username: str, 
            email: str, 
            full_name: str = None, 
            phone_num: str = None, 
            address: str = None
    ):
        await self.collection.insert_one({
            "_id": uuid,
            "username": username,
            "email": email,
            "full_name": full_name, # first + last (can split if necessary)
            "phone_number": phone_num,
            "address": address, # home address
            "title": None, # job/career title i.e. student, engineer, etc.
            "biography": None, # 500 char limit
            "industry": None,
            "exp_level": None, # intern, junior, senior, etc.
            "profile_image": None, # url
            "skills": [],
            "employment": [],
            "education": [],
            "projects": [],
            "date_created": datetime.now(),
            "date_updated": datetime.now()
        })

    async def retrieve_user(self, uuid: str) -> dict | None:
        return await self.collection.find_one({"_id": uuid})

    async def delete_user(self, uuid: str) -> int:
        return await self.collection.delete_one({"_id": uuid})

    async def update_user(self, uuid, data: dict):
        updated = await self.collection.update_one({"_id": uuid}, {"$set": data})
        return updated.matched_count

    async def add_skill(self, uuid, skill: dict):
        pass

    async def add_employment(self, uuid, job: dict):
        pass

    async def add_education(self, uuid, education: dict):
        pass

    async def add_project(self, uuid, project: dict):
        pass

    async def del_skill(self, skill_id):
        pass

    async def del_employment(self, emp_id):
        pass

    async def del_education(self, edu_id):
        pass

    async def del_project(self, proj_id):
        pass

user_data_api = UserDataAPI()