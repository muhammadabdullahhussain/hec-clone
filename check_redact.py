import fitz

doc = fitz.open('redacted_test.pdf')
page = doc[0]
print("Images after redaction:", len(page.get_images(full=True)))
print("Drawings after redaction:", len(page.get_drawings()))
print("Text after redaction includes Saeed Ahmed?", "Saeed Ahmed" in page.get_text())
