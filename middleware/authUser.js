const jwt = require('jsonwebtoken');

function authenticateUser(req, res, next) {
  const token =
    req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.userId = user.userId; // Simpan userId di request
    next();
  });
}

module.exports = { authenticateUser };
