import fitz

doc = fitz.open('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf')
page = doc[0]

text_instances = page.search_for("Reference No. HEC")
print("Search BBox for 'Reference No. HEC':", text_instances)

blocks = page.get_text("dict")["blocks"]
for b in blocks:
    if "lines" in b:
        for l in b["lines"]:
            for s in l["spans"]:
                if "Reference" in s["text"] or "HEC/A&A" in s["text"]:
                    print(f"Text: '{s['text']}'")
                    print(f"Font: {s['font']}, Size: {s['size']}, Flags: {s['flags']}")
                    print(f"BBox: {s['bbox']}")
                    print(f"pdf-lib Y (baseline): {792 - s['origin'][1]}")
