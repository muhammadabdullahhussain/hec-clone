import fitz

doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]
image_list = page.get_images(full=True)
print(f"Found {len(image_list)} images on page 1")

for img_index, img in enumerate(image_list):
    xref = img[0]
    base_image = doc.extract_image(xref)
    image_bytes = base_image["image"]
    image_ext = base_image["ext"]
    image_filename = f"extracted_img_{img_index}.{image_ext}"
    with open(image_filename, "wb") as f:
        f.write(image_bytes)
    print(f"Saved {image_filename}")
