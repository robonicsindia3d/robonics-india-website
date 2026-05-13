const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'Images');
const outputFile = path.join(__dirname, 'src', 'data', 'products.js');

let products = [];
let idCounter = 1;

// Helper to recursively get all image files in a directory
function getAllImages(dirPath, arrayOfFiles) {
  if (!fs.existsSync(dirPath)) return [];
  
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllImages(path.join(dirPath, file), arrayOfFiles);
    } else {
      if (/\.(png|jpe?g|webp)$/i.test(file)) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

if (fs.existsSync(imagesDir)) {
  const categories = fs.readdirSync(imagesDir).filter(file => fs.statSync(path.join(imagesDir, file)).isDirectory());
  
  categories.forEach(categoryFolder => {
    // Extract category name (e.g., "1. Harry Potter" -> "Harry Potter")
    const categoryName = categoryFolder.replace(/^\d+\.\s*/, '');
    const categoryPath = path.join(imagesDir, categoryFolder);
    
    // The subdirectories here are the individual products
    const productFolders = fs.readdirSync(categoryPath).filter(file => fs.statSync(path.join(categoryPath, file)).isDirectory());
    
    productFolders.forEach(productFolder => {
      const productName = productFolder;
      const productPath = path.join(categoryPath, productFolder);
      
      // Get all images recursively within this specific product folder
      const absoluteImagePaths = getAllImages(productPath);
      
      if (absoluteImagePaths.length > 0) {
        // Convert to relative paths
        const imageFiles = absoluteImagePaths.map(absolutePath => {
           return '/' + absolutePath.replace(__dirname + path.sep + 'public' + path.sep, '').replace(/\\/g, '/');
        });
        
        products.push({
          id: idCounter++,
          name: productName,
          category: categoryName,
          price: 399,
          scale: 8,
          image: imageFiles[0], // Main image
          images: imageFiles // All images
        });
      }
    });
  });
}

const fileContent = `// Auto-generated products file\nexport const productsData = ${JSON.stringify(products, null, 2)};\n`;

fs.writeFileSync(outputFile, fileContent);
console.log(`Generated ${products.length} products in src/data/products.js`);
