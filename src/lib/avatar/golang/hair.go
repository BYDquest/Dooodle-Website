package hair

import (
    "math"
    "math/rand"
    "sort"
    "time"
)

type Point struct {
    X float64
    Y float64
}

func randomFromInterval(min, max float64) float64 {
    return min + rand.Float64()*(max-min)
}

func computeBezierCurve(controlPoints []Point, numberOfPoints int) []Point {
    curve := make([]Point, 0)
    for i := 0; i <= numberOfPoints; i++ {
        t := float64(i) / float64(numberOfPoints)
        curve = append(curve, calculateBezierPoint(t, controlPoints))
    }
    return curve
}

func calculateBezierPoint(t float64, controlPoints []Point) Point {
    var x, y float64
    n := len(controlPoints) - 1
    for i := 0; i <= n; i++ {
        binCoeff := binomialCoefficient(n, i)
        a := math.Pow(1-t, float64(n-i))
        b := math.Pow(t, float64(i))
        x += binCoeff * a * b * controlPoints[i].X
        y += binCoeff * a * b * controlPoints[i].Y
    }
    return Point{x, y}
}

func binomialCoefficient(n, k int) float64 {
    return float64(factorial(n)) / (float64(factorial(k)) * float64(factorial(n-k)))
}

func factorial(n int) int {
    if n <= 1 {
        return 1
    }
    return n * factorial(n-1)
}


func generateHairLines0(faceContour []Point, numHairLines int) [][]Point {
    faceContourCopy := faceContour[:len(faceContour)-2]
    results := make([][]Point, 0)
    for i := 0; i < numHairLines; i++ {
        numHairPoints := 20 + int(math.Floor(randomFromInterval(-5, 5)))
        hairLine := make([]Point, 0)
        indexOffset := int(math.Floor(randomFromInterval(30, 140)))
        for j := 0; j < numHairPoints; j++ {
            index := (len(faceContourCopy) - (j + indexOffset)) % len(faceContourCopy)
            hairLine = append(hairLine, faceContourCopy[index])
        }
        d0 := computeBezierCurve(hairLine, numHairPoints)
        hairLine = make([]Point, 0)
        indexOffset = int(math.Floor(randomFromInterval(30, 140)))
        for j := 0; j < numHairPoints; j++ {
            index := (len(faceContourCopy) - (-j + indexOffset)) % len(faceContourCopy)
            hairLine = append(hairLine, faceContourCopy[index])
        }
        d1 := computeBezierCurve(hairLine, numHairPoints)
        d := make([]Point, numHairPoints)
        for j := 0; j < numHairPoints; j++ {
            d[j] = Point{
                X: d0[j].X*(math.Pow(float64(j)*(1/float64(numHairPoints)), 2)) + d1[j].X*(1-math.Pow(float64(j)*(1/float64(numHairPoints)), 2)),
                Y: d0[j].Y*(math.Pow(float64(j)*(1/float64(numHairPoints)), 2)) + d1[j].Y*(1-math.Pow(float64(j)*(1/float64(numHairPoints)), 2)),
            }
        }
        results = append(results, d)
    }
    return results
}


func generateHairLines1(faceContour []Point, numHairLines int) [][]Point {
    faceContourCopy := faceContour[:len(faceContour)-2]
    results := make([][]Point, 0)
    for i := 0; i < numHairLines; i++ {
        numHairPoints := 20 + int(math.Floor(randomFromInterval(-5, 5)))
        hairLine := make([]Point, 0)
        indexStart := int(math.Floor(randomFromInterval(20, 160)))
        hairLine = append(hairLine, faceContourCopy[(len(faceContourCopy)-indexStart)%len(faceContourCopy)])
        for j := 1; j < numHairPoints+1; j++ {
            indexStart = int(math.Floor(randomFromInterval(20, 160)))
            hairLine = append(hairLine, faceContourCopy[(len(faceContourCopy)-indexStart)%len(faceContourCopy)])
        }
        d := computeBezierCurve(hairLine, numHairPoints)
        results = append(results, d)
    }
    return results
}

func generateHairLines2(faceContour []Point, numHairLines int) [][]Point {
    faceContourCopy := faceContour[:len(faceContour)-2]
    results := make([][]Point, 0)
    pickedIndices := make([]int, numHairLines)
    for i := range pickedIndices {
        pickedIndices[i] = int(math.Floor(randomFromInterval(10, 180)))
    }
    sort.Ints(pickedIndices)
    for _, indexOffset := range pickedIndices {
        numHairPoints := 20 + int(math.Floor(randomFromInterval(-5, 5)))
        hairLine := make([]Point, 0)
        lower := randomFromInterval(0.8, 1.4)
        reverse := 1
        if rand.Float64() > 0.5 {
            reverse = -1
        }
        for j := 0; j < numHairPoints; j++ {
            powerscale := randomFromInterval(0.1, 3)
            portion := (1 - math.Pow(float64(j)/float64(numHairPoints), powerscale))*(1-lower) + lower
            index := (len(faceContourCopy) - (reverse*j + indexOffset)) % len(faceContourCopy)
            hairLine = append(hairLine, Point{
                X: faceContourCopy[index].X * portion,
                Y: faceContourCopy[index].Y * portion,
            })
        }
        d := computeBezierCurve(hairLine, numHairPoints)
        if rand.Float64() > 0.7 {
            reverseSlice(d)
        }
        if len(results) == 0 || rand.Float64() > 0.5 || distance(d[0], results[len(results)-1][len(results[len(results)-1])-1]) >= 100 {
            results = append(results, d)
        } else {
            results[len(results)-1] = append(results[len(results)-1], d...)
        }
    }
    return results
}

func generateHairLines3(faceContour []Point, numHairLines int) [][]Point {
    faceContourCopy := faceContour[:len(faceContour)-2]
    results := make([][]Point, 0)
    pickedIndices := make([]int, numHairLines)
    for i := range pickedIndices {
        pickedIndices[i] = int(math.Floor(randomFromInterval(10, 180)))
    }
    sort.Ints(pickedIndices)
    splitPoint := int(math.Floor(randomFromInterval(0, 200)))
    for _, indexOffset := range pickedIndices {
        numHairPoints := 30 + int(math.Floor(randomFromInterval(-8, 8)))
        hairLine := make([]Point, 0)
        lower := randomFromInterval(1, 2.3)
        if rand.Float64() > 0.9 {
            lower = randomFromInterval(0, 1.0)
        }
        reverse := 1
        if indexOffset > splitPoint {
            reverse = -1
        }
        for j := 0; j < numHairPoints; j++ {
            powerscale := randomFromInterval(0.1, 3)
            portion := (1 - math.Pow(float64(j)/float64(numHairPoints), powerscale))*(1-lower) + lower
            index := (len(faceContourCopy) - (reverse*j*2 + indexOffset)) % len(faceContourCopy)
            hairLine = append(hairLine, Point{
                X: faceContourCopy[index].X * portion,
                Y: faceContourCopy[index].Y,
            })
        }
        d := computeBezierCurve(hairLine, numHairPoints)
        results = append(results, d)
    }
    return results
}

func distance(p1, p2 Point) float64 {
    return math.Sqrt(math.Pow(p1.X-p2.X, 2) + math.Pow(p1.Y-p2.Y, 2))
}

func reverseSlice(s []Point) {
    for i, j := 0, len(s)-1; i < j; i, j = i+1, j-1 {
        s[i], s[j] = s[j], s[i]
    }
}

func main() {
    rand.Seed(time.Now().UnixNano())

    // Your code for testing or using the generated hair lines.
}
