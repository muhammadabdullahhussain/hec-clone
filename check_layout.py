import fitz

doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]

print("Images:")
for item in page.get_images(full=True):
    print(item)

print("\nText Blocks:")
blocks = page.get_text("blocks")
for b in blocks:
    print(b)
