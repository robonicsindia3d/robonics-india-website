const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: './server/.env' });

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Config Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Local DB
const localDb = new sqlite3.Database('./server/orders.db');

async function migrate() {
  console.log('🚀 Starting Migration...');

  localDb.all("SELECT * FROM products", async (err, products) => {
    if (err) {
      console.error('Error reading local DB:', err);
      return;
    }

    console.log(`📦 Found ${products.length} products locally.`);

    for (const product of products) {
      try {
        console.log(`\n--- Migrating: ${product.name} ---`);

        // 1. Handle Image
        let cloudUrl = product.image;
        if (product.image && !product.image.startsWith('http')) {
          // It's a local path, upload to Cloudinary
          // We need to resolve the path. Usually images are in public/
          const localPath = path.join(__dirname, 'public', product.image.startsWith('/') ? product.image.substring(1) : product.image);
          
          if (fs.existsSync(localPath)) {
            console.log(`📤 Uploading image to Cloudinary: ${product.image}`);
            const uploadRes = await cloudinary.uploader.upload(localPath, {
              folder: 'robonics_products'
            });
            cloudUrl = uploadRes.secure_url;
            console.log(`✅ Uploaded: ${cloudUrl}`);
          } else {
            console.log(`⚠️ Image not found locally: ${localPath}. Using placeholder.`);
            cloudUrl = "https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=400&auto=format&fit=crop";
          }
        }

        // 2. Handle Multi-Images (if any)
        let imagesJson = product.images_json || '[]';
        // (Optional: loop through images_json and upload those too if needed)

        // 3. Insert into Supabase
        await pool.query(
          'INSERT INTO products (name, category, price, image, images_json, stock) VALUES ($1, $2, $3, $4, $5, $6)',
          [product.name, product.category, product.price, cloudUrl, imagesJson, product.stock || 10]
        );

        console.log(`🎉 Successfully migrated ${product.name}`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${product.name}:`, error.message);
      }
    }

    console.log('\n✅ ALL DONE! Refresh your website now.');
    process.exit(0);
  });
}

migrate();
