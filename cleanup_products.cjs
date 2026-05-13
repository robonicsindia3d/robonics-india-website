const { Pool } = require('pg');
require('dotenv').config({ path: './server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function removeDuplicates() {
  console.log('🧹 Starting Cleanup...');

  try {
    // This query keeps the record with the smallest ID and deletes others with the same name
    const res = await pool.query(`
      DELETE FROM products 
      WHERE id NOT IN (
        SELECT MIN(id) 
        FROM products 
        GROUP BY name
      )
    `);

    console.log(`✅ Success! Deleted ${res.rowCount} duplicate products.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

removeDuplicates();
