#!/usr/bin/env python3
"""
Generate Chrome extension icons from a base 128x128 image.
Usage: python3 generateIcons.py path/to/icon128.png
"""

import sys
from PIL import Image
import os

def generate_icons(base_image_path):
    """Generate 16, 48, and 128px icons from a base 128x128 image."""
    if not os.path.exists(base_image_path):
        print(f"Error: {base_image_path} not found")
        return
    
    # Create icons directory if it doesn't exist
    icons_dir = "public/icons"
    os.makedirs(icons_dir, exist_ok=True)
    
    # Open the base image
    base_image = Image.open(base_image_path)
    
    # Generate icons in different sizes
    sizes = [16, 48, 128]
    for size in sizes:
        # Resize the image
        resized = base_image.resize((size, size), Image.Resampling.LANCZOS)
        
        # Save the icon
        output_path = os.path.join(icons_dir, f"icon{size}.png")
        resized.save(output_path, "PNG")
        print(f"Generated {output_path} ({size}x{size})")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 generateIcons.py path/to/icon128.png")
        print("\nFor now, creating placeholder icons...")
        # Create placeholder icons using PIL
        from PIL import Image, ImageDraw
        
        icons_dir = "public/icons"
        os.makedirs(icons_dir, exist_ok=True)
        
        for size in [16, 48, 128]:
            img = Image.new('RGB', (size, size), color='#3b82f6')
            draw = ImageDraw.Draw(img)
            # Draw a simple hand wave icon (circle with line)
            center = size // 2
            radius = size // 3
            draw.ellipse([center - radius, center - radius, center + radius, center + radius], 
                        fill='white', outline='white', width=2)
            output_path = os.path.join(icons_dir, f"icon{size}.png")
            img.save(output_path, "PNG")
            print(f"Generated placeholder {output_path} ({size}x{size})")
    else:
        generate_icons(sys.argv[1])

