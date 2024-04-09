package mouth

import (
    "math"
    "math/rand"
    "time"
)

type Point struct {
    X float64
    Y float64
}

func init() {
    rand.Seed(time.Now().UnixNano())
}

func randomFromInterval(min, max float64) float64 {
    return min + rand.Float64()*(max-min)
}

func cubicBezier(P0, P1, P2, P3 Point, t float64) Point {
    x := math.Pow(1-t, 3)*P0.X + 3*math.Pow(1-t, 2)*t*P1.X + 3*(1-t)*math.Pow(t, 2)*P2.X + math.Pow(t, 3)*P3.X
    y := math.Pow(1-t, 3)*P0.Y + 3*math.Pow(1-t, 2)*t*P1.Y + 3*(1-t)*math.Pow(t, 2)*P2.Y + math.Pow(t, 3)*P3.Y
    return Point{x, y}
}

func getEggShapePoints(a, b, k float64, segmentPoints int) []Point {
    result := make([]Point, 0, segmentPoints*4)
    for i := 0; i < segmentPoints; i++ {
        degree := (math.Pi/2/float64(segmentPoints))*float64(i) + randomFromInterval(-math.Pi/1.1/float64(segmentPoints), math.Pi/1.1/float64(segmentPoints))
        y := math.Sin(degree) * b
        x := math.Sqrt(((1 - (y*y)/(b*b)) / (1 + k*y)) * a * a)
        result = append(result, Point{x, y}, Point{-x, y}, Point{-x, -y}, Point{x, -y})
    }
    return result
}

func generateMouthShape0(faceContour []Point, faceHeight, faceWidth float64) []Point {
    mouthRightY := randomFromInterval(faceHeight/7, faceHeight/3.5)
    mouthLeftY := randomFromInterval(faceHeight/7, faceHeight/3.5)
    mouthRightX := randomFromInterval(faceWidth/10, faceWidth/2)
    mouthLeftX := -mouthRightX + randomFromInterval(-faceWidth/20, faceWidth/20)
    mouthRight := Point{mouthRightX, mouthRightY}
    mouthLeft := Point{mouthLeftX, mouthLeftY}

    controlPoint0 := Point{randomFromInterval(0, mouthRightX), randomFromInterval(mouthLeftY+5, faceHeight/1.5)}
    controlPoint1 := Point{randomFromInterval(mouthLeftX, 0), randomFromInterval(mouthLeftY+5, faceHeight/1.5)}

    mouthPoints := make([]Point, 0)
    for i := 0.0; i < 1; i += 0.01 {
        mouthPoints = append(mouthPoints, cubicBezier(mouthLeft, controlPoint1, controlPoint0, mouthRight, i))
    }

    // Additional logic omitted for brevity - adapt from your JavaScript as needed
    return mouthPoints
}

func generateMouthShape1(faceHeight, faceWidth float64) []Point {
    mouthRightY := randomFromInterval(faceHeight/7, faceHeight/4)
    mouthLeftY := randomFromInterval(faceHeight/7, faceHeight/4)
    mouthRightX := randomFromInterval(faceWidth/10, faceWidth/2)
    mouthLeftX := -mouthRightX + randomFromInterval(-faceWidth/20, faceWidth/20)
    mouthRight := Point{mouthRightX, mouthRightY}
    mouthLeft := Point{mouthLeftX, mouthLeftY}

    controlPoint0 := Point{randomFromInterval(0, mouthRightX), randomFromInterval(mouthLeftY+5, faceHeight/1.5)}
    controlPoint1 := Point{randomFromInterval(mouthLeftX, 0), randomFromInterval(mouthLeftY+5, faceHeight/1.5)}

    mouthPoints := make([]Point, 0)
    for i := 0.0; i < 1; i += 0.01 {
        mouthPoints = append(mouthPoints, cubicBezier(mouthLeft, controlPoint1, controlPoint0, mouthRight, i))
    }

    // Center, rotate, scale, and adjust the mouth shape
    center := Point{(mouthRight.X + mouthLeft.X) / 2, (mouthPoints[25].Y + mouthPoints[75].Y) / 2}
    for i := range mouthPoints {
        // Translate to center
        mouthPoints[i].X -= center.X
        mouthPoints[i].Y -= center.Y
        // Rotate 180 degrees (optional, based on your logic)
        mouthPoints[i].Y = -mouthPoints[i].Y
        // Scale smaller
        mouthPoints[i].X *= 0.6
        mouthPoints[i].Y *= 0.6
        // Translate back
        mouthPoints[i].X += center.X
        mouthPoints[i].Y += center.Y * 0.8
    }

    return mouthPoints
}


func generateMouthShape2(faceContour []Point, faceHeight, faceWidth float64) []Point {
    center := Point{randomFromInterval(-faceWidth/8, faceWidth/8), randomFromInterval(faceHeight/4, faceHeight/2.5)}

    mouthPoints := getEggShapePoints(randomFromInterval(faceWidth/4, faceWidth/10), randomFromInterval(faceHeight/10, faceHeight/20), 0.001, 50)
    randomRotationDegree := randomFromInterval(-math.Pi/9.5, math.Pi/9.5)

    for i := range mouthPoints {
        x, y := mouthPoints[i].X, mouthPoints[i].Y
        mouthPoints[i].X = x*math.Cos(randomRotationDegree) - y*math.Sin(randomRotationDegree) + center.X
        mouthPoints[i].Y = x*math.Sin(randomRotationDegree) + y*math.Cos(randomRotationDegree) + center.Y
    }

    return mouthPoints
}

func main() {
    // Example usage
    faceContour := []Point{} // Define your face contour points
    faceHeight, faceWidth := 200.0, 100.0 // Example face dimensions

    mouthShape := generateMouthShape0(faceContour, faceHeight, faceWidth)
    for _, point := range mouthShape {
        println(point.X, point.Y)
    }

    // Call other functions similarly
}
