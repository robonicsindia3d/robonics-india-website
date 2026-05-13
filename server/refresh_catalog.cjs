const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Paths
const imagesRoot = path.join(__dirname, '../public/Images');
const productsJsPath = path.join(__dirname, '../src/data/products.js');
const dbPath = path.join(__dirname, 'orders.db'); // Based on server.cjs using orders.db or database.sqlite

// --- 1. CRAWL IMAGES ---
console.log('🔍 Scanning public/Images...');
const categories = fs.readdirSync(imagesRoot).filter(f => fs.statSync(path.join(imagesRoot, f)).isDirectory() && f !== 'uploads');

const products = [];
let idCounter = 1;

categories.forEach(catFolder => {
  const catPath = path.join(imagesRoot, catFolder);
  const characters = fs.readdirSync(catPath).filter(f => fs.statSync(path.join(catPath, f)).isDirectory());
  
  // Clean category name (remove "1. ", "2. " prefix)
  const catName = catFolder.replace(/^\d+\.\s*/, '');

  characters.forEach(charFolder => {
    const charPath = path.join(catPath, charFolder);
    // Look for "Photo" or "Photos" or "Photo (2)" etc.
    const photoSubFolders = fs.readdirSync(charPath).filter(f => f.toLowerCase().includes('photo') && fs.statSync(path.join(charPath, f)).isDirectory());
    
    let allImages = [];
    photoSubFolders.forEach(sub => {
      const subPath = path.join(charPath, sub);
      const imgs = fs.readdirSync(subPath).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
      
      imgs.forEach(img => {
        // Create relative path for frontend
        const relPath = `/Images/${catFolder}/${charFolder}/${sub}/${img}`;
        allImages.push(relPath);
      });
    });

    if (allImages.length > 0) {
      // Sort images: prefer "1.jpg", "1.png" as main, or just the first one
      allImages.sort((a, b) => {
        const aName = path.basename(a).toLowerCase();
        const bName = path.basename(b).toLowerCase();
        if (aName === '1.jpg' || aName === '1.png') return -1;
        if (bName === '1.jpg' || bName === '1.png') return 1;
        return aName.localeCompare(bName);
      });

      products.push({
        id: idCounter++,
        name: charFolder,
        category: catName,
        price: 399, // Default price
        scale: 8,   // Default scale
        image: allImages[0],
        images: allImages,
        stock: 10
      });
    }
  });
});

console.log(`✅ Found ${products.length} products with ${products.reduce((acc, p) => acc + p.images.length, 0)} total images.`);

// --- 2. UPDATE src/data/products.js ---
const jsContent = `// Auto-generated products file
export const productsData = ${JSON.stringify(products, null, 2)};
`;
fs.writeFileSync(productsJsPath, jsContent);
console.log('💾 Updated src/data/products.js');

// --- 3. SYNC TO SUPABASE ---
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.DATABASE_URL) {
  console.log('❌ No DATABASE_URL found in .env. Skipping DB sync.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function syncDb() {
  console.log('🚀 Connecting to Supabase...');
  try {
    // 1. Delete all products
    console.log('🗑️ Clearing old products...');
    await pool.query('DELETE FROM products');
    
    // 2. Insert new products
    console.log('📤 Uploading new catalog...');
    for (const p of products) {
      await pool.query(
        'INSERT INTO products (name, category, price, image, images_json, stock) VALUES ($1, $2, $3, $4, $5, $6)',
        [p.name, p.category, p.price, p.image, JSON.stringify(p.images), p.stock]
      );
    }
    
    console.log('✨ DATABASE SYNC COMPLETE! All products are now live.');
  } catch (err) {
    console.error('❌ Error syncing database:', err);
  } finally {
    await pool.end();
  }
}

syncDb();
