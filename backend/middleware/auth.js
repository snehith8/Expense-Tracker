const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer'))
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized to access this route' });

  try {
    const decoded = jwt.verify(
      authHeader.split(' ')[1],
      process.env.JWT_SECRET || 'fallback_secret',
    );

    req.user = await User.findById(decoded.id);

    if (!req.user)
      return res
        .status(401)
        .json({ success: false, message: 'User not found' });

    next();
  } catch {
    res
      .status(401)
      .json({ success: false, message: 'Token is invalid or expired' });
  }
};

module.exports = { protect };
