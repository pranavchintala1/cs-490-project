from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import Optional
import shutil
from pathlib import Path
from db.models import CERTIFICATIONS_COLLECTION

app = APIRouter()

# Upload folder relative to main.py working dir
UPLOAD_DIR = Path("uploads/certifications")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Serializer
def cert_serializer(entry):
    return {
        "id": entry["_id"],  # Directly use the string-based id
        "user_id": entry.get("user_id"),
        "name": entry.get("name"),
        "issuer": entry.get("issuer"),
        "date_earned": entry.get("date_earned"),
        "expiration_date": entry.get("expiration_date"),
        "does_not_expire": entry.get("does_not_expire", False),
        "cert_id": entry.get("cert_id"),
        "category": entry.get("category"),
        "verified": entry.get("verified", False),
        "document_url": entry.get("document_url"),
        "position": entry.get("position", 0),
    }

# GET all certifications
@app.get("/")
def get_certifications(user_id: str = Query("temp_user")):
    certs = list(CERTIFICATIONS_COLLECTION.find({"user_id": user_id}).sort("position", 1))
    
    from datetime import datetime, timedelta
    def cert_sort_key(c):
        exp = c.get("expiration_date")
        if exp:
            exp_date = datetime.strptime(exp, "%Y-%m-%d").date()
            if exp_date < datetime.today().date():
                return -2  # expired first
            elif exp_date <= datetime.today().date() + timedelta(days=90):
                return -1  # expiring soon
        return 0

    certs.sort(key=cert_sort_key)
    for i, c in enumerate(certs):
        CERTIFICATIONS_COLLECTION.update_one({"_id": c["_id"]}, {"$set": {"position": i}})

    return [cert_serializer(c) for c in certs]

# POST new certification
@app.post("/")
def add_certification(
    user_id: str = Form(...),
    name: str = Form(...),
    issuer: str = Form(...),
    date_earned: str = Form(...),
    does_not_expire: bool = Form(False),
    expiration_date: Optional[str] = Form(None),
    cert_id: Optional[str] = Form(None),
    category: Optional[str] = Form("Categories"),
    verified: bool = Form(False),
    document: UploadFile = File(None),
):
    filename = None
    if document:
        # Use original filename
        filename = document.filename
        file_path = UPLOAD_DIR / filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(document.file, buffer)

    # Determine position
    last = list(CERTIFICATIONS_COLLECTION.find({"user_id": user_id}).sort("position", -1).limit(1))
    position = last[0]["position"] + 1 if last else 0

    doc = {
        "user_id": user_id,
        "name": name,
        "issuer": issuer,
        "date_earned": date_earned,
        "does_not_expire": does_not_expire,
        "expiration_date": None if does_not_expire else expiration_date,
        "cert_id": cert_id,
        "category": category,
        "verified": verified,
        "document_url": filename,
        "position": position,
    }

    result = CERTIFICATIONS_COLLECTION.insert_one(doc)
    doc["_id"] = str(result.inserted_id)  # Ensure the ID is stored as a string
    return cert_serializer(doc)

# DELETE certification
@app.delete("/{cert_id}")
def delete_certification(cert_id: str, user_id: str = Query(...)):
    result = CERTIFICATIONS_COLLECTION.delete_one({"_id": cert_id, "user_id": user_id})  # No need to convert to ObjectId
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Certification not found")
    
    # Fix positions
    remaining = list(CERTIFICATIONS_COLLECTION.find({"user_id": user_id}).sort("position", 1))
    for i, c in enumerate(remaining):
        CERTIFICATIONS_COLLECTION.update_one({"_id": c["_id"]}, {"$set": {"position": i}})

    return {"message": "Certification removed"}

# Download file
@app.get("/download/{filename}")
def download_cert(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type="application/octet-stream", filename=filename)
