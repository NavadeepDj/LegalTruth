"""Generate sample Employment Agreement PDF for LegalTruth demo."""

import os
import fitz  # PyMuPDF


def create_sample_pdf(output_paths: list[str]):
    doc = fitz.open()

    # PAGE 1
    page1 = doc.new_page(width=595, height=842)  # A4
    page1.insert_text((50, 60), "STANDARD EMPLOYMENT AGREEMENT", fontsize=16, fontname="helv", fontfile=None)
    page1.insert_text((50, 85), "This Employment Agreement (the 'Agreement') is entered into as of January 15, 2026, by and between:", fontsize=10)
    page1.insert_text((50, 105), "EMPLOYER: TechFlow Innovations Inc., a Delaware corporation ('Company')", fontsize=10)
    page1.insert_text((50, 120), "EMPLOYEE: Jane Doe, an individual residing in California ('Employee')", fontsize=10)

    p1_content = """
Section 1: Position and Duties
The Company hereby employs Employee as Senior Systems Architect. Employee agrees to perform all duties and responsibilities assigned to this role in a professional and diligent manner, adhering to all company guidelines.

Section 2: Term of Employment
The employment relationship under this Agreement shall commence on February 1, 2026, and continue indefinitely until terminated by either party in accordance with the provisions of Section 7 herein.

Section 3: Compensation, Salary and Benefits
3.1 Base Salary: The Company shall pay Employee a base annual salary of $165,000, payable semi-monthly in accordance with normal payroll practices.
3.2 Benefits: Employee shall be eligible to participate in standard company health, dental, vision insurance, and 401(k) retirement plans with 4% company match.
3.3 Paid Time Off: Employee shall accrue twenty (20) days of paid time off (PTO) annually.
"""
    page1.insert_textbox(fitz.Rect(50, 140, 545, 780), p1_content.strip(), fontsize=10, fontname="times-roman", lineheight=1.5)

    # PAGE 2
    page2 = doc.new_page(width=595, height=842)
    page2.insert_text((50, 50), "TECHFLOW INNOVATIONS INC. — EMPLOYMENT AGREEMENT (PAGE 2)", fontsize=9, color=(0.4, 0.4, 0.4))

    p2_content = """
Section 4: Confidentiality and Proprietary Information
4.1 Confidential Information: Employee acknowledges that during employment, Employee will have access to confidential trade secrets, software architectures, algorithms, financial data, client lists, and strategic business plans.
4.2 Non-Disclosure: Employee agrees to hold all Confidential Information in strict trust and shall not disclose, duplicate, or release any confidential proprietary materials to third parties without prior written consent from the Board of Directors.
4.3 Duration: The obligations under this Section 4 shall survive termination of employment for a period of five (5) years.

Section 5: Intellectual Property and Inventions
All discoveries, inventions, works of authorship, and patents conceived or developed by Employee during the term of employment that relate directly to the Company's business shall remain the sole and exclusive property of the Company as 'works made for hire'.

Section 6: Restrictive Covenants and Non-Solicitation
During employment and for twelve (12) months following termination, Employee shall not directly or indirectly solicit, induce, or encourage any employee, contractor, or customer of the Company to terminate their business relationship with the Company.
"""
    page2.insert_textbox(fitz.Rect(50, 80, 545, 780), p2_content.strip(), fontsize=10, fontname="times-roman", lineheight=1.5)

    # PAGE 3
    page3 = doc.new_page(width=595, height=842)
    page3.insert_text((50, 50), "TECHFLOW INNOVATIONS INC. — EMPLOYMENT AGREEMENT (PAGE 3)", fontsize=9, color=(0.4, 0.4, 0.4))

    p3_content = """
Section 7: Termination of Employment and Notice Period
7.1 Termination for Cause: The Company may terminate Employee's employment immediately upon written notice for 'Cause', including gross misconduct, fraud, felony conviction, or material breach of this Agreement.
7.2 Termination Without Cause and Notice Period: Either party may terminate this agreement without cause subject to a notice period of ninety (90) days written notice delivered to the other party. During the 90-day notice period, Employee shall continue to receive standard compensation and cooperate fully in transition duties.
7.3 Severance: In the event Company terminates Employee without Cause, Company shall pay two (2) months of base salary as severance, subject to execution of a standard general release.

Section 8: Governing Law and Dispute Resolution
This Agreement shall be governed by and construed in accordance with the laws of the State of California. Any controversy or dispute arising under this Agreement shall be settled by binding arbitration administered by JAMS under its Employment Arbitration Rules.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement:

_________________________________             _________________________________
TechFlow Innovations Inc. (Employer)            Jane Doe (Employee)
Date: January 15, 2026                          Date: January 15, 2026
"""
    page3.insert_textbox(fitz.Rect(50, 80, 545, 780), p3_content.strip(), fontsize=10, fontname="times-roman", lineheight=1.5)

    # Save to paths
    for path in output_paths:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        doc.save(path)
        print(f"Saved PDF to {path}")

    doc.close()


if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    sample_path1 = os.path.join(base_dir, "sample_docs", "employment_agreement.pdf")
    sample_path2 = os.path.join(base_dir, "frontend", "public", "sample", "employment_agreement.pdf")
    create_sample_pdf([sample_path1, sample_path2])
