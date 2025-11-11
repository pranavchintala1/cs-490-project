"""
PDF Generation Routes
Handles resume PDF generation via LaTeX
Related to UC-053: Export Resume
"""

from fastapi import APIRouter, HTTPException, Depends, Body, Request
from fastapi.responses import FileResponse
import tempfile
import os
import json

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
        error_msg = str(e)
        print(f"Error generating PDF: {error_msg}")
        raise HTTPException(500, f"PDF generation error: {error_msg}")


@pdf_router.post("/{resume_id}/preview-pdf", tags=["resumes"])
async def preview_resume_pdf(resume_id: str, request: Request, uuid: str = Depends(authorize)):
    """
    Generate a preview PDF for the current resume state
    Used for live preview during editing
    Related to UC-053: Export Resume
    """
    try:
        print(f"[Preview PDF] Starting preview for resume_id={resume_id}, uuid={uuid}")

        # Fetch original resume to verify ownership
        resume = await resumes_dao.get_resume(resume_id)

        if not resume:
            raise HTTPException(404, "Resume not found")

        if resume.get("uuid") != uuid:
            raise HTTPException(403, "Not authorized to access this resume")

        # Get resume data from request body
        try:
            resume_data = await request.json()
            print(f"[Preview PDF] Successfully parsed JSON body")
        except json.JSONDecodeError as json_err:
            print(f"[Preview PDF] Invalid JSON in request body: {json_err}")
            raise HTTPException(400, f"Invalid JSON in request body: {json_err}")
        except Exception as parse_err:
            print(f"[Preview PDF] Error parsing request body: {parse_err}")
            raise HTTPException(400, f"Error parsing request body: {parse_err}")

        if not resume_data:
            print(f"[Preview PDF] Resume data is empty")
            raise HTTPException(400, "Resume data is empty")

        # Generate PDF from provided data (preview state)
        with tempfile.TemporaryDirectory() as tmpdir:
            pdf_path = os.path.join(tmpdir, f"{resume_id}_preview.pdf")

            print(f"[Preview PDF] Generating PDF with LaTeX generator")
            # Generate PDF from resume data
            success = LaTeXGenerator.generate_pdf(resume_data, pdf_path)

            if not success:
                print(f"[Preview PDF] LaTeX generation failed")
                raise HTTPException(500, "Failed to generate PDF preview - LaTeX compilation error")

            if not os.path.exists(pdf_path):
                print(f"[Preview PDF] PDF file was not created at {pdf_path}")
                raise HTTPException(500, "PDF preview generation failed - file not created")

            # Read PDF into memory
            try:
                with open(pdf_path, 'rb') as f:
                    pdf_content = f.read()
                print(f"[Preview PDF] Successfully read PDF file ({len(pdf_content)} bytes)")
            except Exception as read_err:
                print(f"[Preview PDF] Error reading PDF file: {read_err}")
                raise HTTPException(500, f"Error reading PDF file: {read_err}")

            return {
                "success": True,
                "message": "PDF preview generated successfully",
                "pdf": pdf_content.hex(),  # Return as hex string for JSON
            }

    except HTTPException as http:
        print(f"[Preview PDF] HTTP Exception: {http.status_code} - {http.detail}")
        raise http
    except Exception as e:
        error_msg = str(e)
        print(f"[Preview PDF] Unexpected error: {type(e).__name__}: {error_msg}")
        raise HTTPException(500, f"PDF generation error: {error_msg}")
