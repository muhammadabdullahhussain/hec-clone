import fitz

doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]

def print_bbox(text):
    rects = page.search_for(text)
    if rects:
        print(f"'{text}': {rects[0]}, pdf-lib Y (bottom): {792 - rects[0][3]}, pdf-lib Y (top): {792 - rects[0][1]}")

print_bbox("Higher Education Commission")
print_bbox("e-Attestation Certificate")
