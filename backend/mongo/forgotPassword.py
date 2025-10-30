
from dotenv import load_dotenv
from mongo.dao_setup import db_client, RESET_LINKS
from mongo.user_auth_dao import user_auth_dao
import os
import smtplib
from email.mime.text import MIMEText
import secrets
from datetime import datetime, timedelta
import hashlib


load_dotenv()
sender_email = os.getenv("EMAIL") # setup 2FA in your email. then go to https://myaccount.google.com/apppasswords and make one.
sender_password = os.getenv("PASSWORD")




class ForgotPassword:

    def __init__(self):
        self.collection = db_client.get_collection(RESET_LINKS)


    def send_email(self,email):
    # Email details

        token = secrets.token_urlsafe(32)  # generates token
        subject = "Metamorphosis - Password Reset"
        body = f"""
        This is a password reset request for your metamorphosis account,

        Click the link below to reset your password. This link expires in 1 hour:

        "localhost:3000/resetPassword/{token}"

        If you did not make this request, consider resetting your password anyway.
        """ # update localhost later if actual domain is implemented

        # Create the email message
        msg = MIMEText(body)
        msg["From"] = sender_email
        msg["To"] = email
        msg["Subject"] = subject

        # Send the email
        try:
            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()  # Secure connection
                server.login(sender_email, sender_password)
                server.send_message(msg)
                return token

        except Exception as e:
            print("Error:", e)

    

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
                uuid = await user_auth_dao.get_uuid(email)
                return uuid,expires
        
        except Exception as e:
            return None,None

        





    


