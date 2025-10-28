def serialize_user(doc: dict) -> dict:
    # this just makes sure all of the keys exist and that the bio is less than 500 characters as per the ticket
    return {
        "user_id": doc.get("user_id", ""),
        "full_name": doc.get("full_name", ""),
        "email": doc.get("email", ""),
        "phone": doc.get("phone", ""),
        "location": doc.get("location", ""),
        "headline": doc.get("headline", ""),
        "bio": (doc.get("bio") or "")[:500],
        "industry": doc.get("industry", ""),
        "experience_level": doc.get("experience_level"),
        "profile_picture": doc.get("profile_picture", ""),
        "jobs": doc.get("jobs", []) or [],
        "skills": doc.get("skills", []) or [],
        "education": doc.get("education", []) or [],
        "certifications": doc.get("certifications", []) or [],
        "projects": doc.get("projects", []) or [],
    }
