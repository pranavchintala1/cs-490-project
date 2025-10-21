from setup import db_client, USER_DATA_COLLECTION

class UserDataAPI:
    def __init__(self):
        self.collection = db_client.get_collection(USER_DATA_COLLECTION)

    def get_data(self, username):
        pass

    def delete_data(self, username):
        pass

    # update can be responsible for pushing and updating data
    def update_data(self, username, config):
        pass

user_data = UserDataAPI()