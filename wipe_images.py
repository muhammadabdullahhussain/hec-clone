import fitz

doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]

# Create a 1x1 transparent png
from PIL import Image
img = Image.new('RGBA', (1, 1), (0, 0, 0, 0))
img.save("trans.png")

# Get xrefs of img4 and img3
images = page.get_images(full=True)
for img_info in images:
    xref = img_info[0]
    name = img_info[7]
    if name in ['img4', 'img3']:
        doc.replace_image(xref, filename="trans.png")

# Redact text
texts_to_remove = ["Saeed Ahmed", "Mubara Naz", "3540139675680", "1998-11-13", "2026-07-16", "Bachelor of Science in Chemistry", "University of Education, Lahore", "23-UE-12367", "HEC/A&A/DAS/2026/5076464"]
for text in texts_to_remove:
    rects = page.search_for(text)
    for rect in rects:
        page.add_redact_annot(rect, fill=None)

# Use REMOVE to avoid modifying images (so we don't lose masks)
page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_REMOVE)

doc.save("public/blank_certificate.pdf")
print("Perfect blank template created!")
