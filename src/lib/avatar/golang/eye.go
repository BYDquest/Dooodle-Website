package eye

import (
    "math"
    "math/rand"
    "time"
)

func init() {
    rand.Seed(time.Now().UnixNano())
}

// randomFromInterval generates a random float64 between min and max, inclusive
func randomFromInterval(min, max float64) float64 {
    return min + rand.Float64()*(max-min)
}

// cubicBezier calculates a point on a cubic Bezier curve given four control points and a parameter t
func cubicBezier(P0, P1, P2, P3 [2]float64, t float64) [2]float64 {
    x := math.Pow(1-t, 3)*P0[0] + 3*math.Pow(1-t, 2)*t*P1[0] + 3*(1-t)*math.Pow(t, 2)*P2[0] + math.Pow(t, 3)*P3[0]
    y := math.Pow(1-t, 3)*P0[1] + 3*math.Pow(1-t, 2)*t*P1[1] + 3*(1-t)*math.Pow(t, 2)*P2[1] + math.Pow(t, 3)*P3[1]
    return [2]float64{x, y}
}

// generateEyeParameters generates random parameters for an eye's shape
func generateEyeParameters(width float64) map[string]float64 {
    heightUpper := rand.Float64() * width / 1.2
    heightLower := rand.Float64() * width / 1.2
    P0UpperRandX := rand.Float64()*0.4 - 0.2
    P3UpperRandX := rand.Float64()*0.4 - 0.2
    P0UpperRandY := rand.Float64()*0.4 - 0.2
    P3UpperRandY := rand.Float64()*0.4 - 0.2
    offsetUpperLeftRandY := rand.Float64()
    offsetUpperRightRandY := rand.Float64()
    eyeTrueWidth := width + P3UpperRandX*width/16 - (-width/2 + P0UpperRandX*width/16)

    return map[string]float64{
        "heightUpper":           heightUpper,
        "heightLower":           heightLower,
        "P0UpperRandX":          P0UpperRandX,
        "P3UpperRandX":          P3UpperRandX,
        "P0UpperRandY":          P0UpperRandY,
        "P3UpperRandY":          P3UpperRandY,
        "offsetUpperLeftRandY":  offsetUpperLeftRandY,
        "offsetUpperRightRandY": offsetUpperRightRandY,
        "eyeTrueWidth":          eyeTrueWidth,
    }
}

// generateEyePoints calculates points for upper and lower eyelids based on random parameters
func generateEyePoints(rands map[string]float64, width float64) ([][][2]float64, [][2]float64) {
    P0Upper := [2]float64{-width/2 + rands["P0UpperRandX"]*width/16, rands["P0UpperRandY"] * rands["heightUpper"] / 16}
    P3Upper := [2]float64{width/2 + rands["P3UpperRandX"]*width/16, rands["P3UpperRandY"] * rands["heightUpper"] / 16}
    P0Lower := P0Upper
    P3Lower := P3Upper

    // Upper eyelid control points
    P1Upper := [2]float64{P0Upper[0] + rands["offsetUpperLeftX"], P0Upper[1] + rands["offsetUpperLeftY"]}
    P2Upper := [2]float64{P3Upper[0] - rands["offsetUpperRightX"], P3Upper[1] + rands["offsetUpperRightY"]}

    // Lower eyelid control points
    P1Lower := [2]float64{P0Lower[0] + rands["offsetLowerLeftX"], P0Lower[1] - rands["offsetLowerLeftY"]}
    P2Lower := [2]float64{P3Lower[0] - rands["offsetLowerRightX"], P3Lower[1] - rands["offsetLowerRightY"]}

    upperEyelidPoints := make([][][2]float64, 100)
    lowerEyelidPoints := make([][2]float64, 100)

    for t := 0; t < 100; t++ {
        upperEyelidPoints[t] = cubicBezier(P0Upper, P1Upper, P2Upper, P3Upper, float64(t)/100.0)
        lowerEyelidPoints[t] = cubicBezier(P0Lower, P1Lower, P2Lower, P3Lower, float64(t)/100.0)
    }

    return upperEyelidPoints, lowerEyelidPoints
}

// generateBothEyes creates left and right eye points
func generateBothEyes(width float64) ([][][2]float64, [][][2]float64) {
    randsLeft := generateEyeParameters(width)

    // Create and modify parameters for the right eye
    randsRight := make(map[string]float64)
    for k, v := range randsLeft {
        randsRight[k] = v + randomFromInterval(-v/2.0, v/2.0)
    }

    upperLeft, lowerLeft := generateEyePoints(randsLeft, width)
    upperRight, lowerRight := generateEyePoints(randsRight, width)

    return append(upperLeft, lowerLeft...), append(upperRight, lowerRight...)
}

func main() {
    // Example of usage
    leftEye, rightEye := generateBothEyes(50)
    _ = leftEye  // Use the generated points for further processing or visualization
    _ = rightEye // Use the generated points for further processing or visualization
}
