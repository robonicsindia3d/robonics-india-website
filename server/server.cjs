require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://robonicsindia3d.com', 'https://www.robonicsindia3d.com'] : '*', 
  credentials: true
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test Database Connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Database connection error:', err.stack);
  }
  console.log('✅ Database connected successfully to Supabase');
  release();
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to decrement stock
const decrementStock = async (itemsJson) => {
  try {
    const items = JSON.parse(itemsJson);
    for (const item of items) {
      await pool.query('UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2', [item.quantity || 1, item.id]);
    }
  } catch (e) {
    console.error('Error parsing items for stock decrement:', e);
  }
};

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) req.user = user;
      next();
    });
  } else {
    next();
  }
};

const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.id]);
    if (rows.length === 0 || rows[0].role !== 'admin') {
      return res.sendStatus(403);
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.sendStatus(403);
  }
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'Email already registered' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const role = email === 'vatsalaggarwal31@gmail.com' ? 'admin' : 'user';
    
    const { rows: newUser } = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, hashedPassword, role]
    );
    
    const token = jwt.sign({ id: newUser[0].id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: newUser[0].id, name, email, role } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    
    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, shipping_address, billing_address, role FROM users WHERE id = $1', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- ADDRESS BOOK ---
app.get('/api/addresses', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [req.user.id]);
    res.json({ success: true, addresses: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/addresses', authenticateToken, async (req, res) => {
  const { label, full_name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;
  try {
    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = $1', [req.user.id]);
    }
    const { rows } = await pool.query(
      `INSERT INTO addresses (user_id, label, full_name, phone, address_line1, address_line2, city, state, pincode, is_default) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [req.user.id, label || 'Home', full_name, phone || '', address_line1, address_line2 || '', city, state, pincode, is_default ? 1 : 0]
    );
    res.json({ success: true, address: { id: rows[0].id } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id ASC');
    const formatted = rows.map(r => ({
      ...r,
      images: JSON.parse(r.images_json || '[]')
    }));
    res.json({ success: true, products: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: { ...rows[0], images: JSON.parse(rows[0].images_json || '[]') } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- ADMIN & UPLOAD ---
const upload = multer({ dest: 'uploads/' });

app.post('/api/admin/upload', authenticateAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'robonics_products'
    });
    fs.unlinkSync(req.file.path); // Delete temp file
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Cloudinary upload failed' });
  }
});

app.post('/api/admin/products', authenticateAdmin, async (req, res) => {
  const { name, category, price, image, images, stock } = req.body;
  const imagesJson = JSON.stringify(images || [image]);
  try {
    const { rows } = await pool.query(
      'INSERT INTO products (name, category, price, image, images_json, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, category, price, image, imagesJson, stock || 10]
    );
    res.json({ success: true, product: { id: rows[0].id, name, category, price, image, images: images || [image], stock: stock || 10 } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- RAZORPAY & ORDERS ---
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post('/api/create-order', optionalAuth, async (req, res) => {
  try {
    const { amount, customerName, customerEmail, customerPhone, shippingAddress, billingAddress, items } = req.body;
    const userId = req.user ? req.user.id : null;
    const order = await razorpay.orders.create({ amount: amount * 100, currency: 'INR', receipt: `rcpt_${Date.now()}` });
    
    await pool.query(
      `INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, shipping_address, billing_address, items, total_amount) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [order.id, userId, customerName, customerEmail, customerPhone, shippingAddress, billingAddress, JSON.stringify(items), amount]
    );
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');

  if (expectedSignature === razorpay_signature) {
    await pool.query("UPDATE orders SET status = 'paid' WHERE id = $1", [razorpay_order_id]);
    const { rows } = await pool.query("SELECT * FROM orders WHERE id = $1", [razorpay_order_id]);
    if (rows.length > 0) decrementStock(rows[0].items);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});

app.post('/api/place-cod-order', optionalAuth, async (req, res) => {
  const { amount, customerName, customerEmail, customerPhone, shippingAddress, billingAddress, items } = req.body;
  const userId = req.user ? req.user.id : null;
  const orderId = `cod_${Date.now()}`;
  try {
    await pool.query(
      `INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, shipping_address, billing_address, items, total_amount, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [orderId, userId, customerName, customerEmail, customerPhone, shippingAddress, billingAddress, JSON.stringify(items), amount, 'confirmed_cod']
    );
    decrementStock(JSON.stringify(items));
    res.json({ success: true, orderId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/admin/products/:id/stock', authenticateAdmin, async (req, res) => {
  const { stock } = req.body;
  try {
    await pool.query('UPDATE products SET stock = $1 WHERE id = $2', [stock, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.get('/api/orders/me', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ success: true, orders: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json({ success: true, orders: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.get('/api/admin/coupons', authenticateAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ success: true, coupons: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.post('/api/admin/coupons', authenticateAdmin, async (req, res) => {
  const { code, discount_type, discount_value } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO coupons (code, discount_type, discount_value) VALUES ($1, $2, $3) RETURNING id',
      [code.toUpperCase(), discount_type, discount_value]
    );
    res.json({ success: true, coupon: { id: rows[0].id, code: code.toUpperCase(), discount_type, discount_value, is_active: 1 } });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Coupon already exists' });
  }
});

app.post('/api/coupons/validate', async (req, res) => {
  const { code } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM coupons WHERE code = $1 AND is_active = 1', [code.toUpperCase()]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Invalid coupon' });
    res.json({ success: true, coupon: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// --- SHIPROCKET Integration ---
let shiprocketToken = null;
let shiprocketTokenExpiry = null;

const getShiprocketToken = async () => {
  if (shiprocketToken && shiprocketTokenExpiry && new Date() < shiprocketTokenExpiry) return shiprocketToken;
  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: process.env.SHIPROCKET_EMAIL, password: process.env.SHIPROCKET_PASSWORD })
    });
    const data = await res.json();
    if (data.token) {
      shiprocketToken = data.token;
      shiprocketTokenExpiry = new Date(new Date().getTime() + 9 * 24 * 60 * 60 * 1000);
      return shiprocketToken;
    }
    throw new Error('Failed to authenticate with Shiprocket');
  } catch (error) { return null; }
};

app.post('/api/calculate-shipping', async (req, res) => {
  try {
    const { pincode, items, paymentMethod } = req.body;
    let totalWeight = 0;
    if (items) {
      items.forEach(item => {
        const size = item.size || '10cm';
        let itemWeight = size === '10cm' ? 0.2 : (size === '15cm' ? 0.5 : 1.0);
        totalWeight += (itemWeight * (item.quantity || 1));
      });
    }
    if (totalWeight === 0) totalWeight = 0.5;

    const token = await getShiprocketToken();
    if (!token) return res.status(500).json({ success: false, message: 'Shipping service unavailable' });

    const isCod = paymentMethod === 'cod' ? 1 : 0;
    const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=201017&delivery_postcode=${pincode}&weight=${totalWeight}&cod=${isCod}`;
    const srRes = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    const srData = await srRes.json();
    
    if (srData.status === 200 && srData.data && srData.data.available_courier_companies.length > 0) {
      const lowestRate = Math.min(...srData.data.available_courier_companies.map(c => c.rate));
      return res.json({ success: true, shippingCost: Math.ceil(lowestRate + 15) });
    }
    res.json({ success: false, message: 'Delivery not available to this pincode', fallbackCost: 100 });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', fallbackCost: 100 });
  }
});

// ... (Other endpoints follow) ...


// --- SERVE FRONTEND ---
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Handle React routing, return all requests to React app
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
