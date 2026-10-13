import fitz

doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]

texts_to_find = [
    "Saeed Ahmed",
    "Mubara Naz",
    "3540139675680",
    "1998-11-13",
    "2026-07-16",
    "Bachelor of Science in Chemistry",
    "University of Education, Lahore",
    "23-UE-12367",
    "HEC/A&A/DAS/2026/5076464"
]

print("PAGE HEIGHT:", page.rect.height)
print("PAGE WIDTH:", page.rect.width)

for text in texts_to_find:
    rects = page.search_for(text)
    if rects:
        r = rects[0]
        # Convert to bottom-left origin for pdf-lib
        x = r.x0
        y = page.rect.height - r.y1
        print(f"TEXT '{text}' -> x: {x}, y: {y}")

images = page.get_images(full=True)
for img in images:
    name = img[7]
    if name in ['img4', 'img3']: # img4 is photo, img3 is QR
        rects = page.get_image_rects(name)
        if rects:
            r = rects[0]
            x = r.x0
            y = page.rect.height - r.y1
            print(f"IMAGE '{name}' -> x: {x}, y: {y}, w: {r.width}, h: {r.height}")
