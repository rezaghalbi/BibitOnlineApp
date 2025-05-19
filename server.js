const express = require('express');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

require('dotenv').config();
require('dotenv').config();

// Database Connection
const app = express();
// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware
// Konfigurasi CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        styleSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',
          'https://cdnjs.cloudflare.com',
          "'unsafe-inline'",
        ],
        imgSrc: ["'self'", 'data:', 'https://*.imgur.com'],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        connectSrc: ["'self'"],
      },
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/transactions', transactionRoutes);

// Static files
app.use(
  '/admin/css',
  express.static(path.join(__dirname, 'public/admin/css'), {
    setHeaders: (res) => {
      res.set('Content-Type', 'text/css');
    },
  })
);

// Admin Pages
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/dashboard.html'));
});

// Server Startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Admin panel available at: ${
      process.env.FRONTEND_URL || 'http://localhost:3000'
    }/admin/login`
  );
});
