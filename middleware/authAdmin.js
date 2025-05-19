const jwt = require('jsonwebtoken');

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  // Perbaikan: ganti docode -> decoded
  jwt.verify(token, process.env.ADMIN_JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Error verifikasi token:', err.message);
      return res.status(403).json({ message: 'Token tidak valid' });
    }
    console.log('Decoded token:', decoded);
    req.adminId = decoded.adminId; // Gunakan decoded bukan docode
    next();
  });
}

module.exports = { authenticateAdmin };
