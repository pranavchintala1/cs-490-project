from fastapi import APIRouter, HTTPException, Depends
from pymongo.errors import DuplicateKeyError
from datetime import datetime, timezone
from mongo.resume_dao import resume_dao
from mongo.resume_version_dao import resume_version_dao
from mongo.resume_feedback_dao import resume_feedback_dao
from sessions.session_authorizer import authorize
from schema import Resume, ResumeVersion, ResumeFeedback

resumes_router = APIRouter(prefix="/resumes")


# ==================== RESUME CRUD ====================

@resumes_router.post("", tags=["resumes"])
async def create_resume(resume: Resume, uuid: str = Depends(authorize)):
    """Create a new resume"""
    try:
        model = resume.model_dump()

        # Validation
        if not model.get("name"):
            raise HTTPException(422, "Resume requires a name")

        model["uuid"] = uuid
        result = await resume_dao.add_resume(model)
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal server error")

    return {"detail": "Successfully created resume", "resume_id": result}


@resumes_router.get("/me", tags=["resumes"])
async def get_all_resumes(uuid: str = Depends(authorize)):
    """Get all resumes for the current user"""
    try:
        results = await resume_dao.get_all_resumes(uuid)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    return results


@resumes_router.get("/{resume_id}", tags=["resumes"])
async def get_resume(resume_id: str, uuid: str = Depends(authorize)):
    """Get a specific resume by ID"""
    try:
        result = await resume_dao.get_resume(resume_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if result:
        # Verify ownership
        if result.get("uuid") != uuid:
            raise HTTPException(403, "Unauthorized to access this resume")
        return result
    else:
        raise HTTPException(400, "Resume not found")


@resumes_router.put("/{resume_id}", tags=["resumes"])
async def update_resume(resume_id: str, resume: Resume, uuid: str = Depends(authorize)):
    """Update a resume"""
    try:
        # Verify ownership
        existing = await resume_dao.get_resume(resume_id)
        if not existing or existing.get("uuid") != uuid:
            raise HTTPException(403, "Unauthorized to access this resume")

        model = resume.model_dump(exclude_unset=True)
        updated = await resume_dao.update_resume(resume_id, model)
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal server error")

    if updated == 0:
        raise HTTPException(400, "Resume not found")
    else:
        return {"detail": "Successfully updated resume"}


@resumes_router.delete("/{resume_id}", tags=["resumes"])
async def delete_resume(resume_id: str, uuid: str = Depends(authorize)):
    """Delete a resume and all associated data"""
    try:
        # Verify ownership
        existing = await resume_dao.get_resume(resume_id)
        if not existing or existing.get("uuid") != uuid:
            raise HTTPException(403, "Unauthorized to access this resume")

        # Delete versions and feedback
        await resume_version_dao.delete_all_versions(resume_id)
        await resume_feedback_dao.delete_all_feedback(resume_id)

        # Delete resume
        deleted = await resume_dao.delete_resume(resume_id)
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal server error")

    if deleted == 0:
        raise HTTPException(400, "Resume not found")
    else:
        return {"detail": "Successfully deleted resume"}


@resumes_router.post("/{resume_id}/set-default", tags=["resumes"])
async def set_default_resume(resume_id: str, uuid: str = Depends(authorize)):
    """Set a resume as the user's default"""
    try:
        # Verify ownership
        existing = await resume_dao.get_resume(resume_id)
        if not existing or existing.get("uuid") != uuid:
            raise HTTPException(403, "Unauthorized to access this resume")

        updated = await resume_dao.set_default_resume(uuid, resume_id)
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal server error")

    if updated == 0:
        raise HTTPException(400, "Resume not found")
    else:
        return {"detail": "Resume set as default"}


# ==================== RESUME VERSIONS ====================

@resumes_router.post("/{resume_id}/versions", tags=["resumes"])
async def create_version(resume_id: str, version: ResumeVersion, uuid: str = Depends(authorize)):
    """Create a version snapshot of a resume"""
    try:
        # Verify ownership
        existing = await resume_dao.get_resume(resume_id)
        if not existing or existing.get("uuid") != uuid:
            raise HTTPException(403, "Unauthorized to access this resume")

        if not version.name:
            raise HTTPException(422, "Version requires a name")

        model = version.model_dump()
        model["resume_id"] = resume_id
        model["resume_data"] = existing  # Store full resume snapshot

        result = await resume_version_dao.create_version(model)
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal server error")

    return {"detail": "Successfully created version", "version_id": result}


@resumes_router.get("/{resume_id}/versions", tags=["resumes"])
async def get_versions(resume_id: str, uuid: str = Depends(authorize)):
    """Get all versions of a resume"""
    try:
        # Verify ownership
        existing = await resume_dao.get_resume(resume_id)
        if not existing or existing.get("uuid") != uuid:
            raise HTTPException(403, "Unauthorized to access this resume")

        results = await resume_version_dao.get_versions(resume_id)
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    return results


@resumes_router.get("/{resume_id}/versions/{version_id}", tags=["resumes"])
async def get_version(resume_id: str, version_id: str, uuid: str = Depends(authorize)):
    """Get a specific version"""
    try:
        # Verify ownership
        existing = await resume_dao.get_resume(resume_id)
        if not existing or existing.get("uuid") != uuid:
            raise HTTPException(403, "Unauthorized to access this resume")

        result = await resume_version_dao.get_version(version_id)
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if result:
        return result
    else:
        raise HTTPException(400, "Version not found")


@resumes_router.delete("/{resume_id}/versions/{version_id}", tags=["resumes"])
async def delete_version(resume_id: str, version_id: str, uuid: str = Depends(authorize)):
    """Delete a version"""
    try:
        # Verify ownership
        existing = await resume_dao.get_resume(resume_id)
        if not existing or existing.get("uuid") != uuid:
            raise HTTPException(403, "Unauthorized to access this resume")

        deleted = await resume_version_dao.delete_version(version_id)
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal server error")

    if deleted == 0:
        raise HTTPException(400, "Version not found")
    else:
        return {"detail": "Successfully deleted version"}


@resumes_router.post("/{resume_id}/versions/{version_id}/restore", tags=["resumes"])
async def restore_version(resume_id: str, version_id: str, uuid: str = Depends(authorize)):
    """Restore a previous version as the current resume"""
    try:
        # Verify ownership
        existing = await resume_dao.get_resume(resume_id)
        if not existing or existing.get("uuid") != uuid:
            raise HTTPException(403, "Unauthorized to access this resume")

        # Get the version
        version = await resume_version_dao.get_version(version_id)
        if not version:
            raise HTTPException(400, "Version not found")

        # Restore the resume data from the version snapshot
        resume_data = version.get("resume_data", {})
        resume_data.pop("_id", None)  # Remove the _id from the snapshot

        updated = await resume_dao.update_resume(resume_id, resume_data)
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal server error")

    if updated == 0:
        raise HTTPException(400, "Resume not found")
    else:
        return {"detail": "Successfully restored version"}


# ==================== RESUME FEEDBACK ====================

@resumes_router.post("/{resume_id}/feedback", tags=["resumes"])
async def add_feedback(resume_id: str, feedback: ResumeFeedback, uuid: str = Depends(authorize)):
    """Add feedback/comment to a resume"""
    try:
        # Verify resume exists (anyone can add feedback to a shared resume)
        existing = await resume_dao.get_resume(resume_id)
        if not existing:
            raise HTTPException(400, "Resume not found")

        if not feedback.reviewer_name or not feedback.comment:
            raise HTTPException(422, "Feedback requires reviewer_name and comment")

        model = feedback.model_dump()
        model["resume_id"] = resume_id

        result = await resume_feedback_dao.add_feedback(model)
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal server error")

    return {"detail": "Successfully added feedback", "feedback_id": result}


@resumes_router.get("/{resume_id}/feedback", tags=["resumes"])
async def get_feedback(resume_id: str, uuid: str = Depends(authorize)):
    """Get all feedback for a resume"""
    try:
        # Verify ownership
        existing = await resume_dao.get_resume(resume_id)
        if not existing or existing.get("uuid") != uuid:
            raise HTTPException(403, "Unauthorized to access this resume")

        results = await resume_feedback_dao.get_feedback(resume_id)
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    return results


@resumes_router.put("/{resume_id}/feedback/{feedback_id}", tags=["resumes"])
async def update_feedback(resume_id: str, feedback_id: str, feedback: ResumeFeedback, uuid: str = Depends(authorize)):
    """Update feedback (mainly for marking as resolved)"""
    try:
        # Verify ownership
        existing = await resume_dao.get_resume(resume_id)
        if not existing or existing.get("uuid") != uuid:
            raise HTTPException(403, "Unauthorized to access this resume")

        model = feedback.model_dump(exclude_unset=True)
        updated = await resume_feedback_dao.update_feedback(feedback_id, model)
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal server error")

    if updated == 0:
        raise HTTPException(400, "Feedback not found")
    else:
        return {"detail": "Successfully updated feedback"}


@resumes_router.delete("/{resume_id}/feedback/{feedback_id}", tags=["resumes"])
async def delete_feedback(resume_id: str, feedback_id: str, uuid: str = Depends(authorize)):
    """Delete feedback"""
    try:
        # Verify ownership
        existing = await resume_dao.get_resume(resume_id)
        if not existing or existing.get("uuid") != uuid:
            raise HTTPException(403, "Unauthorized to access this resume")

        deleted = await resume_feedback_dao.delete_feedback(feedback_id)
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal server error")

    if deleted == 0:
        raise HTTPException(400, "Feedback not found")
    else:
        return {"detail": "Successfully deleted feedback"}
