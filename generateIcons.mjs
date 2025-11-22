#!/usr/bin/env node
/**
 * Generate Chrome extension icons from a base 128x128 image.
 * Usage: node generateIcons.mjs path/to/icon128.png
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateIcons(baseImagePath) {
  if (!existsSync(baseImagePath)) {
    console.error(`Error: ${baseImagePath} not found`);
    process.exit(1);
  }

  // Create icons directory if it doesn't exist
  const iconsDir = join(__dirname, 'public', 'icons');
  if (!existsSync(iconsDir)) {
    mkdirSync(iconsDir, { recursive: true });
  }

  // Generate icons in different sizes
  const sizes = [16, 48, 128];
  
  console.log(`Generating icons from ${baseImagePath}...`);
  
  // Check if input is already a 128px icon
  const is128pxInput = baseImagePath.includes('icon128.png');
  const sizesToGenerate = is128pxInput ? [16, 48] : sizes;
  
  for (const size of sizesToGenerate) {
    const outputPath = join(iconsDir, `icon${size}.png`);
    
    try {
      await sharp(baseImagePath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${outputPath} (${size}x${size})`);
    } catch (error) {
      console.error(`Error generating ${outputPath}:`, error.message);
    }
  }
  
  console.log('\nDone! Icons generated successfully.');
}

// Get command line argument
const baseImagePath = process.argv[2];

if (!baseImagePath) {
  console.log('Usage: node generateIcons.mjs path/to/icon128.png');
  console.log('\nExample: node generateIcons.mjs public/icons/icon128.png');
  process.exit(1);
}

generateIcons(baseImagePath).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

