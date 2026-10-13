import fitz

doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]
image_list = page.get_images(full=True)

for img_index, img in enumerate(image_list):
    xref = img[0]
    base_image = doc.extract_image(xref)
    print(f"Image {img_index}: ext={base_image['ext']}, width={base_image['width']}, height={base_image['height']}")
