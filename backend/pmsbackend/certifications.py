# backend/certifications.py
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Certification(BaseModel):
    id: int | None = None
    name: str
    issuer: str
    date_earned: str
    does_not_expire: bool = False
    expiration_date: Optional[str] = None
    cert_number: Optional[str] = None
    verified: bool = False
    category: Optional[str] = None
    renewal_reminder: Optional[str] = None
    document_filename: Optional[str] = None

certs_db: List[Certification] = []
next_id = 1

# --- Routes --- #

@app.get("/")  # GET /certifications/
def get_certs():
    return certs_db

@app.post("/")  # POST /certifications/
async def add_cert(
    name: str = Form(...),
    issuer: str = Form(...),
    date_earned: str = Form(...),
    does_not_expire: bool = Form(False),
    expiration_date: str = Form(None),
    cert_number: str = Form(None),
    verified: bool = Form(False),
    category: str = Form(None),
    renewal_reminder: str = Form(None),
    document_file: UploadFile = File(None),
):
    global next_id
    cert = Certification(
        id=next_id,
        name=name,
        issuer=issuer,
        date_earned=date_earned,
        does_not_expire=does_not_expire,
        expiration_date=expiration_date,
        cert_number=cert_number,
        verified=verified,
        category=category,
        renewal_reminder=renewal_reminder,
        document_filename=document_file.filename if document_file else None,
    )
    certs_db.append(cert)
    next_id += 1
    return cert

@app.delete("/{cert_id}")
def delete_cert(cert_id: int):
    for c in certs_db:
        if c.id == cert_id:
            certs_db.remove(c)
            return {"message": "Certification removed"}
    raise HTTPException(status_code=404, detail="Certification not found")

@app.put("/{cert_id}")
def update_cert(cert_id: int, updated_cert: Certification):
    for i, c in enumerate(certs_db):
        if c.id == cert_id:
            certs_db[i] = updated_cert
            return updated_cert
    raise HTTPException(status_code=404, detail="Certification not found")
