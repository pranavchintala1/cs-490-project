import os
import pickle
import base64
import hashlib
import secrets
from datetime import datetime, timedelta
from email.mime.text import MIMEText

from dotenv import load_dotenv
from mongo.dao_setup import db_client, RESET_LINKS
from mongo.auth_dao import auth_dao

from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build


class ForgotPassword:
    def __init__(self):
        # Load environment variables
        load_dotenv()

        # Connect to MongoDB
        self.collection = db_client.get_collection(RESET_LINKS)

        # Gmail OAuth setup
        self.creds = self._load_credentials()
        self.service = build("gmail", "v1", credentials=self.creds)

        # Cache the authorized Gmail account
        profile = self.service.users().getProfile(userId="me").execute()
        self.from_email = profile["emailAddress"]

    def _load_credentials(self):
        """Load, refresh, or create Gmail API credentials."""
        creds = None
        token_path = "token.pkl"
        scopes = os.environ.get(
            "SCOPES", "https://www.googleapis.com/auth/gmail.send"
        ).split()

        # Try to load existing credentials
        if os.path.exists(token_path):
            with open(token_path, "rb") as f:
                creds = pickle.load(f)

        # Refresh or generate new credentials
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        elif not creds:
            flow = InstalledAppFlow.from_client_config(
                {
                    "installed": {
                        "client_id": os.environ["GOOGLE_CLIENT_ID_EMAIL"],
                        "client_secret": os.environ["GOOGLE_CLIENT_SECRET_EMAIL"],
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": ["http://localhost"],
                    }
                },
                scopes,
            )
            creds = flow.run_local_server(port=0)

        # Save the credentials for reuse
        with open(token_path, "wb") as f:
            pickle.dump(creds, f)

        return creds

    async def send_email(self, email: str) -> str:
        """Send a password reset email with a secure token."""
        token = secrets.token_urlsafe(32)
        subject = "Metamorphosis - Password Reset"
        body_text = (
            "This is a password reset request for your Metamorphosis account.\n\n"
            "Click the link below to reset your password. This link expires in 1 hour:\n\n"
            f"http://localhost:3000/resetPassword/{token}\n\n"
            "If you did not make this request, please ignore this email."
        )

        msg = MIMEText(body_text)
        msg["From"] = self.from_email
        msg["To"] = email
        msg["Subject"] = subject

        raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        body = {"raw": raw_message}

        try:
            self.service.users().messages().send(userId="me", body=body).execute()
            print(f"Email sent to {email}!")
            return token
        except Exception as e:
            print("Error sending email:", e)
            raise

    async def store_link(self, user_id: str, email: str, token: str):
        """Store a hashed reset token in MongoDB with 1-hour expiration."""
        db_token = hashlib.sha256(token.encode()).hexdigest()
        expires = datetime.now() + timedelta(hours=1)

        body = {
            "_id": user_id,
            "email": email,
            "token": db_token,
            "expires": expires,
        }

        # Upsert (replace if exists)
        await self.collection.replace_one({"_id": user_id}, body, upsert=True)

        # Ensure TTL index exists
        await self.collection.create_index("expires", expireAfterSeconds=0)

    async def verify_link(self, token: str):
        """Verify if a password reset token is valid and not expired."""
        try:
            db_token = hashlib.sha256(token.encode()).hexdigest()
            data = await self.collection.find_one({"token": db_token})

            if not data:
                return None, None

            if data["expires"] < datetime.now():
                # Token expired — remove it
                await self.collection.delete_one({"token": db_token})
                return None, None

            email = data["email"]
            uuid = await auth_dao.get_uuid(email)

            # Delete after successful verification (single use)
            await self.collection.delete_one({"token": db_token})

            return uuid, data["expires"]

        except Exception as e:
            print("Error verifying reset link:", e)
            return None, None
