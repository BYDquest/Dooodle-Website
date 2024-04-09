package face

import (
    "math"
    "math/rand"
    "time"
)

func init() {
    rand.Seed(time.Now().UnixNano())
}

func randomFromInterval(min, max float64) float64 {
    return min + rand.Float64()*(max-min)
}

func getEggShapePoints(a, b, k float64, segmentPoints int) [][2]float64 {
    var result [][2]float64
    for i := 0; i < segmentPoints; i++ {
        degree := (math.Pi / 2 / float64(segmentPoints)) * float64(i) + randomFromInterval(-math.Pi/1.1/float64(segmentPoints), math.Pi/1.1/float64(segmentPoints))
        y := math.Sin(degree) * b
        x := math.Sqrt(((1 - (y*y)/(b*b)) / (1 + k*y)) * a * a)
        x += randomFromInterval(-a/200.0, a/200.0)
        result = append(result, [2]float64{x, y})
    }

    for i := segmentPoints; i > 0; i-- {
        degree := (math.Pi / 2 / float64(segmentPoints)) * float64(i) + randomFromInterval(-math.Pi/1.1/float64(segmentPoints), math.Pi/1.1/float64(segmentPoints))
        y := math.Sin(degree) * b
        x := -math.Sqrt(((1 - (y*y)/(b*b)) / (1 + k*y)) * a * a)
        x += randomFromInterval(-a/200.0, a/200.0)
        result = append(result, [2]float64{x, y})
    }

    return result
}

func generateFaceContourPoints(numPoints int) ([][2]float64, float64, float64, [2]float64) {
    faceSizeX0 := randomFromInterval(50, 100)
    faceSizeY0 := randomFromInterval(70, 100)
    faceSizeY1 := randomFromInterval(50, 80)
    faceSizeX1 := randomFromInterval(70, 100)
    faceK0 := randomFromInterval(0.001, 0.005) * func() float64 {
        if rand.Float64() > 0.5 {
            return 1
        }
        return -1
    }()
    faceK1 := randomFromInterval(0.001, 0.005) * func() float64 {
        if rand.Float64() > 0.5 {
            return 1
        }
        return -1
    }()
    face0TranslateX := randomFromInterval(-5, 5)
    face0TranslateY := randomFromInterval(-15, 15)
    face1TranslateY := randomFromInterval(-5, 5)
    face1TranslateX := randomFromInterval(-5, 25)

    results0 := getEggShapePoints(faceSizeX0, faceSizeY0, faceK0, numPoints)
    results1 := getEggShapePoints(faceSizeX1, faceSizeY1, faceK1, numPoints)

    for i := range results0 {
        results0[i][0] += face0TranslateX
        results0[i][1] += face0TranslateY
        results1[i][0] += face1TranslateX
        results1[i][1] += face1TranslateY
    }

    var results [][2]float64
    center := [2]float64{0, 0}
    for i := range results0 {
        newX := (results0[i][0]*0.5 + results1[(i+len(results0)/4)%len(results0)][1]*0.5)
        newY := (results0[i][1]*0.5 - results1[(i+len(results0)/4)%len(results0)][0]*0.5)
        results = append(results, [2]float64{newX, newY})
        center[0] += newX
        center[1] += newY
    }

    center[0] /= float64(len(results))
    center[1] /= float64(len(results))

    for i := range results {
        results[i][0] -= center[0]
        results[i][1] -= center[1]
    }

    width := math.Abs(results[0][0] - results[len(results)/2][0])
    height := math.Abs(results[len(results)/4][1] - results[len(results)*3/4][1])

    results = append(results, results[0], results[1])
    return results, width, height, center
}

func main() {
    // Example of usage
    facePoints, width, height, center := generateFaceContourPoints(100)
    // Here you can use the facePoints, width, height, and center for further processing or visualization
    _ = facePoints // This line is just to avoid unused variable error. Replace it with your actual code.
    _ = width
    _ = height
    _ = center
}
