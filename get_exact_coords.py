import fitz

doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]

def print_coords(text):
    rects = page.search_for(text)
    if rects:
        # PyMuPDF coords: (x0, y0, x1, y1). pdf-lib baseline Y roughly = 792 - y1
        print(f"TEXT '{text}' -> BBox: {rects[0]}, pdf-lib Y (Baseline): {792 - rects[0][3]}")
    else:
        print(f"TEXT '{text}' -> NOT FOUND")

print_coords("Mubara Naz")
print_coords("Saeed Ahmed")
print_coords("3540139675680")
print_coords("1998-11-13")
print_coords("2026-07-16")
print_coords("Reference No. HEC/A&A/DAS/2026/5076464")
print_coords("Please visit")

# Find QR Code Image BBox
images = page.get_images(full=True)
print(f"Found {len(images)} images.")
# Usually the QR code is the second or third image. Let's just print all image rects.
for item in page.get_image_info():
    print(f"Image BBox: {item['bbox']}")

