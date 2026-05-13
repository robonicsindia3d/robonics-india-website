const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const imagesRoot = path.join(__dirname, '../public/Images');
const productsJsPath = path.join(__dirname, '../src/data/products.js');

async function migrate() {
  console.log('🚀 Starting Cloudinary Migration...');
  
  const categories = fs.readdirSync(imagesRoot).filter(f => fs.statSync(path.join(imagesRoot, f)).isDirectory() && f !== 'uploads');
  const products = [];
  let idCounter = 1;

  for (const catFolder of categories) {
    const catPath = path.join(imagesRoot, catFolder);
    const characters = fs.readdirSync(catPath).filter(f => fs.statSync(path.join(catPath, f)).isDirectory());
    const catName = catFolder.replace(/^\d+\.\s*/, '');

    for (const charFolder of characters) {
      const charPath = path.join(catPath, charFolder);
      const photoSubFolders = fs.readdirSync(charPath).filter(f => f.toLowerCase().includes('photo') && fs.statSync(path.join(charPath, f)).isDirectory());
      
      let allCloudinaryImages = [];

      for (const sub of photoSubFolders) {
        const subPath = path.join(charPath, sub);
        const imgs = fs.readdirSync(subPath).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
        
        for (const img of imgs) {
          const fullPath = path.join(subPath, img);
          const publicId = `catalog/${catName}/${charFolder}/${path.parse(img).name}`.replace(/\s+/g, '_');
          
          console.log(`📤 Uploading: ${charFolder} - ${img}...`);
          try {
            const result = await cloudinary.uploader.upload(fullPath, {
              public_id: publicId,
              folder: `robonics/catalog/${catName}/${charFolder}`,
              resource_type: 'image',
              overwrite: true
            });
            allCloudinaryImages.push(result.secure_url);
          } catch (err) {
            console.error(`❌ Failed to upload ${img}:`, err.message);
          }
        }
      }

      if (allCloudinaryImages.length > 0) {
        // Sort: try to find an image that was named "1.jpg" or similar originally
        // For simplicity, we'll just take the first one since they were uploaded in order
        
        products.push({
          id: idCounter++,
          name: charFolder,
          category: catName,
          price: 399,
          scale: 8,
          image: allCloudinaryImages[0],
          images: allCloudinaryImages,
          stock: 10
        });
      }
    }
  }

  console.log(`✅ Uploaded ${products.length} products. Updating Database...`);

  // --- UPDATE DATABASE ---
  try {
    console.log('🗑️ Clearing old products...');
    await pool.query('DELETE FROM products');
    
    console.log('📤 Syncing new Cloudinary links to Supabase...');
    for (const p of products) {
      await pool.query(
        'INSERT INTO products (name, category, price, image, images_json, stock) VALUES ($1, $2, $3, $4, $5, $6)',
        [p.name, p.category, p.price, p.image, JSON.stringify(p.images), p.stock]
      );
    }
    
    // --- UPDATE JS FILE ---
    const jsContent = `// Auto-generated products file (CLOUDINARY)
export const productsData = ${JSON.stringify(products, null, 2)};
`;
    fs.writeFileSync(productsJsPath, jsContent);
    console.log('💾 Updated src/data/products.js');
    
    console.log('✨ MIGRATION COMPLETE! Your images are now served via Cloudinary CDN.');
  } catch (err) {
    console.error('❌ Database error:', err);
  } finally {
    await pool.end();
  }
}

migrate();
