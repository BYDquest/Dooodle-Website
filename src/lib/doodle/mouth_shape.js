


function randomFromInterval(min, max) {
  // min and max included
  var result = Math.random() * (max - min) + min;
  return parseFloat(result.toFixed(2));
}

function cubicBezier(P0, P1, P2, P3, t) {
    var x = (1 - t) ** 3 * P0[0] + 3 * (1 - t) ** 2 * t * P1[0] + 3 * (1 - t) * t ** 2 * P2[0] + t ** 3 * P3[0];
    var y = (1 - t) ** 3 * P0[1] + 3 * (1 - t) ** 2 * t * P1[1] + 3 * (1 - t) * t ** 2 * P2[1] + t ** 3 * P3[1];
    return [x, y];
}
function getEggShapePoints(a, b, k, segment_points) {
    // the function is x^2/a^2 * (1 + ky) + y^2/b^2 = 1
    var result = [];
    //   var pointString = "";
    for (var i = 0; i < segment_points; i++) {
      // x positive, y positive
      // first compute the degree
      var degree =
        (Math.PI / 2 / segment_points) * i +
        randomFromInterval(
          -Math.PI / 1.1 / segment_points,
          Math.PI / 1.1 / segment_points
        );
      var y = Math.sin(degree) * b;
      var x =
        Math.sqrt(((1 - (y * y) / (b * b)) / (1 + k * y)) * a * a) +
        randomFromInterval(-a / 200.0, a / 200.0);
      // pointString += x + "," + y + " ";
      result.push([x, y]);
    }
    for (var i = segment_points; i > 0; i--) {
      // x is negative, y is positive
      var degree =
        (Math.PI / 2 / segment_points) * i +
        randomFromInterval(
          -Math.PI / 1.1 / segment_points,
          Math.PI / 1.1 / segment_points
        );
      var y = Math.sin(degree) * b;
      var x =
        -Math.sqrt(((1 - (y * y) / (b * b)) / (1 + k * y)) * a * a) +
        randomFromInterval(-a / 200.0, a / 200.0);
      // pointString += x + "," + y + " ";
      result.push([x, y]);
    }
    for (var i = 0; i < segment_points; i++) {
      // x is negative, y is negative
      var degree =
        (Math.PI / 2 / segment_points) * i +
        randomFromInterval(
          -Math.PI / 1.1 / segment_points,
          Math.PI / 1.1 / segment_points
        );
      var y = -Math.sin(degree) * b;
      var x =
        -Math.sqrt(((1 - (y * y) / (b * b)) / (1 + k * y)) * a * a) +
        randomFromInterval(-a / 200.0, a / 200.0);
      // pointString += x + "," + y + " ";
      result.push([x, y]);
    }
    for (var i = segment_points; i > 0; i--) {
      // x is positive, y is negative
      var degree =
        (Math.PI / 2 / segment_points) * i +
        randomFromInterval(
          -Math.PI / 1.1 / segment_points,
          Math.PI / 1.1 / segment_points
        );
      var y = -Math.sin(degree) * b;
      var x =
        Math.sqrt(((1 - (y * y) / (b * b)) / (1 + k * y)) * a * a) +
        randomFromInterval(-a / 200.0, a / 200.0);
      // pointString += x + "," + y + " ";
      result.push([x, y]);
    }
    return result;
  }

 function generateMouthShape0(faceCountour, faceHeight, faceWidth) {
    // the first one is a a big smile U shape
    var faceCountourCopy = faceCountour.slice(0, faceCountour.length - 2);
    // choose one point on face at bottom side
    var mouthRightY = randomFromInterval(faceHeight / 7, faceHeight / 3.5)
    var mouthLeftY = randomFromInterval(faceHeight / 7, faceHeight / 3.5)
    var mouthRightX = randomFromInterval(faceWidth / 10, faceWidth / 2)
    var mouthLeftX = -mouthRightX + randomFromInterval(-faceWidth / 20, faceWidth / 20)
    var mouthRight = [mouthRightX, mouthRightY]
    var mouthLeft = [mouthLeftX, mouthLeftY]

    var controlPoint0 = [randomFromInterval(0, mouthRightX), randomFromInterval(mouthLeftY + 5, faceHeight / 1.5)]
    var controlPoint1 = [randomFromInterval(mouthLeftX, 0), randomFromInterval(mouthLeftY + 5, faceHeight / 1.5)]

    var mouthPoints = []
    for (var i = 0; i < 1; i += 0.01) {
        mouthPoints.push(cubicBezier(mouthLeft, controlPoint1, controlPoint0, mouthRight, i))
    }
    if (Math.random() > 0.5) {
        for (var i = 0; i < 1; i += 0.01) {
            mouthPoints.push(cubicBezier(mouthRight, controlPoint0, controlPoint1, mouthLeft, i))
        }
    }else{
        var y_offset_portion = randomFromInterval(0, 0.8);
        for (var i = 0; i < 100; i += 1) {
            mouthPoints.push([mouthPoints[99][0] * (1 - i / 100.0) + mouthPoints[0][0] * i / 100.0, (mouthPoints[99][1] * (1 - i / 100.0) + mouthPoints[0][1] * i / 100.0) * (1 - y_offset_portion) + mouthPoints[99 - i][1] * y_offset_portion])
        }
    }
    return mouthPoints;
}

 function generateMouthShape1(faceCountour, faceHeight, faceWidth) {
    // the first one is a a big smile U shape
    var faceCountourCopy = faceCountour.slice(0, faceCountour.length - 2);
    // choose one point on face at bottom side
    var mouthRightY = randomFromInterval(faceHeight / 7, faceHeight / 4)
    var mouthLeftY = randomFromInterval(faceHeight / 7, faceHeight / 4)
    var mouthRightX = randomFromInterval(faceWidth / 10, faceWidth / 2)
    var mouthLeftX = -mouthRightX + randomFromInterval(-faceWidth / 20, faceWidth / 20)
    var mouthRight = [mouthRightX, mouthRightY]
    var mouthLeft = [mouthLeftX, mouthLeftY]

    var controlPoint0 = [randomFromInterval(0, mouthRightX), randomFromInterval(mouthLeftY + 5, faceHeight / 1.5)]
    var controlPoint1 = [randomFromInterval(mouthLeftX, 0), randomFromInterval(mouthLeftY + 5, faceHeight / 1.5)]

    var mouthPoints = []
    for (var i = 0; i < 1; i += 0.01) {
        mouthPoints.push(cubicBezier(mouthLeft, controlPoint1, controlPoint0, mouthRight, i))
    }

    var center = [(mouthRight[0] + mouthLeft[0]) / 2, mouthPoints[25][1] / 2 + mouthPoints[75][1] / 2];
    if (Math.random() > 0.5) {
        for (var i = 0; i < 1; i += 0.01) {
            mouthPoints.push(cubicBezier(mouthRight, controlPoint0, controlPoint1, mouthLeft, i))
        }
    }else{
        var y_offset_portion = randomFromInterval(0, 0.8);
        for (var i = 0; i < 100; i += 1) {
            mouthPoints.push([mouthPoints[99][0] * (1 - i / 100.0) + mouthPoints[0][0] * i / 100.0, (mouthPoints[99][1] * (1 - i / 100.0) + mouthPoints[0][1] * i / 100.0) * (1 - y_offset_portion) + mouthPoints[99 - i][1] * y_offset_portion])
        }
    }
    // translate to center
    for (var i = 0; i < mouthPoints.length; i++) {
        mouthPoints[i][0] -= center[0]
        mouthPoints[i][1] -= center[1]
        // rotate 180 degree
        mouthPoints[i][1] = -mouthPoints[i][1]
        // scale smaller
        mouthPoints[i][0] = mouthPoints[i][0] * 0.6
        mouthPoints[i][1] = mouthPoints[i][1] * 0.6
        // translate back
        mouthPoints[i][0] += center[0]
        mouthPoints[i][1] += center[1] * 0.8
    }
    return mouthPoints;
}

 function generateMouthShape2(faceCountour, faceHeight, faceWidth) {
    // generate a random center
    var center = [randomFromInterval(-faceWidth / 8, faceWidth / 8), randomFromInterval(faceHeight / 4, faceHeight / 2.5)]

    var mouthPoints = getEggShapePoints(randomFromInterval(faceWidth / 4, faceWidth / 10), randomFromInterval(faceHeight / 10, faceHeight / 20), 0.001, 50);
    var randomRotationDegree = randomFromInterval(-Math.PI / 9.5, Math.PI / 9.5)
    for (var i = 0; i < mouthPoints.length; i++) {
        // rotate the point
        var x = mouthPoints[i][0]
        var y = mouthPoints[i][1]
        mouthPoints[i][0] = x * Math.cos(randomRotationDegree) - y * Math.sin(randomRotationDegree)
        mouthPoints[i][1] = x * Math.sin(randomRotationDegree) + y * Math.cos(randomRotationDegree)
        mouthPoints[i][0] += center[0]
        mouthPoints[i][1] += center[1]
    }
    return mouthPoints;
}


function generateMouthShape3( faceCountour,faceHeight, faceWidth ) {

  const style = 'neutral'
  // Constants to adjust the shape and size based on style
  const styleAdjustments = {
      smiling: {widthFactor: 1/6, heightFactor: 1/20, curveIntensity: 0.005},
      frowning: {widthFactor: 1/6, heightFactor: 1/20, curveIntensity: -0.005},
      neutral: {widthFactor: 1/10, heightFactor: 1/30, curveIntensity: 0.001}
  };

  // Calculate dimensions based on face size and style
  const {widthFactor, heightFactor, curveIntensity} = styleAdjustments[style];
  const mouthWidth = faceWidth * widthFactor;
  const mouthHeight = faceHeight * heightFactor;

  // Generate a base line for the mouth
  let mouthPoints = [];
  for (let i = -mouthWidth / 2; i <= mouthWidth / 2; i += mouthWidth / 50) {
      const x = i;
      const y = Math.sin(i * curveIntensity) * mouthHeight;
      mouthPoints.push([x, y]);
  }

  // Apply a random centering within a realistic range on the face
  const center = [
      randomFromInterval(-faceWidth / 8, faceWidth / 8),
      randomFromInterval(faceHeight / 4, faceHeight / 2.5)
  ];

  // Adjust points for the center
  mouthPoints = mouthPoints.map(point => [
      point[0] + center[0],
      point[1] + center[1]
  ]);

  return mouthPoints;
}




module.exports = {
  getEggShapePoints,
  generateMouthShape0,
  generateMouthShape1,
  generateMouthShape2,
};