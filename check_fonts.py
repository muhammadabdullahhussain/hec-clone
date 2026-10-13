import fitz
doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]
for block in page.get_text("dict")["blocks"]:
    if "lines" in block:
        for line in block["lines"]:
            for span in line["spans"]:
                if "Saeed Ahmed" in span["text"] or "Bachelor of" in span["text"]:
                    print(f"TEXT: {span['text']} SIZE: {span['size']} FONT: {span['font']}")
