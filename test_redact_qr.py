import fitz

doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]

# Redact the QR link
qr_link_rect = fitz.Rect(455.0, 125.0, 580.0, 142.0)
page.add_redact_annot(qr_link_rect, fill=None)
page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

# Render to image to see if text is visibly gone
pix = page.get_pixmap()
pix.save("public/test_redacted_qr.png")
print("Saved to test_redacted_qr.png")
