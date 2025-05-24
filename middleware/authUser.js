const jwt = require('jsonwebtoken');

function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Received token:', token);

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({
      code: 'NO_TOKEN',
      message: 'Token tidak ditemukan dalam header Authorization',
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err.message);
      return res.status(403).json({
        code: 'INVALID_TOKEN',
        message: 'Token tidak valid atau sudah kadaluarsa',
      });
    }

    console.log('Decoded user:', user);
    req.user = {
      id: user.userId,
    };
    req.userId = user.userId;
    next();
  });
}

module.exports = { authenticateUser };
