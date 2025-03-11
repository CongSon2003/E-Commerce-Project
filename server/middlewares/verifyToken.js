const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// Kiểm tra token
const verify_AccessToken = asyncHandler((req, res, next) => {
  // Tách Bearer 
  const accessToken = req.headers.authorization?.split(' ')[1];
  if (!accessToken) {
    return res.status(StatusCodes.BAD_REQUEST).json({success : false, message : 'Missing access token'})
  }else {
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({success : false, message : 'Access token exprired'})
      }
      req.user = decode;
      next();
    })
  }
})

const isAdmin = asyncHandler((req, res, next) => {
  const { role } = req.user;
  if (role !== 'admin') {
    return res.status(201).json({
      success : false,
      message : 'REQUIRE ADMIN ROLE'
    })
  }
  next();
})
module.exports = { verify_AccessToken, isAdmin }