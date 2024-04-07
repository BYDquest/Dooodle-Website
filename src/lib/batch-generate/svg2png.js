const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const svgDirectory = path.join(__dirname, 'avatar2');
const outputDirectory = path.join(__dirname, 'avatar-png2');

// Adjust based on your system's capabilities
const CONCURRENCY_LIMIT = 200;

async function convertFile(file) {
  const inputPath = path.join(svgDirectory, file);
  const outputPath = path.join(outputDirectory, `${path.parse(file).name}.png`);

  try {
    await sharp(inputPath).png().toFile(outputPath);
    console.log(`${file} has been converted to PNG.`);
  } catch (error) {
    console.error(`Error converting ${file}:`, error);
  }
}

async function processFiles(files) {
  const chunks = Array(Math.ceil(files.length / CONCURRENCY_LIMIT)).fill().map((_, index) => files.slice(index * CONCURRENCY_LIMIT, (index + 1) * CONCURRENCY_LIMIT));

  for (const chunk of chunks) {
    await Promise.allSettled(chunk.map(file => convertFile(file)));
  }
}

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
