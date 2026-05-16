const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('Adding description column...');
    await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT \'\';');
    
    console.log('Adding variants column...');
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '{"options": [{"name": "Size", "choices": [{"label": "10cm", "priceModifier": 0}, {"label": "15cm", "priceModifier": 400}, {"label": "25cm", "priceModifier": 1100}]}]}';`);
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
