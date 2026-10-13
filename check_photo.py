import fitz
d=fitz.open('public/blank_certificate.pdf')
p=d[0]
print([i[7] for i in p.get_images(full=True)])
