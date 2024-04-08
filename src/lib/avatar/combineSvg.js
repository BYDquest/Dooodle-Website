const fs = require('fs').promises;
const path = require('path');
const { parse, stringify } = require('svgson');

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
  let combinedSvg = {
    name: "svg",
    type: "element",
    attributes: {
      width: gridWidth * outputImageWidth,
      height: gridWidth * outputImageHeight,
      xmlns: "http://www.w3.org/2000/svg",
    },
    children: [],
  };

  for (let index = 0; index < batchFiles.length; index++) {
    const file = batchFiles[index];
    if (file) {
      const filePath = path.join(imageDir, file);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const svgJson = await parse(fileContent);

      const x = (index % gridWidth) * outputImageWidth;
      const y = Math.floor(index / gridWidth) * outputImageHeight;

      // Wrap the content in a group with a transform
      const group = {
        name: "g",
        type: "element",
        attributes: {
          transform: `translate(${x}, ${y})`
        },
        children: [svgJson],
      };

      combinedSvg.children.push(group);
    }
  }

  const combinedSvgString = stringify(combinedSvg);
  await fs.writeFile(path.join(outputDir, `${batchNumber}.svg`), combinedSvgString);
  console.log(`Combined SVG ${batchNumber + 1} created in ${outputDir} directory.`);
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
combineSVGImages('avatar', 'combined-image', 10, 500, 500, 4).catch(console.error);
