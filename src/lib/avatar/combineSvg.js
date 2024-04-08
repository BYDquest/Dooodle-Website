const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensures the output directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to combine SVG images into a single PNG image
function combineSVGImages(imageDir, outputDir, gridWidth, outputImageWidth, outputImageHeight) {
  ensureDirectoryExists(outputDir);

  // Generate the list of image filenames
  let imageFiles = fs.readdirSync(imageDir).filter(file => file.endsWith('.svg'));
  const imagesPerCombined = gridWidth * gridWidth; // Calculate based on grid size
  const combinedImageWidth = gridWidth * outputImageWidth;
  const combinedImageHeight = gridWidth * outputImageHeight;

  // If there are fewer images than the grid can hold, calculate how many are needed to fill the grid
  const fillerCount = imagesPerCombined - imageFiles.length % imagesPerCombined;
  if (imageFiles.length < imagesPerCombined) {
    imageFiles = [...imageFiles, ...Array(fillerCount).fill(null)]; // Fill with nulls to indicate blanks
  }

  // Process in batches of gridWidth*gridWidth
  for (let n = 0; n < Math.ceil(imageFiles.length / imagesPerCombined); n++) {
    const startIdx = n * imagesPerCombined;
    const endIdx = startIdx + imagesPerCombined;
    const batchFiles = imageFiles.slice(startIdx, endIdx);

    // Create a canvas
    const canvas = sharp({
      create: {
        width: combinedImageWidth,
        height: combinedImageHeight,
        channels: 4,
        background: 'white'
      }
    });

    const imagePromises = batchFiles.map((file, index) => {
      const row = Math.floor(index / gridWidth);
      const col = index % gridWidth;
      const x = col * outputImageWidth;
      const y = row * outputImageHeight;

      if (file) {
        // If there's an image, process and place it
        return sharp(path.join(imageDir, file))
          .resize(outputImageWidth, outputImageHeight)
          .toBuffer()
          .then(data => ({
            input: data,
            top: y,
            left: x
          }));
      } else {
        // For null (blank), create a transparent filler
        return Promise.resolve({
          input: {
            create: {
              width: outputImageWidth,
              height: outputImageHeight,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
          },
          top: y,
          left: x
        });
      }
    });

    // Composite images onto the canvas
    Promise.all(imagePromises).then(images => {
      canvas.composite(images)
        .toFile(path.join(outputDir, `combined_${n+1}.png`), (err, info) => {
          if (err) throw err;
          console.log(`Combined image ${n+1} created in ${outputDir} directory.`);
        });
    });
  }
}

// Example usage
// Note: Adjust the parameters as needed
combineSVGImages('avatar', 'combined-image', 10, 100, 100);
