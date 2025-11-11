"""
PDF Generation Routes
Handles resume PDF generation via LaTeX
Related to UC-053: Export Resume
"""

from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.responses import FileResponse
import tempfile
import os

from mongo.resumes_dao import resumes_dao
from sessions.session_authorizer import authorize
from services.latex_generator import LaTeXGenerator

pdf_router = APIRouter(prefix="/resumes")


@pdf_router.post("/{resume_id}/generate-pdf", tags=["resumes"])
async def generate_resume_pdf(resume_id: str, options: dict = Body(None), uuid: str = Depends(authorize)):
    """
    Generate PDF from resume data using LaTeX
    Supports watermark and print optimization options
    Related to UC-053: Export Resume
    """
    try:
        # Fetch resume from database
        resume = await resumes_dao.get_resume(resume_id)

        if not resume:
            raise HTTPException(404, "Resume not found")

        # Verify ownership
        if resume.get("uuid") != uuid:
            raise HTTPException(403, "Not authorized to access this resume")

        # Merge options into resume data if provided
        if options:
            resume['watermark'] = options.get('watermark', False)
            resume['print_optimized'] = options.get('print_optimized', False)

        # Generate PDF
        with tempfile.TemporaryDirectory() as tmpdir:
            pdf_path = os.path.join(tmpdir, f"{resume_id}.pdf")

            # Generate PDF from resume data
            success = LaTeXGenerator.generate_pdf(resume, pdf_path)

            if not success:
                raise HTTPException(500, "Failed to generate PDF")

            if not os.path.exists(pdf_path):
                raise HTTPException(500, "PDF generation failed")

            # Read PDF into memory
            with open(pdf_path, 'rb') as f:
                pdf_content = f.read()

            return {
                "success": True,
                "message": "PDF generated successfully",
                "pdf": pdf_content.hex(),  # Return as hex string for JSON
                "filename": f"{resume.get('name', 'resume')}.pdf"
            }

    except HTTPException as http:
        raise http
    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise HTTPException(500, "Encountered internal server error")


@pdf_router.post("/{resume_id}/preview-pdf", tags=["resumes"])
async def preview_resume_pdf(resume_id: str, resume_data: dict = Body(...), uuid: str = Depends(authorize)):
    """
    Generate a preview PDF for the current resume state
    Used for live preview during editing
    Related to UC-053: Export Resume
    """
    try:
        # Fetch original resume to verify ownership
        resume = await resumes_dao.get_resume(resume_id)

        if not resume:
            raise HTTPException(404, "Resume not found")

        if resume.get("uuid") != uuid:
            raise HTTPException(403, "Not authorized to access this resume")

        # Generate PDF from provided data (preview state)
        with tempfile.TemporaryDirectory() as tmpdir:
            pdf_path = os.path.join(tmpdir, f"{resume_id}_preview.pdf")

            # Generate PDF from resume data
            success = LaTeXGenerator.generate_pdf(resume_data, pdf_path)

            if not success:
                raise HTTPException(500, "Failed to generate PDF preview")

            if not os.path.exists(pdf_path):
                raise HTTPException(500, "PDF preview generation failed")

            # Read PDF into memory
            with open(pdf_path, 'rb') as f:
                pdf_content = f.read()

            return {
                "success": True,
                "message": "PDF preview generated successfully",
                "pdf": pdf_content.hex(),  # Return as hex string for JSON
            }

    except HTTPException as http:
        raise http
    except Exception as e:
        print(f"Error generating PDF preview: {e}")
        raise HTTPException(500, "Encountered internal server error")
