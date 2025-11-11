"""
LaTeX Resume Generator Service
Converts resume data to professional LaTeX output
Uses Tectonic for fast PDF compilation
"""

import subprocess
import tempfile
import os
from pathlib import Path


def initialize_tectonic_bundle():
    """
    Pre-initialize Tectonic bundle by running a simple compile.
    This downloads the bundle if it's not already cached.
    Call this once on startup if internet is available.
    """
    try:
        print("[LaTeXGenerator] Attempting to initialize Tectonic bundle...")
        with tempfile.TemporaryDirectory() as tmpdir:
            test_tex = os.path.join(tmpdir, 'test.tex')
            with open(test_tex, 'w') as f:
                f.write(r'\documentclass{article}\begin{document}Test\end{document}')

            result = subprocess.run(
                ['tectonic', '--outdir', tmpdir, test_tex],
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0:
                print("[LaTeXGenerator] Tectonic bundle initialized successfully")
                return True
            else:
                print(f"[LaTeXGenerator] Bundle initialization failed: {result.stderr[:200]}")
                return False
    except Exception as e:
        print(f"[LaTeXGenerator] Could not initialize bundle: {e}")
        return False


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
        if not resume_data:
            raise ValueError("Resume data is empty")

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

        print(f"[LaTeXGenerator] Generating LaTeX for resume with contact: {bool(contact)}, experience items: {len(experience)}, education items: {len(education)}")

        # Color definitions
        primary_color = colors.get('primary', '1a1a1a')
        accent_color = colors.get('accent', '2c3e50')

        # Remove # if present
        primary_color = primary_color.lstrip('#')
        accent_color = accent_color.lstrip('#')

        # Start LaTeX document - use minimal setup for compatibility
        latex = r"""\documentclass[11pt]{article}
\usepackage[margin=0.5in]{geometry}
\usepackage{xcolor}

% Define colors
\definecolor{primary}{HTML}{""" + primary_color + r"""}
\definecolor{accent}{HTML}{""" + accent_color + r"""}

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
                # Simple email without hyperref
                contact_details.append(contact['email'])
            if contact.get('address'):
                contact_details.append(contact['address'])
            if contact.get('linkedin'):
                # Simple linkedin without hyperref
                linkedin_url = contact['linkedin']
                if linkedin_url.startswith('http'):
                    linkedin_url = linkedin_url.split('/')[-1]
                contact_details.append(f"LinkedIn: {linkedin_url}")

            if contact_details:
                contact_lines.append(" | ".join(contact_details))

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
                exp_text += f"\\textbf{{{exp.get('position', 'Job Title')}}} \\\n"
                exp_text += f"\\textit{{{exp.get('company', 'Company')}}} {exp.get('startDate', '')} -- {exp.get('endDate', '')}\\\n"

                if exp.get('description'):
                    exp_text += f"{exp['description']}\n"

                exp_text += "\n"

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
        Compile LaTeX to PDF using Tectonic or pdflatex
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

                # Try Tectonic first
                success = LaTeXGenerator._try_tectonic(tmpdir, tex_file)

                # If Tectonic fails, try pdflatex
                if not success:
                    print("[LaTeXGenerator] Tectonic failed, trying pdflatex...")
                    success = LaTeXGenerator._try_pdflatex(tmpdir, tex_file)

                if not success:
                    print("[LaTeXGenerator] Both Tectonic and pdflatex failed")
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
            print("[LaTeXGenerator] LaTeX compilation timed out (10 seconds)")
            return False
        except Exception as e:
            print(f"[LaTeXGenerator] Error during compilation: {type(e).__name__}: {e}")
            return False

    @staticmethod
    def _try_tectonic(tmpdir, tex_file):
        """Try to compile using Tectonic"""
        try:
            result = subprocess.run(
                ['tectonic', '--only-cached', '--outdir', tmpdir, tex_file],
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode == 0:
                print("[LaTeXGenerator] Tectonic compilation successful")
                return True

            print(f"[LaTeXGenerator] Tectonic error (--only-cached): {result.stderr[:200]}")

            # Try without --only-cached if internet might be available
            result = subprocess.run(
                ['tectonic', '--outdir', tmpdir, tex_file],
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode == 0:
                print("[LaTeXGenerator] Tectonic compilation successful (with bundle download)")
                return True

            print(f"[LaTeXGenerator] Tectonic error: {result.stderr[:200]}")
            return False

        except FileNotFoundError:
            print("[LaTeXGenerator] Tectonic not found")
            return False
        except subprocess.TimeoutExpired:
            print("[LaTeXGenerator] Tectonic timed out")
            return False
        except Exception as e:
            print(f"[LaTeXGenerator] Tectonic error: {e}")
            return False

    @staticmethod
    def _try_pdflatex(tmpdir, tex_file):
        """Try to compile using pdflatex (fallback)"""
        try:
            result = subprocess.run(
                ['pdflatex', '-interaction=nonstopmode', '-output-directory', tmpdir, tex_file],
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0:
                print("[LaTeXGenerator] pdflatex compilation successful")
                return True

            print(f"[LaTeXGenerator] pdflatex error: {result.stderr[:200]}")
            return False

        except FileNotFoundError:
            print("[LaTeXGenerator] pdflatex not found (install MiKTeX or TeX Live)")
            return False
        except subprocess.TimeoutExpired:
            print("[LaTeXGenerator] pdflatex timed out")
            return False
        except Exception as e:
            print(f"[LaTeXGenerator] pdflatex error: {e}")
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
