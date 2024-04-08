const { optimize } = require('svgo');
const fs = require('fs');

// Path to your SVG file
const filePath = './0.svg';

// Read the SVG file
const svg = fs.readFileSync(filePath, 'utf-8');

// Optimize the SVG file
const result = optimize(svg, {
    // Optionally, configure SVGO settings
    // For example, to enable multipass:
    multipass: true,
    
    // See the SVGO documentation for other options
});

// Check if the optimization was successful
if (result.error) {
    console.error('Error optimizing the SVG:', result.error);
} else {
    // Write the optimized SVG to a new file
    fs.writeFileSync('./00.svg', result.data);
    console.log('SVG file optimized successfully!');
}
