// This is a simple script to generate icons of different sizes
// To use this script, you would run:
// 1. Install Sharp: npm install sharp
// 2. Run: node generate-icons.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Source SVG file
const sourceFile = path.join(__dirname, 'logo.svg');

// Icon sizes needed for PWA
const sizes = [
  16, 32, 48, 72, 96, 128, 144, 152, 192, 384, 512
];

// Create Apple Touch Icon (180x180)
const appleIconSize = 180;

async function generateIcons() {
  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(sourceFile);
    
    // Generate standard icons
    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, `icon-${size}x${size}.png`));
      
      console.log(`Generated icon-${size}x${size}.png`);
    }
    
    // Generate Apple Touch Icon
    await sharp(svgBuffer)
      .resize(appleIconSize, appleIconSize)
      .png()
      .toFile(path.join(__dirname, 'apple-touch-icon.png'));
    
    console.log('Generated apple-touch-icon.png');
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 