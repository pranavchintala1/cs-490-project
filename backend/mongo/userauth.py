from setup import db_client, USER_AUTH_COLLECTION

class UserAuthenticationAPI:
    def __init__(self, client):
        self.collection = db_client.get_collection(USER_AUTH_COLLECTION)

    def create_user(self, username, config):
        pass

    def delete_user(self, username): 
        pass

    def authenticate_user(self, username, password):
        pass

user_auth = UserAuthenticationAPI()