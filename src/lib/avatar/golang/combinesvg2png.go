package main

import (
    "fmt"
    "image"
    "image/draw"
    "os"
    "path/filepath"
    "sync"

    "github.com/disintegration/imaging"
)

func ensureDirectoryExists(dirPath string) error {
    if _, err := os.Stat(dirPath); os.IsNotExist(err) {
        return os.MkdirAll(dirPath, os.ModePerm)
    }
    return nil
}

func processBatch(batchFiles []string, imageDir, outputDir string, batchNumber, gridWidth, outputImageWidth, outputImageHeight int) error {
    combinedImageWidth := gridWidth * outputImageWidth
    combinedImageHeight := gridWidth * outputImageHeight
    canvas := imaging.New(combinedImageWidth, combinedImageHeight, image.White)

    for index, file := range batchFiles {
        x := (index % gridWidth) * outputImageWidth
        y := (index / gridWidth) * outputImageHeight

        img, err := imaging.Open(filepath.Join(imageDir, file))
        if err != nil {
            fmt.Println("Error opening image:", err)
            continue
        }
        img = imaging.Resize(img, outputImageWidth, outputImageHeight, imaging.Lanczos)
        canvas = imaging.Paste(canvas, img, image.Pt(x, y))
    }

    outputPath := filepath.Join(outputDir, fmt.Sprintf("%d.png", batchNumber))
    if err := imaging.Save(canvas, outputPath); err != nil {
        return err
    }
    fmt.Printf("Combined image %d created in %s directory.\n", batchNumber+1, outputDir)
    return nil
}

func combineSVGImages(imageDir, outputDir string, gridWidth, outputImageWidth, outputImageHeight, concurrencyLimit int) error {
    if err := ensureDirectoryExists(outputDir); err != nil {
        return err
    }

    files, err := os.ReadDir(imageDir)
    if err != nil {
        return err
    }

    var imageFiles []string
    for _, file := range files {
        if filepath.Ext(file.Name()) == ".svg" {
            imageFiles = append(imageFiles, file.Name())
        }
    }

    imagesPerCombined := gridWidth * gridWidth
    var batches [][]string
    for i := 0; i < len(imageFiles); i += imagesPerCombined {
        end := i + imagesPerCombined
        if end > len(imageFiles) {
            end = len(imageFiles)
        }
        batches = append(batches, imageFiles[i:end])
    }

    var wg sync.WaitGroup
    semaphore := make(chan struct{}, concurrencyLimit)

    for i, batchFiles := range batches {
        wg.Add(1)
        semaphore <- struct{}{}
        go func(batchFiles []string, batchNumber int) {
            defer wg.Done()
            if err := processBatch(batchFiles, imageDir, outputDir, batchNumber, gridWidth, outputImageWidth, outputImageHeight); err != nil {
                fmt.Println("Error processing batch:", err)
            }
            <-semaphore
        }(batchFiles, i)
    }
    wg.Wait()

    return nil
}

func main() {
    if err := combineSVGImages("avatar", "combined-image", 10, 100, 100, 4); err != nil {
        fmt.Println("Error:", err)
    }
}
