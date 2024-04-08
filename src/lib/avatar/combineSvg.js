const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Ensures the output directory exists
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Function to process a batch of SVG images
async function processBatch(batchFiles, imageDir, outputDir, batchNumber, gridWidth, outputImageWidth, outputImageHeight) {
  const combinedImageWidth = gridWidth * outputImageWidth;
  const combinedImageHeight = gridWidth * outputImageHeight;

  const canvas = sharp({
    create: {
      width: combinedImageWidth,
      height: combinedImageHeight,
      channels: 4,
      background: 'white',
    },
  });

  const images = await Promise.all(batchFiles.map(async (file, index) => {
    const x = (index % gridWidth) * outputImageWidth;
    const y = Math.floor(index / gridWidth) * outputImageHeight;

    if (file) {
      const data = await sharp(path.join(imageDir, file))
        .resize(outputImageWidth, outputImageHeight)
        .toBuffer();
      return { input: data, top: y, left: x };
    } else {
      return {
        input: {
          create: {
            width: outputImageWidth,
            height: outputImageHeight,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          },
        },
        top: y,
        left: x,
      };
    }
  }));

  await canvas.composite(images).toFile(path.join(outputDir, `combined_${batchNumber + 1}.png`));
  console.log(`Combined image ${batchNumber + 1} created in ${outputDir} directory.`);
}

// Optimized function to combine SVG images with concurrency control
async function combineSVGImages(imageDir, outputDir, gridWidth, outputImageWidth, outputImageHeight, concurrencyLimit = 4) {
  await ensureDirectoryExists(outputDir);

  const imageFiles = await fs.readdir(imageDir).then(files => files.filter(file => file.endsWith('.svg')));
  const imagesPerCombined = gridWidth * gridWidth;

  let batches = [];
  for (let i = 0; i < imageFiles.length; i += imagesPerCombined) {
    batches.push(imageFiles.slice(i, i + imagesPerCombined));
  }

  for (let i = 0; i < batches.length; i += concurrencyLimit) {
    const concurrentBatches = batches.slice(i, i + concurrencyLimit);
    await Promise.all(concurrentBatches.map((batchFiles, index) => processBatch(batchFiles, imageDir, outputDir, i + index, gridWidth, outputImageWidth, outputImageHeight)));
  }
}

// Example usage
combineSVGImages('avatar', 'combined-image', 10, 100, 100, 4).catch(console.error);
