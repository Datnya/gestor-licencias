import sys
from PIL import Image

def make_icon(input_path, output_path, bg_color=(0, 0, 0), size=512, safe_zone_diameter=320):
    try:
        # Open the image with alpha channel
        img = Image.open(input_path).convert("RGBA")
        
        # Calculate target size so it fits inside the safe zone (to avoid being cut by Android circular icon)
        ratio = min(safe_zone_diameter / img.width, safe_zone_diameter / img.height)
        new_size = (int(img.width * ratio), int(img.height * ratio))
        
        # Resize image smoothly
        img_resized = img.resize(new_size, Image.Resampling.LANCZOS)
        
        # Create solid background
        background = Image.new("RGBA", (size, size), bg_color + (255,))
        
        # Calculate centering position
        offset = ((size - new_size[0]) // 2, (size - new_size[1]) // 2)
        
        # Paste resized image onto background using the alpha channel as a mask
        background.paste(img_resized, offset, img_resized)
        
        # Convert to RGB (remove alpha) and save
        final_img = background.convert("RGB")
        final_img.save(output_path, "PNG")
        
        print(f"Successfully created {output_path} with proper safe zone padding.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Create the 512x512 icon, with a safe zone of 320px to ensure it fits in circular crop
    make_icon("assets/logo.png", "assets/logo_app_v2.png", size=512, safe_zone_diameter=320)
