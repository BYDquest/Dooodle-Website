const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const os = require('os');

// Paths
const svgDirectory = path.join(__dirname, 'avatar');
const outputDirectory = path.join(__dirname, 'avatar-png');

// Dynamic concurrency based on the number of CPU cores
const CONCURRENCY_LIMIT = Math.max(2, os.cpus().length);

// Convert SVG file to PNG format
async function convertFile(file, attempt = 1, maxAttempts = 3) {
  const inputPath = path.join(svgDirectory, file);
  const outputPath = path.join(outputDirectory, `${path.parse(file).name}.png`);

  try {
    await sharp(inputPath).png().toFile(outputPath);
    console.log(`${file} has been converted to PNG.`);
  } catch (error) {
    console.error(`Error converting ${file} on attempt ${attempt}:`, error);
    if (attempt < maxAttempts) {
      console.log(`Retrying ${file}...`);
      await convertFile(file, attempt + 1, maxAttempts);
    } else {
      console.error(`Failed to convert ${file} after ${maxAttempts} attempts.`);
    }
  }
}

// Process files with controlled concurrency
async function processFiles(files) {
  const chunks = Array(Math.ceil(files.length / CONCURRENCY_LIMIT)).fill().map((_, index) => files.slice(index * CONCURRENCY_LIMIT, (index + 1) * CONCURRENCY_LIMIT));

  for (const chunk of chunks) {
    await Promise.allSettled(chunk.map(file => convertFile(file)));
  }
}

// Main function to handle the conversion process
async function main() {
  try {
    await fs.mkdir(outputDirectory, { recursive: true });
    const files = await fs.readdir(svgDirectory);
    const svgFiles = files.filter(file => path.extname(file).toLowerCase() === '.svg');

    console.log(`Starting the conversion of ${svgFiles.length} files...`);
    await processFiles(svgFiles);
    console.log('All files have been converted.');
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
