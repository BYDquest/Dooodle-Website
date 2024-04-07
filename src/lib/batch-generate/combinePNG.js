const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imageDir = 'avatar-png';
const gridWidth = 10; // Grid size: 10x10
const imagesPerCombined = 100; // Number of images per combined image
const combinedImageWidth = gridWidth; // Number of images horizontally
const combinedImageHeight = imagesPerCombined / gridWidth; // Number of images vertically

// Generate the list of image filenames
const imageFiles = Array.from({length: 1000}, (_, i) => `${i}.png`);

// Assuming all images are the same size, get the dimensions of the first image
sharp(path.join(imageDir, imageFiles[0])).metadata().then(metadata => {
  const width = metadata.width;
  const height = metadata.height;

  // Process in batches of 100
  for (let n = 0; n < imageFiles.length / imagesPerCombined; n++) {
    const startIdx = n * imagesPerCombined;
    const endIdx = startIdx + imagesPerCombined;
    const batchFiles = imageFiles.slice(startIdx, endIdx);

    // Create a canvas
    const canvas = sharp({
      create: {
        width: width * combinedImageWidth,
        height: height * combinedImageHeight,
        channels: 4,
        background: 'white'
      }
    });

    const imagePromises = batchFiles.map((file, index) => {
      const row = Math.floor(index / gridWidth);
      const col = index % gridWidth;
      const x = col * width;
      const y = row * height;

      return sharp(path.join(imageDir, file))
        .resize(width, height)
        .toBuffer()
        .then(data => ({
          input: data,
          top: y,
          left: x
        }));
    });

    // Composite images onto the canvas
    Promise.all(imagePromises).then(images => {
      canvas.composite(images)
        .toFile(`combined_image_${n+1}.png`, (err, info) => {
          if (err) throw err;
          console.log(`Combined image ${n+1} created.`);
        });
    });
  }
}).catch(err => console.error(err));
