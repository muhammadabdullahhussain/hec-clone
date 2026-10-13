import fitz
doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]
for block in page.get_text("dict")["blocks"]:
    if "lines" in block:
        for line in block["lines"]:
            for span in line["spans"]:
                if "Please visit" in span["text"]:
                    # PyMuPDF coords are top-left based. Page height is 792.
                    # pdf-lib Y = 792 - PyMuPDF_bottom_Y
                    print(f"TEXT: {span['text']} BBOX: {span['bbox']} PDF-LIB Y: {792 - span['bbox'][3]}")
