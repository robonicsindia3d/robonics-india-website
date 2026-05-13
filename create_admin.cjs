const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  const name = 'Vatsal Aggarwal';
  const email = 'vatsalaggarwal31@gmail.com';
  const password = 'D@rKnight404';
  const role = 'admin';

  console.log(`🚀 Creating admin user: ${email}...`);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if exists
    const check = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      console.log('⚠️ User already exists. Updating to Admin...');
      await pool.query('UPDATE users SET role = $1, password_hash = $2 WHERE email = $3', [role, hashedPassword, email]);
    } else {
      await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        [name, email, hashedPassword, role]
      );
    }

    console.log('✅ Admin user created/updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
