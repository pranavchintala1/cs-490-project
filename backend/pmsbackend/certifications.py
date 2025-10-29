from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from typing import Optional
from db.models import CERTIFICATIONS_COLLECTION
from datetime import datetime, timedelta
from io import BytesIO
import uuid

app = FastAPI()

def cert_serializer(entry):
    return {
        "id": entry["_id"],
        "user_id": entry.get("user_id"),
        "name": entry.get("name"),
        "issuer": entry.get("issuer"),
        "date_earned": entry.get("date_earned"),
        "expiration_date": entry.get("expiration_date"),
        "does_not_expire": entry.get("does_not_expire", False),
        "cert_id": entry.get("cert_id"),
        "category": entry.get("category"),
        "verified": entry.get("verified", False),
        "position": entry.get("position", 0),
        "has_document": "document" in entry,
        "document_name": entry.get("document_name"),
        "document_content_type": entry.get("document_content_type")
    }


# --- GET all certifications ---
@app.get("/")
def get_certifications(user_id: str = Query("temp_user")):
    certs = list(CERTIFICATIONS_COLLECTION.find({"user_id": user_id}).sort("position", 1))

    def cert_sort_key(c):
        exp = c.get("expiration_date")
        if exp:
            exp_date = datetime.strptime(exp, "%Y-%m-%d").date()
            if exp_date < datetime.today().date():
                return -2
            elif exp_date <= datetime.today().date() + timedelta(days=90):
                return -1
        return 0

    certs.sort(key=cert_sort_key)
    for i, c in enumerate(certs):
        CERTIFICATIONS_COLLECTION.update_one({"_id": c["_id"]}, {"$set": {"position": i}})
    return [cert_serializer(c) for c in certs]

# --- POST new certification ---
@app.post("/")
async def add_certification(
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
    # Read file into memory
    file_bytes = None
    filename = None
    content_type = None
    if document:
        file_bytes = await document.read()
        filename = document.filename
        content_type = document.content_type

    # Assign a temporary position
    last = list(CERTIFICATIONS_COLLECTION.find({"user_id": user_id}).sort("position", -1).limit(1))
    position = last[0]["position"] + 1 if last else 0

    doc_id = str(uuid.uuid4())
    doc = {
        "_id": doc_id,
        "user_id": user_id,
        "name": name,
        "issuer": issuer,
        "date_earned": date_earned,
        "does_not_expire": does_not_expire,
        "expiration_date": None if does_not_expire else expiration_date,
        "cert_id": cert_id,
        "category": category,
        "verified": verified,
        "position": position,
    }

    if file_bytes:
        doc["document"] = file_bytes
        doc["document_name"] = filename
        doc["document_content_type"] = content_type

    CERTIFICATIONS_COLLECTION.insert_one(doc)

    # --- Recompute positions based on expiration ---
    certs = list(CERTIFICATIONS_COLLECTION.find({"user_id": user_id}))
    
    def cert_sort_key(c):
        exp = c.get("expiration_date")
        if exp:
            exp_date = datetime.strptime(exp, "%Y-%m-%d").date()
            if exp_date < datetime.today().date():
                return -2  # expired
            elif exp_date <= datetime.today().date() + timedelta(days=90):
                return -1  # expiring soon
        return 0

    certs.sort(key=cert_sort_key)
    for i, c in enumerate(certs):
        CERTIFICATIONS_COLLECTION.update_one({"_id": c["_id"]}, {"$set": {"position": i}})

    return cert_serializer(doc)


# --- DELETE certification ---
@app.delete("/{cert_id}")
def delete_certification(cert_id: str, user_id: str = Query(...)):
    result = CERTIFICATIONS_COLLECTION.delete_one({"_id": cert_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Certification not found")

    remaining = list(CERTIFICATIONS_COLLECTION.find({"user_id": user_id}).sort("position", 1))
    for i, c in enumerate(remaining):
        CERTIFICATIONS_COLLECTION.update_one({"_id": c["_id"]}, {"$set": {"position": i}})
    return {"message": "Certification removed"}

# --- Download file ---
@app.get("/download/{cert_id}")
def download_cert(cert_id: str, user_id: str = Query(...)):
    cert = CERTIFICATIONS_COLLECTION.find_one({"_id": cert_id, "user_id": user_id})
    if not cert or "document" not in cert:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_like = BytesIO(cert["document"])
    return StreamingResponse(
        file_like,
        media_type=cert.get("document_content_type", "application/octet-stream"),
        headers={"Content-Disposition": f"attachment; filename={cert.get('document_name', 'file')}"}
    )
