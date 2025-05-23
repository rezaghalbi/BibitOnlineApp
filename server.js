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

// Database Connection
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// CORS Configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'https://b758-202-46-151-37.ngrok-free.app', // Izinkan semua subdomain ngrok
  ],

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
        scriptSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',
          "'sha256-CKrS9iGlM2wpO8Hc1jwBzALK4aP6OcdVdPgo9yDXMXA='",
          'https://app.sandbox.midtrans.com',
          "'unsafe-inline'",
          "'unsafe-eval'",
        ],
        styleSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',
          'https://cdnjs.cloudflare.com',
          "'unsafe-inline'",
        ],
        fontSrc: [
          "'self'",
          'https://cdnjs.cloudflare.com',
          'https://cdn.jsdelivr.net',
          'data:',
        ],
        imgSrc: ["'self'", 'data:', 'https://*.imgur.com'],
        connectSrc: [
          "'self'",
          'http://localhost:3000',
          'https://78ba-202-46-151-37.ngrok-free.app',
          'https://api.sandbox.midtrans.com',
          'https://app.sandbox.midtrans.com',
        ],
        frameSrc: ['https://app.sandbox.midtrans.com'],
      },
    },
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  '/css',
  express.static(
    path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/css')
  )
);
app.use(
  '/webfonts',
  express.static(
    path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts')
  )
);

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/transactions', transactionRoutes);

// Static files
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));
app.use(
  '/admin/css',
  express.static(path.join(__dirname, 'public/admin/css'), {
    setHeaders: (res) => {
      res.set('Content-Type', 'text/css');
    },
  })
);
// Konfigurasi khusus untuk folder user
// Konfigurasi static files
app.use(
  '/user/css',
  express.static(path.join(__dirname, 'public/user/css'), {
    setHeaders: (res) => {
      res.set('Content-Type', 'text/css');
    },
  })
);

app.use(
  '/user/js',
  express.static(path.join(__dirname, 'public/user/js'), {
    setHeaders: (res) => {
      res.set('Content-Type', 'application/javascript');
    },
  })
);
// Konfigurasi static files
app.use(
  '/user/partials',
  express.static(path.join(__dirname, 'public/user/partials'), {
    setHeaders: (res) => {
      res.set('Content-Type', 'text/html');
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
// routes untuk transaction
app.get('/admin/transactions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/transactions.html'));
});

app.use(
  '/user/images',
  express.static(path.join(__dirname, 'public/user/images'))
);

// User Pages
// Di server.js tambahkan route untuk transaction page
app.get('/transactions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/user/html/transaction.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/user/html/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/user/html/register.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/user/html/profile.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/user/html/cart.html'));
});

app.get('/product-detail.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/user/html/product-detail.html'));
});

// Products Route
app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/user/html/products.html'));
});

// Halaman utama user
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/user/html/index.html'));
});

// Server Startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `panel available at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`
  );
});
