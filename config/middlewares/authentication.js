require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = mongoose.model('User');

module.exports = (req, res, next) => {
  const token = req.header('authorization');
  if (!token) {
    return res.status(401).json('Unauthorized: No token provided');
  }
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(400).json('This token is invalid');
    }
    User.findById(decoded.id)
      .then((user) => {
        if (!user) {
          return Promise.reject('User with this token not found');
        }
        req.user = decoded;
        return next();
      })
      .catch(err => res.status(404).json(err));
  });
};