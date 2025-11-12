"""
HTML to PDF Generator Service
Converts HTML resume to PDF using Playwright
Renders the exact same styling as the React frontend
"""

from playwright.async_api import async_playwright


class HTMLPDFGenerator:
    """Generate PDF from HTML resume rendering using Playwright"""

    @staticmethod
    async def generate_pdf_from_html_async(html_content: str) -> bytes:
        """
        Generate PDF from HTML content using Playwright

        Args:
            html_content: Complete HTML string with inline styles

        Returns:
            PDF file content as bytes
        """
        # Ensure html_content is a string
        if not isinstance(html_content, str):
            raise TypeError(f"html_content must be a string, got {type(html_content).__name__}")

        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()

            try:
                # Set HTML content
                await page.set_content(html_content)

                # Generate PDF
                pdf_bytes = await page.pdf(
                    format='Letter',
                    margin={'top': '0.5in', 'right': '0.5in', 'bottom': '0.5in', 'left': '0.5in'},
                )

                return pdf_bytes
            finally:
                await browser.close()

    @staticmethod
    async def generate_pdf_from_html(html_content: str) -> bytes:
        """
        Generate PDF from HTML content (async)

        Args:
            html_content: Complete HTML string with inline styles

        Returns:
            PDF file content as bytes
        """
        try:
            pdf_bytes = await HTMLPDFGenerator.generate_pdf_from_html_async(html_content)
            return pdf_bytes
        except Exception as e:
            print(f"[HTMLPDFGenerator] Error generating PDF: {e}")
            raise

    @staticmethod
    def build_resume_html_from_data(resume_data: dict) -> str:
        """
        Build HTML resume from resume data

        Args:
            resume_data: Resume object from MongoDB

        Returns:
            HTML string for the resume
        """
        contact = resume_data.get('contact', {})

        # Build contact header
        contact_html = f"""
        <div class="resume-header">
            <div class="resume-name">{contact.get('name', 'Your Name')}</div>
            <div class="contact-line">
                {contact.get('email', '')} | {contact.get('phone', '')} | {contact.get('address', '')}
            </div>
        </div>
        """

        # Build summary
        summary_html = ""
        if resume_data.get('summary'):
            summary_html = f"""
            <div class="resume-section">
                <div class="section-heading">Professional Summary</div>
                <div class="summary-text">{resume_data['summary']}</div>
            </div>
            """

        # Build experience
        experience_html = ""
        if resume_data.get('experience'):
            experience_html = '<div class="resume-section"><div class="section-heading">Experience</div>'
            for exp in resume_data['experience']:
                experience_html += f"""
                <div class="experience-entry">
                    <div class="exp-header-row">
                        <div class="job-title">{exp.get('title', '')}</div>
                        <div class="date-range">{exp.get('start_date', '')} - {exp.get('end_date', '')}</div>
                    </div>
                    <div class="company-name">{exp.get('company', '')}</div>
                    <div class="description">{exp.get('description', '')}</div>
                </div>
                """
            experience_html += '</div>'

        # Build education
        education_html = ""
        if resume_data.get('education'):
            education_html = '<div class="resume-section"><div class="section-heading">Education</div>'
            for edu in resume_data['education']:
                education_html += f"""
                <div class="education-entry">
                    <div class="degree">{edu.get('degree', '')}</div>
                    <div class="school-name">{edu.get('school', '')}</div>
                    <div class="graduation-year">{edu.get('graduation_year', '')}</div>
                </div>
                """
            education_html += '</div>'

        # Build skills
        skills_html = ""
        if resume_data.get('skills'):
            skills_html = '<div class="resume-section"><div class="section-heading">Skills</div><div class="skills-content">'
            for skill in resume_data['skills']:
                skill_text = skill if isinstance(skill, str) else skill.get('name', '')
                skills_html += f'<span class="skill-item">{skill_text}</span> | '
            skills_html = skills_html.rstrip(' | ')  # Remove trailing separator
            skills_html += '</div></div>'

        # Build final HTML
        resume_html = f"""
        <div class="resume-preview template-{resume_data.get('template', 'professional-clean')}">
            {contact_html}
            {summary_html}
            {experience_html}
            {education_html}
            {skills_html}
        </div>
        """

        return resume_html

    @staticmethod
    def wrap_resume_html(resume_html: str) -> str:
        """
        Wrap resume HTML with proper page styling for PDF export

        Args:
            resume_html: The resume content HTML

        Returns:
            Complete HTML document with CSS for PDF
        """
        full_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #000;
            background: white;
        }}

        .resume-preview {{
            max-width: 8.5in;
            margin: 0 auto;
            padding: 40px;
            background: white;
            font-size: 14px;
        }}

        @page {{
            size: 8.5in 11in;
            margin: 0;
        }}

        /* Template-specific styles */
        .template-professional-clean .resume-header {{
            border-bottom: 3px solid #003366;
        }}

        .template-professional-clean .section-heading {{
            color: #003366;
            border-bottom: 2px solid #003366;
        }}

        .template-modern-bold .resume-header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            margin: -40px -40px 20px -40px;
        }}

        .template-modern-bold .section-heading {{
            background-color: rgba(102, 126, 234, 0.1);
            color: #667eea;
            border-left: 5px solid #667eea;
            padding: 8px 12px;
        }}

        .template-modern-gradient .gradient-divider {{
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            margin: 15px 0;
        }}

        .template-minimal-zen {{
            font-size: 12px;
            line-height: 1.3;
        }}

        .template-minimal-zen .resume-header {{
            border: none;
        }}

        .template-creative-vibrant .resume-header {{
            background: linear-gradient(90deg, #ff6b6b 0%, #ee5a6f 100%);
            color: white;
            padding: 20px;
            margin: -40px -40px 20px -40px;
        }}

        .template-creative-vibrant .section-heading {{
            color: #ff6b6b;
            border-bottom: 3px solid #ff6b6b;
        }}

        .template-academic-formal .resume-header {{
            text-align: center;
            border-bottom: 1px solid #333;
        }}

        .resume-name {{
            font-weight: bold;
            font-size: 24px;
            margin-bottom: 8px;
        }}

        .section-heading {{
            font-weight: bold;
            font-size: 13px;
            text-transform: uppercase;
            margin-top: 15px;
            margin-bottom: 8px;
        }}

        .job-title, .degree {{
            font-weight: bold;
            margin-top: 8px;
        }}

        .company-name, .school-name {{
            font-style: italic;
            margin: 2px 0;
        }}

        .skill-item {{
            display: inline;
        }}

        .experience-entry, .education-entry {{
            margin-bottom: 8px;
        }}
    </style>
</head>
<body>
    {resume_html}
</body>
</html>
"""
        return full_html
