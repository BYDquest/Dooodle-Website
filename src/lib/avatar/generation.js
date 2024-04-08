const fs = require('fs');
const path = require('path');
const util = require('util');
const writeFilePromise = util.promisify(fs.writeFile);
const { optimize } = require('svgo');


const faceShape = require("./face_shape.js");
const eyeShape = require("./eye_shape.js");
const hairLines = require("./hair_lines.js");
const mouthShape = require("./mouth_shape.js");

async function optimizeSvg(svgString) {
  // Adjusted to be an async function if needed
  const options = {
    multipass: true,
    // Additional options specified here
  };

  try {
    // Assuming optimize might be asynchronous or you're preparing for async operations
    const result = await Promise.resolve(optimize(svgString, options));
    if (result.error) {
      throw new Error(`Error optimizing the SVG: ${result.error}`);
    }
    return result.data; // Return the optimized SVG string
  } catch (error) {
    throw error; // Allows error to be caught in the calling context
  }
}



function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}


function randomFromInterval(min, max) {
  // min and max included
  var result = Math.random().toFixed(3) * (max - min) + min;
  return parseFloat(result.toFixed(2));
}


function convertArrayToFixedFloat(arr) {
  return arr.map(([x, y]) => [parseFloat(x.toFixed(2)), parseFloat(y.toFixed(2))]);
}


function convertHairsArrayToFixedFloat(arr) {
  // Map each sub-array in the array
  return arr.map(subArr =>
    // For each sub-array, map each coordinate pair
    subArr.map(([x, y]) =>
      // Convert each x and y in the pair to fixed float
      [parseFloat(x.toFixed(2)), parseFloat(y.toFixed(2))]
    )
  );
}

async function generateFace(fileName) {
  const faceScale = 1.8; // face scale
  let computedFacePoints = []; // the polygon points for face countour
  let eyeRightUpper = []; // the points for right eye upper lid
  let eyeRightLower = [];
  let eyeRightCountour = []; // for the white part of the eye
  let eyeLeftUpper = [];
  let eyeLeftLower = [];
  let eyeLeftCountour = [];
  let faceHeight = 0;  // the height of the face
  let faceWidth = 0; // the width of the face
  const center = [0, 0];  // the center of the face
  let distanceBetweenEyes = 0; // the distance between the eyes
  let leftEyeOffsetX = 0;  // the offset of the left eye X 
  let leftEyeOffsetY = 0; // the offset of the left eye Y
  let rightEyeOffsetX = 0; // the offset of the right eye X 
  let rightEyeOffsetY = 0; // the offset of the right eye Y
  let eyeHeightOffset = 0; // the offset of the eye height
  const leftEyeCenter = [0, 0]; // the center of the left eye
  const rightEyeCenter = [0, 0]; // the center of the right eye
  let rightPupilShiftX = 0; // the shift of the right pupil X 
  let rightPupilShiftY = 0; // the shift of the right pupil Y
  let leftPupilShiftX = 0; // the shift of the left pupil X
  let leftPupilShiftY = 0; // the shift of the left pupil Y
  let rightNoseCenterX = 0; // the center of the right nose X 
  let rightNoseCenterY = 0; // the center of the right nose Y
  let leftNoseCenterX = 0; // the center of the left nose X
  let leftNoseCenterY = 0; // the center of the left nose Y
  let hairs = [];
  let mouthPoints = [];

  let hairColor = "black";
  let dyeColorOffset = "50%";

  const faceColors = [
    { name: "Ivory", rgb: "rgb(255, 255, 240)" },
    { name: "Beige", rgb: "rgb(245, 245, 220)" },
    { name: "Wheat", rgb: "rgb(245, 222, 179)" },
    { name: "Tan", rgb: "rgb(210, 180, 140)" },
    { name: "Almond", rgb: "rgb(255, 235, 205)" },
    { name: "Peach", rgb: "rgb(255, 218, 185)" },
    { name: "Apricot", rgb: "rgb(251, 206, 177)" },
    { name: "Golden", rgb: "rgb(255, 215, 0)" },
    { name: "Olive", rgb: "rgb(128, 128, 0)" },
    { name: "Sienna", rgb: "rgb(160, 82, 45)" },
    { name: "Chestnut", rgb: "rgb(205, 92, 92)" },
    { name: "Chocolate", rgb: "rgb(210, 105, 30)" },
    { name: "Bronze", rgb: "rgb(205, 127, 50)" },
    { name: "Mahogany", rgb: "rgb(192, 64, 0)" },
    { name: "Coral", rgb: "rgb(255, 127, 80)" },
    { name: "Terracotta", rgb: "rgb(226, 114, 91)" },
    { name: "Crimson", rgb: "rgb(220, 20, 60)" },
    { name: "Magenta", rgb: "rgb(255, 0, 255)" },
    { name: "Lilac", rgb: "rgb(200, 162, 200)" },
    { name: "Plum", rgb: "rgb(221, 160, 221)" }
  ];

  const backgroundColors = [
    { name: "Ivory", rgb: "rgb(255, 255, 240)" },
    { name: "Beige", rgb: "rgb(245, 245, 220)" },
    { name: "Cream", rgb: "rgb(255, 253, 208)" },
    { name: "Linen", rgb: "rgb(250, 240, 230)" },
    { name: "Vanilla", rgb: "rgb(243, 229, 171)" },
    { name: "Soft Yellow", rgb: "rgb(255, 255, 224)" },
    { name: "Pale Green", rgb: "rgb(152, 251, 152)" },
    { name: "Mint", rgb: "rgb(245, 255, 250)" },
    { name: "Lavender", rgb: "rgb(230, 230, 250)" },
    { name: "Periwinkle", rgb: "rgb(204, 204, 255)" },
    { name: "Powder Blue", rgb: "rgb(176, 224, 230)" },
    { name: "Light Coral", rgb: "rgb(240, 128, 128)" },
    { name: "Soft Pink", rgb: "rgb(255, 228, 225)" },
    { name: "Mauve", rgb: "rgb(224, 176, 255)" },
    { name: "Taupe", rgb: "rgb(188, 143, 143)" },
    { name: "Khaki", rgb: "rgb(195, 176, 145)" },
    { name: "Sepia", rgb: "rgb(112, 66, 20)" },
    { name: "Olive Green", rgb: "rgb(85, 107, 47)" },
    { name: "Steel Blue", rgb: "rgb(70, 130, 180)" },
    { name: "Charcoal", rgb: "rgb(54, 69, 79)" }
  ];

  const hairColors = [
    { name: "Black", rgb: "rgb(0, 0, 0)" },
    { name: "Dark Brown", rgb: "rgb(44, 34, 43)" },
    { name: "Medium Brown", rgb: "rgb(80, 68, 68)" },
    { name: "Light Brown", rgb: "rgb(167, 133, 106)" },
    { name: "Honey Blond", rgb: "rgb(220, 208, 186)" },
    { name: "Golden Blond", rgb: "rgb(255, 236, 139)" },
    { name: "Platinum Blond", rgb: "rgb(233, 236, 239)" },
    { name: "Ash Blond", rgb: "rgb(216, 216, 216)" },
    { name: "Ginger", rgb: "rgb(178, 93, 37)" },
    { name: "Auburn", rgb: "rgb(145, 85, 61)" },
    { name: "Burgundy", rgb: "rgb(128, 0, 32)" },
    { name: "Chestnut", rgb: "rgb(149, 69, 53)" },
    { name: "Copper", rgb: "rgb(184, 115, 51)" },
    { name: "Mahogany", rgb: "rgb(192, 64, 0)" },
    { name: "Jet Black", rgb: "rgb(10, 10, 10)" },
    { name: "Silver", rgb: "rgb(192, 192, 192)" },
    { name: "Slate Gray", rgb: "rgb(112, 128, 144)" },
    { name: "Steel Blue", rgb: "rgb(70, 130, 180)" },
    { name: "Periwinkle", rgb: "rgb(204, 204, 255)" },
    { name: "Lavender", rgb: "rgb(230, 230, 250)" },
    { name: "Plum", rgb: "rgb(221, 160, 221)" },
    { name: "Indigo", rgb: "rgb(75, 0, 130)" },
    { name: "Forest Green", rgb: "rgb(34, 139, 34)" },
    { name: "Olive Green", rgb: "rgb(85, 107, 47)" },
    { name: "Lime Green", rgb: "rgb(50, 205, 50)" },
    { name: "Coral", rgb: "rgb(255, 127, 80)" },
    { name: "Peach", rgb: "rgb(255, 218, 185)" },
    { name: "Crimson", rgb: "rgb(220, 20, 60)" },
    { name: "Magenta", rgb: "rgb(255, 0, 255)" },
    { name: "Turquoise", rgb: "rgb(64, 224, 208)" }
  ];


  const faceResults = faceShape.generateFaceCountourPoints();
  computedFacePoints.push(...faceResults.face);

  faceHeight = faceResults.height;
  faceWidth = faceResults.width;
  center[0] = faceResults.center[0];
  center[1] = faceResults.center[1];

  const eyes = eyeShape.generateBothEyes(faceWidth / 2);
  const left = eyes.left;
  const right = eyes.right;
  eyeRightUpper.push(...right.upper);
  eyeRightLower.push(...right.lower);

  eyeRightCountour.push(
    ...right.upper.slice(10, 90),
    ...right.lower.slice(10, 90).reverse()
  );

  eyeLeftUpper.push(...left.upper);
  eyeLeftLower.push(...left.lower);

  eyeLeftCountour.push(
    ...left.upper.slice(10, 90),
    ...left.lower.slice(10, 90).reverse()
  );

  distanceBetweenEyes = randomFromInterval(faceWidth / 4.5, faceWidth / 4);
  eyeHeightOffset = randomFromInterval(faceHeight / 8, faceHeight / 6);
  leftEyeOffsetX = randomFromInterval(-faceWidth / 20, faceWidth / 10);
  leftEyeOffsetY = randomFromInterval(-faceHeight / 50, faceHeight / 50);
  rightEyeOffsetX = randomFromInterval(-faceWidth / 20, faceWidth / 10);
  rightEyeOffsetY = randomFromInterval(-faceHeight / 50, faceHeight / 50);
  leftEyeCenter[0] = left.center[0];
  leftEyeCenter[1] = left.center[1];
  rightEyeCenter[0] = right.center[0];
  rightEyeCenter[1] = right.center[1];
  leftPupilShiftX = randomFromInterval(-faceWidth / 20, faceWidth / 20);

  // Generate pupil shifts
  const leftInd0 = Math.floor(randomFromInterval(10, left.upper.length - 10));
  const rightInd0 = Math.floor(randomFromInterval(10, right.upper.length - 10));
  const leftInd1 = Math.floor(randomFromInterval(10, left.upper.length - 10));
  const rightInd1 = Math.floor(randomFromInterval(10, right.upper.length - 10));
  const leftLerp = randomFromInterval(0.2, 0.8);
  const rightLerp = randomFromInterval(0.2, 0.8);

  leftPupilShiftY =
    left.upper[leftInd0][1] * leftLerp + left.lower[leftInd1][1] * (1 - leftLerp);
  rightPupilShiftY =
    right.upper[rightInd0][1] * rightLerp +
    right.lower[rightInd1][1] * (1 - rightLerp);
  leftPupilShiftX =
    left.upper[leftInd0][0] * leftLerp + left.lower[leftInd1][0] * (1 - leftLerp);
  rightPupilShiftX =
    right.upper[rightInd0][0] * rightLerp +
    right.lower[rightInd1][0] * (1 - rightLerp);

  const numHairLines = [];
  const numHairMethods = 4;
  for (let i = 0; i < numHairMethods; i++) {
    numHairLines.push(Math.floor(randomFromInterval(0, 50)));
  }

  if (Math.random() > 0.3) {
    hairs.push(...hairLines.generateHairLines0(computedFacePoints, numHairLines[0] * 1 + 10));

  }
  if (Math.random() > 0.3) {
    hairs.push(...hairLines.generateHairLines1(computedFacePoints, numHairLines[1] / 1.5 + 10));

  }
  if (Math.random() > 0.5) {
    hairs.push(...hairLines.generateHairLines2(computedFacePoints, numHairLines[2] * 3 + 10));

  }
  if (Math.random() > 0.5) {
    hairs.push(...hairLines.generateHairLines3(computedFacePoints, numHairLines[3] * 3 + 10));

  }

  rightNoseCenterX = randomFromInterval(faceWidth / 18, faceWidth / 12);
  rightNoseCenterY = randomFromInterval(0, faceHeight / 5);
  leftNoseCenterX = randomFromInterval(-faceWidth / 18, -faceWidth / 12);
  leftNoseCenterY = rightNoseCenterY + randomFromInterval(-faceHeight / 30, faceHeight / 20);


  if (Math.random() > 0.1) {
    // use natural hair color
    const hairColorsIndex = Math.floor(Math.random() * hairColors.length)
    hairColor = hairColors[hairColorsIndex].rgb;
  } else {
    hairColor = "url(#rainbowGradient)";
    dyeColorOffset = randomFromInterval(0, 100) + "%";
  }

  const choice = Math.floor(Math.random().toFixed(3) * 3);
  if (choice === 0) {
    mouthPoints.push(...mouthShape.generateMouthShape0(computedFacePoints, faceHeight, faceWidth));
  } else if (choice === 1) {
    mouthPoints.push(...mouthShape.generateMouthShape1(computedFacePoints, faceHeight, faceWidth));
  } else {
    mouthPoints.push(...mouthShape.generateMouthShape2(computedFacePoints, faceHeight, faceWidth));
  }


  computedFacePoints = convertArrayToFixedFloat(computedFacePoints) // 
  eyeRightUpper = convertArrayToFixedFloat(eyeRightUpper) // 
  eyeRightLower = convertArrayToFixedFloat(eyeRightLower) // 
  eyeRightCountour = convertArrayToFixedFloat(eyeRightCountour) // 
  eyeLeftUpper = convertArrayToFixedFloat(eyeLeftUpper) // 
  eyeLeftLower = convertArrayToFixedFloat(eyeLeftLower) // 
  eyeLeftCountour = convertArrayToFixedFloat(eyeLeftCountour) // 
  mouthPoints = convertArrayToFixedFloat(mouthPoints) // 
  hairs = convertHairsArrayToFixedFloat(hairs) //

  /////////////////////////////////////

  const leftEyePupil = [];
  const rightEyePupil = [];

  for (let i = 0; i < 10; i++) {
    const circleMarkup = `<circle r="${Math.random().toFixed(3) * 2 + 3.0}" cx="${leftPupilShiftX + Math.random().toFixed(3) * 5 - 2.5}" cy="${leftPupilShiftY + Math.random().toFixed(3) * 5 - 2.5}" stroke="black" fill="none" stroke-width="1.0" filter="url(#fuzzy)" clip-path="url(#leftEyeClipPath)" />`;
    leftEyePupil.push(circleMarkup);
  }


  for (let i = 0; i < 10; i++) {
    const circleMarkup = `<circle r="${Math.random().toFixed(3) * 2 + 3.0}" cx="${rightPupilShiftX + Math.random().toFixed(3) * 5 - 2.5}" cy="${rightPupilShiftY + Math.random().toFixed(3) * 5 - 2.5}" stroke="black" fill="none" stroke-width="1.0" filter="url(#fuzzy)" clip-path="url(#rightEyeClipPath)" />`;
    rightEyePupil.push(circleMarkup);
  }

  const leftEyePupilMarkup = leftEyePupil.join('');
  const rightEyePupilMarkup = rightEyePupil.join('');


  function generateNoseMarkup() {
    if (Math.random() > 0.5) {
      let rightNose = [];
      let leftNose = [];
      for (let i = 0; i < 10; i++) {
        rightNose.push(`<circle r="${Math.random().toFixed(3) * 2 + 1.0}" cx="${rightNoseCenterX + Math.random().toFixed(3) * 4 - 2}" cy="${rightNoseCenterY + Math.random().toFixed(3) * 4 - 2}" stroke="black" fill="none" stroke-width="1.0" filter="url(#fuzzy)" />`);
        leftNose.push(`<circle r="${Math.random().toFixed(3) * 2 + 1.0}" cx="${leftNoseCenterX + Math.random().toFixed(3) * 4 - 2}" cy="${leftNoseCenterY + Math.random().toFixed(3) * 4 - 2}" stroke="black" fill="none" stroke-width="1.0" filter="url(#fuzzy)" />`);
      }

      return `
        <g id="pointNose">
          <g id="rightNose">${rightNose.join('')}</g>
          <g id="leftNose">${leftNose.join('')}</g>
        </g>
      `;
    } else {
      return `
        <g id="lineNose">
        <path d="M ${leftNoseCenterX},${leftNoseCenterY} Q ${rightNoseCenterX}, ${rightNoseCenterY * 1.5} ${(leftNoseCenterX + rightNoseCenterX) / 2}, ${-eyeHeightOffset * 0.2}" fill="none" stroke="black" stroke-width="3" stroke-linejoin="round" filter="url(#fuzzy)"></path>
        </g>
      `;
    }
  }

  const noseMarkup = generateNoseMarkup();
  const backgroundColorsIndex = Math.floor(Math.random() * backgroundColors.length)
  const faceColorsIndex = Math.floor(Math.random() * faceColors.length)

  /////////////////////////////////////

  let svgString = `<svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg" width="500" height="500" id="face-svg">
    <defs>
      <clipPath id="leftEyeClipPath">
        <polyline points="${eyeLeftCountour.join(' ')}" />
      </clipPath>
      <clipPath id="rightEyeClipPath">
        <polyline points="${eyeRightCountour.join(' ')}" />
      </clipPath>
      <filter id="fuzzy">
        <feTurbulence id="turbulence" baseFrequency="0.05" numOctaves="3" type="noise" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
      </filter>
      <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color: ${hairColors[Math.floor(Math.random().toFixed(3) * 10)]}; stop-opacity: 1" />
        <stop offset="${dyeColorOffset}" style="stop-color: ${hairColors[Math.floor(Math.random().toFixed(3) * hairColors.length)]}; stop-opacity: 1" />
        <stop offset="100%" style="stop-color: ${hairColors[Math.floor(Math.random().toFixed(3) * hairColors.length)]}; stop-opacity: 1" />
      </linearGradient>
    </defs>
    <rect x="-100" y="-100" width="100%" height="100%" fill="${backgroundColors[backgroundColorsIndex].rgb}" />
    <polyline id="faceContour" points="${computedFacePoints.join(' ')}" fill="${faceColors[faceColorsIndex].rgb}" stroke="black" stroke-width="${3.0 / faceScale}" stroke-linejoin="round" filter="url(#fuzzy)" />
    <g transform="translate(${center[0] + distanceBetweenEyes + rightEyeOffsetX} ${-(-center[1] + eyeHeightOffset + rightEyeOffsetY)})">
      <polyline id="rightCountour" points="${eyeRightCountour.join(' ')}" fill="white" stroke="white" stroke-width="${0.0 / faceScale}" stroke-linejoin="round" filter="url(#fuzzy)" />
    </g>
    <g transform="translate(${-(center[0] + distanceBetweenEyes + leftEyeOffsetX)} ${-(-center[1] + eyeHeightOffset + leftEyeOffsetY)})">
      <polyline id="leftCountour" points="${eyeLeftCountour.join(' ')}" fill="white" stroke="white" stroke-width="${0.0 / faceScale}" stroke-linejoin="round" filter="url(#fuzzy)" />
    </g>
    <g transform="translate(${center[0] + distanceBetweenEyes + rightEyeOffsetX} ${-(-center[1] + eyeHeightOffset + rightEyeOffsetY)})">
      <polyline id="rightUpper" points="${eyeRightUpper.join(' ')}" fill="none" stroke="black" stroke-width="${3.0 / faceScale}" stroke-linejoin="round" filter="url(#fuzzy)" />
      <polyline id="rightLower" points="${eyeRightLower.join(' ')}" fill="none" stroke="black" stroke-width="${4.0 / faceScale}" stroke-linejoin="round" filter="url(#fuzzy)" />
      ${rightEyePupilMarkup}
      </g>
    <g transform="translate(${-(center[0] + distanceBetweenEyes + leftEyeOffsetX)} ${-(-center[1] + eyeHeightOffset + leftEyeOffsetY)})">
      <polyline id="leftUpper" points="${eyeLeftUpper.join(' ')}" fill="none" stroke="black" stroke-width="${4.0 / faceScale}" stroke-linejoin="round" filter="url(#fuzzy)" />
      <polyline id="leftLower" points="${eyeLeftLower.join(' ')}" fill="none" stroke="black" stroke-width="${4.0 / faceScale}" stroke-linejoin="round" filter="url(#fuzzy)" />
      ${leftEyePupilMarkup}
    </g>
    <g id="hairs">
      ${hairs.map(hair => `<polyline points="${hair.join(' ')}" fill="none" stroke="${hairColor}" stroke-width="2" stroke-linejoin="round" filter="url(#fuzzy)" />`).join('')}
    </g>
    ${noseMarkup}
    <g id="mouth">
      <polyline points="${mouthPoints.join(' ')}" fill="rgb(215,127,140)" stroke="black" stroke-width="3" stroke-linejoin="round" filter="url(#fuzzy)" />
    </g>
  </svg>`;


  metadata = `{
    "name": "Ugly Avatar",
    "description": "A Naïve and Ugly Avatar Collection",
    "image": "https://example.com/path/to/${fileName}.svg",
    "external_url": "https://www.byd.quest",
    "attributes": [
      {
        "trait_type": "Avatar Type",
        "value": "${svgString.length}"
      },
      {
        "trait_type": "Face",
        "value": "${faceColors[faceColorsIndex].name}"
      },
      {
        "trait_type": "Hair",
        "value": "Vibrant"
      },
      {
        "trait_type": "Background",
        "value": "${backgroundColors[backgroundColorsIndex].name}"
      }]
}`


 metadata = JSON.stringify(JSON.parse(metadata));

  const svgFileName = `${fileName}.svg`;
  const metadataFileName = `${fileName}.json`;
  const filePath = path.join('./avatar', svgFileName);
  const metadataFilePath = path.join('./metadata', metadataFileName);

  try {
    svgString = await optimizeSvg(svgString); 
    await writeFilePromise(filePath, svgString);
    await writeFilePromise(metadataFilePath, metadata);

    console.log(`${fileName} has been created`);
  } catch (err) {
    console.error('Error writing file:', err);
  }

}


async function generateFaces(total, batchSize) {
  let batchStart = 0;
  while (batchStart < total) {
    const promises = [];
    for (let i = batchStart; i < Math.min(batchStart + batchSize, total); i++) {
      promises.push(generateFace(i));
    }
    await Promise.all(promises); // Wait for all promises in the batch to resolve
    batchStart += batchSize;
  }
}


ensureDirectoryExists('avatar')
ensureDirectoryExists('metadata')

// Run the function with limited concurrency
const totalFaces = 10000;
const batchSize = 200; // Adjust based on your system's capabilities

generateFaces(totalFaces, batchSize).then(() => {
  console.log('All files have been generated and saved.');
});



