const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const productsFilePath = path.resolve(__dirname, '../src/data/products.js');
let productsContent = fs.readFileSync(productsFilePath, 'utf8');

// Strip the export statement to parse as JSON
productsContent = productsContent.replace('// Auto-generated products file\n', '');
productsContent = productsContent.replace('export const productsData = ', '');
// Remove the trailing semicolon if it exists
if (productsContent.endsWith(';\n')) {
  productsContent = productsContent.slice(0, -2);
} else if (productsContent.endsWith(';')) {
  productsContent = productsContent.slice(0, -1);
}

try {
  const products = JSON.parse(productsContent);
  
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      scale INTEGER NOT NULL,
      image TEXT NOT NULL,
      images_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Check if empty before inserting
    db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
      if (err) throw err;
      if (row.count === 0) {
        const stmt = db.prepare(`INSERT INTO products (name, category, price, scale, image, images_json) VALUES (?, ?, ?, ?, ?, ?)`);
        products.forEach(p => {
          stmt.run([p.name, p.category, p.price, p.scale, p.image, JSON.stringify(p.images)]);
        });
        stmt.finalize(() => {
          console.log("Seeded " + products.length + " products into DB.");
          db.close();
        });
      } else {
        console.log("Products table already has data. Skipping seed.");
        db.close();
      }
    });
  });

} catch (err) {
  console.error("Error parsing products.js", err);
  db.close();
}
