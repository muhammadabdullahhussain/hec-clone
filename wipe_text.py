import fitz

doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]

texts_to_remove = [
    "Saeed Ahmed", 
    "Mubara Naz", 
    "3540139675680", 
    "1998-11-13", 
    "2026-07-16", 
    "HEC attests/recognizes the Bachelor of Science in Chemistry (Degree) of above named person issued by", 
    "University of Education, Lahore with Registration No./Roll No./Seat No./Enrollment No./Student ID 23-UE-12367", 
    "Reference No. HEC/A&A/DAS/2026/5076464"
]

for text in texts_to_remove:
    rects = page.search_for(text)
    for rect in rects:
        page.add_redact_annot(rect, fill=None)

# Wipe the entire bottom box text (both lines) and its vector underline
bottom_rect = fitz.Rect(60.0, 710.0, 560.0, 745.0)
page.add_redact_annot(bottom_rect, fill=None)

# Wipe the QR Code URL and its underline
qr_link_rect = fitz.Rect(455.0, 125.0, 580.0, 142.0)
page.add_redact_annot(qr_link_rect, fill=None)

page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)
doc.save("public/blank_certificate.pdf")
print("Blank template created successfully with full bottom box redaction!")
