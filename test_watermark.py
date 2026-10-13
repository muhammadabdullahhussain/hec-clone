import fitz

doc = fitz.open('public/blank_certificate.pdf')
page = doc[0]
page_img = page.get_pixmap(dpi=150)
page_img.save('test_redact_render.png')
