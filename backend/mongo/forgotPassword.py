
# from dotenv import load_dotenv
# from mongo.dao_setup import db_client, RESET_LINKS
# from mongo.auth_dao import auth_dao
# import os
# import json
# import smtplib
# from email.mime.text import MIMEText
# import secrets
# from datetime import datetime, timedelta
# import hashlib
# import base64
# import pickle
# from google_auth_oauthlib.flow import InstalledAppFlow
# from googleapiclient.discovery import build

# class ForgotPassword:

#     def __init__(self):
#         self.collection = db_client.get_collection(RESET_LINKS)

#         # Load or create credentials
#         creds = None
#         if os.path.exists("token.pkl"):
#             with open("token.pkl", "rb") as f:
#                 creds = pickle.load(f)

#         scopes_env = os.environ.get("SCOPES", "https://www.googleapis.com/auth/gmail.send")
#         SCOPES = scopes_env.split() 

#         if not creds:
#             flow = InstalledAppFlow.from_client_config({
#         "installed": {
#             "client_id": os.environ["GOOGLE_CLIENT_ID_EMAIL"],
#             "client_secret": os.environ["GOOGLE_CLIENT_SECRET_EMAIL"],
#             "auth_uri": "https://accounts.google.com/o/oauth2/auth",
#             "token_uri": "https://oauth2.googleapis.com/token",
#             "redirect_uris": ["http://localhost"]
#         }
#     }, SCOPES)  

#             creds = flow.run_local_server(port=0)
#             with open("token.pkl", "wb") as f:
#                 pickle.dump(creds, f)

# # Build Gmail service
#         self.service = build('gmail', 'v1', credentials=creds)

#         # Cache the authorized Gmail email
#         profile = self.service.users().getProfile(userId='me').execute()
#         self.from_email = profile['emailAddress']

#     def send_email(self, email):
#         import secrets, base64
#         from email.mime.text import MIMEText

#         token = secrets.token_urlsafe(32)
#         subject = "Metamorphosis - Password Reset"
#         body_text = f"""
#         This is a password reset request for your metamorphosis account,

#         Click the link below to reset your password. This link expires in 1 hour:

#         http://localhost:3000/resetPassword/{token}

#         If you did not make this request, consider resetting your password anyway.
#         """

#         msg = MIMEText(body_text)
#         msg["From"] = self.from_email
#         msg["To"] = email
#         msg["Subject"] = subject

#         raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode()
#         body = {'raw': raw_message}

#         try:
#             sent_message = self.service.users().messages().send(userId='me', body=body).execute()
#             print(f"Email sent to {email}!")
#             return token
#         except Exception as e:
#             print("Error sending email:", e)


#     async def store_link(self,id,email,token):

#         db_token = hashlib.sha256(token.encode()).hexdigest() # send this to db

#         body = {
#             "_id": id,
#             "email": email,
#             "token": db_token,
#             "expires": datetime.now() + timedelta(hours=1)
#         }
#         await self.collection.insert_one(body)

#     async def verify_link(self,token):

#         try:
#             db_token = hashlib.sha256(token.encode()).hexdigest()
#             data = await self.collection.find_one({"token":db_token})
#             if data:
#                 expires = data["expires"]
#                 email = data["email"]
#                 uuid = await auth_dao.get_uuid(email)
#                 return uuid,expires
        
#         except Exception as e:
#             return (None,None)



import os
import smtplib
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from email.mime.text import MIMEText
from dotenv import load_dotenv
from mongo.dao_setup import db_client, RESET_LINKS
from mongo.auth_dao import auth_dao


class ForgotPassword:
    def __init__(self):
        load_dotenv()

        self.collection = db_client.get_collection(RESET_LINKS)
        self.from_email = os.environ["GMAIL_SENDER"]
        self.password = os.environ["GMAIL_APP_PASSWORD"]
        self.frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")

    def send_email(self, to_email: str) -> str:
        """Send a password reset email with a secure token."""
        token = secrets.token_urlsafe(32)
        reset_link = f"{self.frontend_url}/resetPassword/{token}"

        subject = "Metamorphosis - Password Reset"
        body = (
            f"This is a password reset request for your Metamorphosis account.\n\n"
            f"Click the link below to reset your password. This link expires in 1 hour:\n\n"
            f"{reset_link}\n\n"
            "If you did not make this request, please ignore this email."
        )

        msg = MIMEText(body)
        msg["From"] = self.from_email
        msg["To"] = to_email
        msg["Subject"] = subject

        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(self.from_email, self.password)
                server.send_message(msg)
            print(f"Password reset email sent to {to_email}")
            return token
        except Exception as e:
            print("Error sending email:", e)
            raise

    async def store_link(self, user_id: str, email: str, token: str):
        """Store a hashed reset token in MongoDB with a 1-hour expiration."""
        db_token = hashlib.sha256(token.encode()).hexdigest()
        expires = datetime.now() + timedelta(hours=1)

        doc = {
            "_id": user_id,
            "email": email,
            "token": db_token,
            "expires": expires,
        }

        print("REACHED FUNCTION")
        print (user_id)
        await self.collection.replace_one({"_id": user_id}, doc, upsert=True)
        try:
            result = await self.collection.replace_one({"_id": user_id}, doc, upsert=True)
            print("Matched:", result.matched_count, "Modified:", result.modified_count)
        except Exception as e:
            print("Error storing token:", e)

        await self.collection.create_index("expires", expireAfterSeconds=0)
        
        
        data = await self.collection.find_one({"token": db_token})
            
        if not data:
            print("Token not found in DB")
            return None, None

        print("STORE TOKEN", db_token)
        
        print("expires:", data["expires"])
        
        
        

    async def verify_link(self, token: str):
        """Verify if a reset link token is valid and not expired."""
        
        
        
        try:
            db_token = hashlib.sha256(token.encode()).hexdigest()
            data = await self.collection.find_one({"token": db_token})
            print("VERIFY TOKEN", db_token)
            if not data:
                print("Token not found in DB")
                return None, None

            print("Token found!")
            print("expires:", data["expires"])
            print("now:", datetime.utcnow())

            
            
            if not data:
                return None, None
            if data["expires"] < datetime.now():
                await self.collection.delete_one({"token": db_token})
                print("DELETE 1")
                return None, None

            email = data["email"]
            uuid = await auth_dao.get_uuid(email)
            await self.collection.delete_one({"token": db_token})
            print("DELETE 2")
            return uuid, data["expires"]
        except Exception as e:
            print("Error verifying token:", e)
            return None, None
