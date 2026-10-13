import fitz
doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]
images = page.get_images()
for i, img in enumerate(images):
    xref = img[0]
    pix = fitz.Pixmap(doc, xref)
    pix.save(f"public/extracted_img_{i}.png")
