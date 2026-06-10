import sys
from PIL import Image

def make_solid_bg(input_path, output_path, bg_color=(0, 0, 0)):
    try:
        # Open the image with alpha channel
        img = Image.open(input_path).convert("RGBA")
        
        # Create a solid black background
        background = Image.new("RGBA", img.size, bg_color + (255,))
        
        # Composite the image onto the background
        composite = Image.alpha_composite(background, img)
        
        # Convert to RGB (remove alpha) and save
        final_img = composite.convert("RGB")
        final_img.save(output_path, "PNG")
        
        print(f"Successfully created {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    make_solid_bg("assets/logo.png", "assets/logo_app.png")
