from fastapi import APIRouter, HTTPException, Depends
from pymongo.errors import DuplicateKeyError

from mongo.resumes_dao import resumes_dao
from sessions.session_authorizer import authorize
from schema.Resume import Resume, ResumeVersion, ResumeFeedback, ResumeShare

resumes_router = APIRouter(prefix = "/resumes")

@resumes_router.post("", tags = ["resumes"])
async def add_resume(resume: Resume, uuid: str = Depends(authorize)):
    try:
        model = resume.model_dump()

        model["uuid"] = uuid
        result = await resumes_dao.add_resume(model)
    except DuplicateKeyError:
        raise HTTPException(400, "Resume already exists") # FIXME: redundant since keys are generated uniquely?
    except Exception as e:
        raise HTTPException(500, "Encountered internal server error")

    return {"detail": "Sucessfully added resume", "resume_id": result}

@resumes_router.get("", tags = ["resumes"])
async def get_resume(resume_id: str, uuid: str = Depends(authorize)):
    try:
        result = await resumes_dao.get_resume(resume_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if result:
        result["_id"] = str(result["_id"])
        return result
    else:
        raise HTTPException(400, "Resume not found")

@resumes_router.get("/me", tags = ["resumes"])
async def get_all_resumes(uuid: str = Depends(authorize)):
    try:
        results = await resumes_dao.get_all_resumes(uuid)
        # NOTE: do not raise http exception for empty resumes, as it can lead to inconsistent behavior on the frontend
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    return results

# PUBLIC: Get resume by share token (no auth required)
# This must come BEFORE other /{param} routes to be matched correctly
@resumes_router.get("/public/{token}", tags = ["resumes"])
async def get_shared_resume(token: str):
    print(f"[DEBUG] Getting shared resume with token: {token}")
    try:
        print(f"[DEBUG] Calling get_resume_by_share_token...")
        result = await resumes_dao.get_resume_by_share_token(token)
        print(f"[DEBUG] Got result: {result is not None}")
    except Exception as e:
        print(f"[DEBUG] Exception: {e}")
        raise HTTPException(500, "Encountered internal service error")

    if result:
        print(f"[DEBUG] Returning result")
        return result
    else:
        print(f"[DEBUG] Token invalid or expired")
        raise HTTPException(400, "Invalid or expired share link")

# PUBLIC: Add feedback to shared resume (no auth required)
@resumes_router.post("/public/{token}/feedback", tags = ["resumes"])
async def add_feedback_to_shared_resume(token: str, feedback: ResumeFeedback):
    print(f"[DEBUG] Public feedback endpoint called with token: {token}")
    print(f"[DEBUG] Feedback data: {feedback}")
    try:
        # First verify the token is valid and get the resume
        resume = await resumes_dao.get_resume_by_share_token(token)
        print(f"[DEBUG] Got resume: {resume is not None}")
        if not resume:
            raise HTTPException(400, "Invalid or expired share link")

        # Check if comments are allowed
        can_comment = resume.get("share_settings", {}).get("can_comment", False)
        print(f"[DEBUG] Can comment: {can_comment}")
        if not can_comment:
            raise HTTPException(403, "Comments are not allowed for this shared resume")

        # Add feedback to the resume
        model = feedback.model_dump()
        print(f"[DEBUG] Feedback model: {model}")
        model["resume_id"] = resume["_id"]  # Use the resume's _id, not the share's _id
        result = await resumes_dao.add_resume_feedback(model)
        print(f"[DEBUG] Feedback added with ID: {result}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"[DEBUG] Exception in public feedback: {e}")
        raise HTTPException(500, f"Encountered internal service error: {str(e)}")

    return {"detail": "Feedback added successfully", "feedback_id": result}

@resumes_router.put("", tags = ["resumes"])
async def update_resume(resume_id: str, resume: Resume, uuid: str = Depends(authorize)):
    try:
        model = resume.model_dump(exclude_unset = True)
        updated = await resumes_dao.update_resume(resume_id, model)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if updated == 0:
        raise HTTPException(400, "Resume not found")
    else:
        return {"detail": "Successfully updated resume"}

@resumes_router.delete("", tags = ["resumes"])
async def delete_resume(resume_id: str, uuid: str = Depends(authorize)):
    try:
        deleted = await resumes_dao.delete_resume(resume_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if deleted == 0:
        raise HTTPException(400, "Resume not found")
    else:
        return {"detail": "Successfully deleted resume"}

# SET DEFAULT RESUME
@resumes_router.put("/{resume_id}/set-default", tags = ["resumes"])
async def set_default_resume(resume_id: str, uuid: str = Depends(authorize)):
    try:
        updated = await resumes_dao.set_default_resume(resume_id, uuid)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if updated == 0:
        raise HTTPException(400, "Resume not found")
    else:
        return {"detail": "Successfully set default resume"}

# RESUME VERSIONS
@resumes_router.post("/{resume_id}/versions", tags = ["resumes"])
async def create_resume_version(resume_id: str, version: ResumeVersion, uuid: str = Depends(authorize)):
    try:
        model = version.model_dump()
        result = await resumes_dao.create_resume_version(resume_id, model)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    return {"detail": "Successfully created version", "version_id": result}

@resumes_router.get("/{resume_id}/versions", tags = ["resumes"])
async def get_resume_versions(resume_id: str, uuid: str = Depends(authorize)):
    try:
        results = await resumes_dao.get_resume_versions(resume_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    return results

@resumes_router.post("/{resume_id}/versions/{version_id}/restore", tags = ["resumes"])
async def restore_resume_version(resume_id: str, version_id: str, uuid: str = Depends(authorize)):
    try:
        updated = await resumes_dao.restore_resume_version(resume_id, version_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if updated == 0:
        raise HTTPException(400, "Version or resume not found")
    else:
        return {"detail": "Successfully restored version"}

@resumes_router.delete("/{resume_id}/versions/{version_id}", tags = ["resumes"])
async def delete_resume_version(resume_id: str, version_id: str, uuid: str = Depends(authorize)):
    try:
        deleted = await resumes_dao.delete_resume_version(version_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if deleted == 0:
        raise HTTPException(400, "Version not found")
    else:
        return {"detail": "Successfully deleted version"}

@resumes_router.put("/{resume_id}/versions/{version_id}/rename", tags = ["resumes"])
async def rename_resume_version(resume_id: str, version_id: str, name: str, description: str = None, uuid: str = Depends(authorize)):
    """Rename a resume version"""
    try:
        if not name or not name.strip():
            raise HTTPException(400, "Version name is required")
        updated = await resumes_dao.rename_resume_version(version_id, name.strip(), description)
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if updated == 0:
        raise HTTPException(400, "Version not found")
    else:
        return {"detail": "Successfully renamed version"}

# RESUME FEEDBACK
@resumes_router.post("/{resume_id}/feedback", tags = ["resumes"])
async def add_resume_feedback(resume_id: str, feedback: ResumeFeedback, uuid: str = Depends(authorize)):
    try:
        model = feedback.model_dump()
        model["resume_id"] = resume_id
        result = await resumes_dao.add_resume_feedback(model)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    return {"detail": "Feedback added successfully", "feedback_id": result}

@resumes_router.get("/{resume_id}/feedback", tags = ["resumes"])
async def get_resume_feedback(resume_id: str, uuid: str = Depends(authorize)):
    try:
        results = await resumes_dao.get_resume_feedback(resume_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    return results

@resumes_router.put("/{resume_id}/feedback/{feedback_id}", tags = ["resumes"])
async def update_resume_feedback(resume_id: str, feedback_id: str, feedback: ResumeFeedback, uuid: str = Depends(authorize)):
    try:
        model = feedback.model_dump(exclude_unset = True)
        updated = await resumes_dao.update_resume_feedback(feedback_id, model)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if updated == 0:
        raise HTTPException(400, "Feedback not found")
    else:
        return {"detail": "Feedback updated successfully"}

@resumes_router.delete("/{resume_id}/feedback/{feedback_id}", tags = ["resumes"])
async def delete_resume_feedback(resume_id: str, feedback_id: str, uuid: str = Depends(authorize)):
    try:
        deleted = await resumes_dao.delete_resume_feedback(feedback_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if deleted == 0:
        raise HTTPException(400, "Feedback not found")
    else:
        return {"detail": "Successfully deleted feedback"}

# RESUME SHARING
@resumes_router.post("/{resume_id}/share", tags = ["resumes"])
async def create_share_link(resume_id: str, share: ResumeShare, uuid: str = Depends(authorize)):
    try:
        model = share.model_dump()
        result = await resumes_dao.create_share_link(resume_id, model)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    return {"detail": "Share link generated", "share_link": result.get("token"), "share_data": result}

@resumes_router.get("/{resume_id}/share", tags = ["resumes"])
async def get_share_link(resume_id: str, uuid: str = Depends(authorize)):
    try:
        result = await resumes_dao.get_share_link(resume_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if result:
        return result
    else:
        raise HTTPException(400, "No active share link found")

@resumes_router.delete("/{resume_id}/share", tags = ["resumes"])
async def revoke_share_link(resume_id: str, uuid: str = Depends(authorize)):
    try:
        updated = await resumes_dao.revoke_share_link(resume_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if updated == 0:
        raise HTTPException(400, "Share link not found")
    else:
        return {"detail": "Share link revoked successfully"}