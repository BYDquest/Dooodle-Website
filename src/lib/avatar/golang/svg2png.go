package main

import (
	"fmt"
	"image"
	"image/png"
	"io/ioutil"
	"os"
	"path/filepath"
	"runtime"
	"sync"

	"github.com/srwiley/oksvg"
	"github.com/srwiley/rasterx"
)

const concurrencyLimit = 200

func convertFile(inputPath, outputPath string) error {
	infile, err := os.Open(inputPath)
	if err != nil {
		return fmt.Errorf("error opening SVG file: %w", err)
	}
	defer infile.Close()

	icon, err := oksvg.ReadIconStream(infile)
	if err != nil {
		return fmt.Errorf("error parsing SVG file: %w", err)
	}

	w, h := int(icon.ViewBox.W), int(icon.ViewBox.H)
	img := image.NewRGBA(image.Rect(0, 0, w, h))

	scanner := rasterx.NewScannerGV(w, h, img, img.Bounds())
	raster := rasterx.NewDasher(w, h, scanner)

	icon.SetTarget(0, 0, float64(w), float64(h))
	icon.Draw(raster, 1.0)

	outfile, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("error creating output file: %w", err)
	}
	defer outfile.Close()

	if err := png.Encode(outfile, img); err != nil {
		return fmt.Errorf("error encoding PNG: %w", err)
	}

	fmt.Printf("%s has been converted to PNG.\n", filepath.Base(inputPath))
	return nil
}

func processFiles(files []os.FileInfo, svgDirectory, outputDirectory string) {
	var wg sync.WaitGroup
	semaphore := make(chan struct{}, concurrencyLimit)

	for _, file := range files {
		wg.Add(1)
		semaphore <- struct{}{}

		go func(file os.FileInfo) {
			defer wg.Done()
			inputPath := filepath.Join(svgDirectory, file.Name())
			outputPath := filepath.Join(outputDirectory, fmt.Sprintf("%s.png", file.Name()[:len(file.Name())-len(filepath.Ext(file.Name()))]))

			if err := convertFile(inputPath, outputPath); err != nil {
				fmt.Println(err)
			}

			<-semaphore
		}(file)
	}

	wg.Wait()
}

func main() {
	svgDirectory := "./avatar"
	outputDirectory := "./avatar-png"

	if err := os.MkdirAll(outputDirectory, os.ModePerm); err != nil {
		fmt.Println("Error creating output directory:", err)
		return
	}

	files, err := ioutil.ReadDir(svgDirectory)
	if err != nil {
		fmt.Println("Error reading directory:", err)
		return
	}

	var svgFiles []os.FileInfo
	for _, file := range files {
		if filepath.Ext(file.Name()) == ".svg" {
			svgFiles = append(svgFiles, file)
		}
	}

	fmt.Printf("Starting the conversion of %d files...\n", len(svgFiles))
	processFiles(svgFiles, svgDirectory, outputDirectory)
	fmt.Println("All files have been converted.")
}
