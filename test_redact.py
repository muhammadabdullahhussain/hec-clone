import fitz

doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]

# Add redaction for the name "Saeed Ahmed"
rects = page.search_for("Saeed Ahmed")
for rect in rects:
    page.add_redact_annot(rect, fill=None)  # None means no fill color!

# Add redaction for the photo (img 2)
# Add redaction for the QR code (img 3)
page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

doc.save("redacted_test.pdf")
