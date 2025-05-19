const jwt = require('jsonwebtoken');

function authenticateAdmin(req, res, next) {
  const token =
    req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.ADMIN_JWT_SECRET, (err, admin) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.adminId = admin.adminId; // Simpan adminId di request
    next();
  });
}

module.exports = { authenticateAdmin };
