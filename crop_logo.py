from PIL import Image

def remove_bg_and_crop(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    # threshold for black
    threshold = 50
    for item in data:
        # If it's very dark (black background), make it transparent
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # Now crop to bounding box
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")

remove_bg_and_crop("assets/logo.jpg", "assets/logo.png")
