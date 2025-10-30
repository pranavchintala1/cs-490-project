
from dotenv import load_dotenv
from mongo.dao_setup import db_client, RESET_LINKS
from mongo.auth_dao import auth_dao
import os
import json
import smtplib
from email.mime.text import MIMEText
import secrets
from datetime import datetime, timedelta
import hashlib
import base64
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

class ForgotPassword:

    def __init__(self):
        self.collection = db_client.get_collection(RESET_LINKS)

        # Load or create credentials
        creds = None
        if os.path.exists("token.pkl"):
            with open("token.pkl", "rb") as f:
                creds = pickle.load(f)

        scopes_env = os.environ.get("SCOPES", "https://www.googleapis.com/auth/gmail.send")
        SCOPES = scopes_env.split() 

        if not creds:
            flow = InstalledAppFlow.from_client_config({
        "installed": {
            "client_id": os.environ["GOOGLE_CLIENT_ID"],
            "client_secret": os.environ["GOOGLE_CLIENT_SECRET"],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost"]
        }
    }, SCOPES)  

            creds = flow.run_local_server(port=0)
            with open("token.pkl", "wb") as f:
                pickle.dump(creds, f)

# Build Gmail service
        self.service = build('gmail', 'v1', credentials=creds)

        # Cache the authorized Gmail email
        profile = self.service.users().getProfile(userId='me').execute()
        self.from_email = profile['emailAddress']

    def send_email(self, email):
        import secrets, base64
        from email.mime.text import MIMEText

        token = secrets.token_urlsafe(32)
        subject = "Metamorphosis - Password Reset"
        body_text = f"""
        This is a password reset request for your metamorphosis account,

        Click the link below to reset your password. This link expires in 1 hour:

        "localhost:3000/resetPassword/{token}"

        If you did not make this request, consider resetting your password anyway.
        """

        msg = MIMEText(body_text)
        msg["From"] = self.from_email
        msg["To"] = email
        msg["Subject"] = subject

        raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        body = {'raw': raw_message}

        try:
            sent_message = self.service.users().messages().send(userId='me', body=body).execute()
            print(f"Email sent to {email}!")
            return token
        except Exception as e:
            print("Error sending email:", e)


    async def store_link(self,id,email,token):

        db_token = hashlib.sha256(token.encode()).hexdigest() # send this to db

        body = {
            "_id": id,
            "email": email,
            "token": db_token,
            "expires": datetime.now() + timedelta(hours=1)
        }
        await self.collection.insert_one(body)

    async def verify_link(self,token):

        try:
            db_token = hashlib.sha256(token.encode()).hexdigest()
            data = await self.collection.find_one({"token":db_token})
            if data:
                expires = data["expires"]
                email = data["email"]
                uuid = await auth_dao.get_uuid(email)
                return uuid,expires
        
        except Exception as e:
            return None,None
