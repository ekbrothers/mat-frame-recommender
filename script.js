console.log("Script loaded and ready");

function processImage() {
    console.log("processImage function called");
    const input = document.getElementById('imageUpload');
    const file = input.files[0];
    if (file) {
        console.log("File selected:", file.name);
        const reader = new FileReader();
        reader.onload = function(e) {
            console.log("File read successfully");
            const img = new Image();
            img.onload = function() {
                console.log("Image loaded, dimensions:", img.width, "x", img.height);
                document.getElementById('imagePreview').innerHTML = '<img src="' + e.target.result + '" style="max-width: 100%;">';
                analyzeColors(img);
            }
            img.onerror = function() {
                console.error("Error loading image");
            }
            img.src = e.target.result;
        }
        reader.onerror = function(e) {
            console.error("Error reading file:", e);
        }
        reader.readAsDataURL(file);
    } else {
        console.warn("No file selected");
    }
}

function analyzeColors(img) {
    console.log("Analyzing colors...");
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log("Image data obtained, size:", imageData.data.length);
    const colors = getColors(imageData.data);
    console.log("Extracted colors:", colors);
    const recommendations = generateRecommendations(colors);
    console.log("Generated recommendations:", recommendations);
    displayRecommendations(recommendations);
    createMatPreviews(img, recommendations);
}

function getColors(data) {
    console.log("Getting colors from image data");
    const colorCounts = {};
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const hex = rgbToHex(r, g, b);
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
    }
    const sortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
    console.log("Top 5 colors:", sortedColors);
    return sortedColors;
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function generateRecommendations(colors) {
    console.log("Generating recommendations for colors:", colors);
    const recommendations = [];
    colors.forEach((color, index) => {
        recommendations.push({ name: `Color ${index + 1}`, color: color });
        recommendations.push({ name: `Complementary ${index + 1}`, color: getComplementary(color) });
    });
    recommendations.push({ name: 'White', color: '#FFFFFF' });
    recommendations.push({ name: 'Black', color: '#000000' });
    return recommendations;
}

function getComplementary(hex) {
    hex = hex.replace('#', '');
    const rgb = parseInt(hex, 16);
    const comp = (0xFFFFFF ^ rgb).toString(16);
    return '#' + comp.padStart(6, '0');
}

function displayRecommendations(recommendations) {
    console.log("Displaying recommendations:", recommendations);
    const container = document.getElementById('colorRecommendations');
    container.innerHTML = '<h2>Recommended Mat Colors</h2>';
    recommendations.forEach(rec => {
        container.innerHTML += `
            <div>
                <span class="color-sample" style="background-color: ${rec.color};"></span>
                ${rec.name}: ${rec.color}
            </div>
        `;
    });
}

function createMatPreviews(img, recommendations) {
    console.log("Creating mat previews for", recommendations.length, "recommendations");
    const container = document.getElementById('matPreviews');
    container.innerHTML = '<h2>Mat Color Previews</h2>';
    recommendations.forEach((rec, index) => {
        console.log(`Creating preview for ${rec.name} (${rec.color})`);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const matWidth = 50;
        
        const scaleFactor = Math.min(200 / img.width, 200 / img.height);
        const scaledWidth = img.width * scaleFactor;
        const scaledHeight = img.height * scaleFactor;
        
        canvas.width = scaledWidth + (matWidth * 2);
        canvas.height = scaledHeight + (matWidth * 2);

        ctx.fillStyle = rec.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, matWidth, matWidth, scaledWidth, scaledHeight);

        container.innerHTML += `
            <div class="mat-preview">
                <canvas width="${canvas.width}" height="${canvas.height}"></canvas>
                <p>${rec.name}</p>
            </div>
        `;
        container.lastElementChild.querySelector('canvas').getContext('2d').drawImage(canvas, 0, 0);
        console.log(`Preview ${index + 1} created`);
    });
    console.log("All previews created");
}