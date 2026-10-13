import fitz

doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]
drawings = page.get_drawings()
print(f"Found {len(drawings)} drawings")
