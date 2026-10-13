from PIL import Image

img = Image.open('public/extracted_img_3.png').convert('L')
width, height = img.size

left, top, right, bottom = width, height, 0, 0

for y in range(height):
    for x in range(width):
        if img.getpixel((x, y)) < 128:
            if x < left: left = x
            if x > right: right = x
            if y < top: top = y
            if y > bottom: bottom = y

print(f"Original Image Size: {width}x{height}")
print(f"Black Square BBox inside image: left={left}, top={top}, right={right}, bottom={bottom}")
print(f"Black Square Width: {right - left + 1}")
print(f"Black Square Height: {bottom - top + 1}")
