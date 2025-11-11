"""
LaTeX Resume Generator Service
Converts resume data to professional LaTeX output
Uses Tectonic for fast PDF compilation
"""

import subprocess
import tempfile
import os
from pathlib import Path


class LaTeXGenerator:
    """Generate professional LaTeX resumes from resume data"""

    @staticmethod
    def generate_latex(resume_data):
        """
        Generate LaTeX code from resume data
        Args:
            resume_data: Dictionary containing resume information
        Returns:
            LaTeX document string
        """
        contact = resume_data.get('contact', {})
        summary = resume_data.get('summary', '')
        experience = resume_data.get('experience', [])
        education = resume_data.get('education', [])
        skills = resume_data.get('skills', [])
        sections = resume_data.get('sections', ['contact', 'summary', 'experience', 'education', 'skills'])
        colors = resume_data.get('colors', {})
        fonts = resume_data.get('fonts', {})
        add_watermark = resume_data.get('watermark', False)
        print_optimized = resume_data.get('print_optimized', False)

        # Color definitions
        primary_color = colors.get('primary', '1a1a1a')
        accent_color = colors.get('accent', '2c3e50')

        # Remove # if present
        primary_color = primary_color.lstrip('#')
        accent_color = accent_color.lstrip('#')

        # Start LaTeX document
        # Use print-optimized settings if requested
        documentclass = r"\documentclass[11pt]{article}" if not print_optimized else r"\documentclass[11pt,draft]{article}"

        latex = documentclass + r"""
\usepackage[margin=0.5in]{geometry}
\usepackage{xcolor}
\usepackage{hyperref}
\usepackage{enumitem}
\usepackage{ragged2e}
"""

        # Add watermark package if watermark is enabled
        if add_watermark:
            latex += r"""\usepackage{draftwatermark}
\SetWatermarkText{Resume}
\SetWatermarkScale{0.15}
\SetWatermarkColor[gray]{0.9}
"""

        # Print optimization: reduce colors and optimize for printing
        if print_optimized:
            latex += r"""% Print optimization: convert colors to grayscale
\usepackage{calc}
"""

        latex += r"""
% Define colors
\definecolor{primary}{HTML}{""" + primary_color + r"""}
\definecolor{accent}{HTML}{""" + accent_color + r"""}

% Hyperlink color
\hypersetup{colorlinks=true, linkcolor=primary, urlcolor=primary}

% Section formatting
\newcommand{\sectiontitle}[1]{
    \vspace{8pt}
    {\large\textbf{\color{primary}#1}}
    \vspace{3pt}
    \hrule
    \vspace{6pt}
}

% Remove section numbers
\setcounter{secnumdepth}{0}

\begin{document}

% Remove indentation
\setlength{\parindent}{0pt}

"""

        # Helper function to format section content
        def format_contact_info():
            contact_lines = []
            if contact.get('name'):
                contact_lines.append(f"\\textbf{{\\Large {contact['name']}}}")

            contact_details = []
            if contact.get('phone'):
                contact_details.append(contact['phone'])
            if contact.get('email'):
                contact_details.append(f"\\href{{mailto:{contact['email']}}}{{{contact['email']}}}")
            if contact.get('address'):
                contact_details.append(contact['address'])
            if contact.get('linkedin'):
                linkedin_url = contact['linkedin']
                if not linkedin_url.startswith('http'):
                    linkedin_url = f"https://{linkedin_url}"
                contact_details.append(f"\\href{{{linkedin_url}}}{{LinkedIn}}")

            if contact_details:
                contact_lines.append(" \\textbar\\ ".join(contact_details))

            return "\n".join(contact_lines)

        def format_summary():
            if summary:
                return f"\\sectiontitle{{PROFESSIONAL SUMMARY}}\n{summary}\n"
            return ""

        def format_experience():
            if not experience or len(experience) == 0:
                return ""

            exp_text = "\\sectiontitle{PROFESSIONAL EXPERIENCE}\n"
            for exp in experience:
                exp_text += f"\\noindent\\textbf{{{exp.get('position', 'Job Title')}}} \n"
                exp_text += f"\\textit{{{exp.get('company', 'Company')}}} \\hfill {exp.get('startDate', '')} -- {exp.get('endDate', '')}\n"

                if exp.get('description'):
                    exp_text += f"{exp['description']}\n\n"

            return exp_text

        def format_education():
            if not education or len(education) == 0:
                return ""

            edu_text = "\\sectiontitle{EDUCATION}\n"
            for edu in education:
                degree = edu.get('degree', 'Degree')
                field = edu.get('field', '')
                if field:
                    degree = f"{degree} in {field}"

                edu_text += f"\\noindent\\textbf{{{degree}}} \n"
                edu_text += f"\\textit{{{edu.get('school', 'School')}}} \\hfill {edu.get('year', '')}\n\n"

            return edu_text

        def format_skills():
            if not skills or len(skills) == 0:
                return ""

            skills_text = "\\sectiontitle{SKILLS}\n"
            # Handle both string and object formats
            skill_list = []
            for skill in skills:
                if isinstance(skill, str):
                    skill_list.append(skill)
                elif isinstance(skill, dict):
                    skill_list.append(skill.get('name', ''))

            if skill_list:
                skills_text += ", ".join(skill_list) + "\n\n"

            return skills_text

        # Render sections in order
        section_renderers = {
            'contact': format_contact_info,
            'summary': format_summary,
            'experience': format_experience,
            'education': format_education,
            'skills': format_skills,
        }

        # Add sections in the specified order
        for section_id in sections:
            renderer = section_renderers.get(section_id)
            if renderer:
                latex += renderer()

        # Close document
        latex += r"""
\end{document}
"""

        return latex

    @staticmethod
    def compile_to_pdf(latex_content, output_path):
        """
        Compile LaTeX to PDF using Tectonic
        Args:
            latex_content: LaTeX document string
            output_path: Path where PDF should be saved
        Returns:
            True if successful, False otherwise
        """
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                # Write LaTeX to temporary file
                tex_file = os.path.join(tmpdir, 'resume.tex')
                with open(tex_file, 'w', encoding='utf-8') as f:
                    f.write(latex_content)

                # Compile with Tectonic
                result = subprocess.run(
                    ['tectonic', '--outdir', tmpdir, tex_file],
                    capture_output=True,
                    text=True,
                    timeout=10
                )

                if result.returncode != 0:
                    print(f"Tectonic error: {result.stderr}")
                    return False

                # Copy PDF to output location
                pdf_file = os.path.join(tmpdir, 'resume.pdf')
                if os.path.exists(pdf_file):
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                    with open(pdf_file, 'rb') as src:
                        with open(output_path, 'wb') as dst:
                            dst.write(src.read())
                    return True

            return False

        except subprocess.TimeoutExpired:
            print("LaTeX compilation timed out")
            return False
        except Exception as e:
            print(f"Error during LaTeX compilation: {e}")
            return False

    @staticmethod
    def generate_pdf(resume_data, output_path):
        """
        Generate PDF from resume data
        Args:
            resume_data: Resume dictionary
            output_path: Where to save the PDF
        Returns:
            True if successful, False otherwise
        """
        latex_content = LaTeXGenerator.generate_latex(resume_data)
        return LaTeXGenerator.compile_to_pdf(latex_content, output_path)
