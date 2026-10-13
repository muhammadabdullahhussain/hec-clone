import fitz

doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]

# 1. Delete Photo & QR Code
page.delete_image(22)
page.delete_image(23)

# 2. Text redactions
student_texts = ['Saeed Ahmed', 'Mubara Naz', '3540139675680', '1998-11-13', '2026-07-16']
for t in student_texts:
    for r in page.search_for(t):
        page.add_redact_annot(r, fill=None)

# Reference No line
for r in page.search_for('Reference No.'):
    ref_line_rect = fitz.Rect(130.0, r.y0 - 2, 460.0, r.y1 + 2)
    page.add_redact_annot(ref_line_rect, fill=None)

# QR Code URL line
qr_url_rect = fitz.Rect(450.0, 125.0, 580.0, 142.0)
page.add_redact_annot(qr_url_rect, fill=None)

# Attestation paragraph (entire area from y=615 to y=655, x=50 to 570)
attest_rect = fitz.Rect(50.0, 615.0, 570.0, 655.0)
page.add_redact_annot(attest_rect, fill=None)

# Bottom Box text & underline (entire area inside bottom box: y=710 to 745, x=60 to 560)
bottom_rect = fitz.Rect(60.0, 710.0, 560.0, 745.0)
page.add_redact_annot(bottom_rect, fill=None)

page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)
doc.save('public/blank_certificate.pdf')
print('Perfect blank_certificate.pdf created in public folder!')

