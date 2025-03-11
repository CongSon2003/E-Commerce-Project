const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const servicesUser = require('../services/user');
const { generateAccessToken } = require("../middlewares/jwt");
const crypto = require('crypto');
// register : Đắng ký một tài khoảng user mới
const register = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email, password, firstname, lastname } = req.body;
  if (!email || !password || !firstname || !lastname) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Missing inputs!',
      response : null
    });
  }
  // Tìm người dùng bằng email
  const user = await servicesUser.findUserByData({email});
  if (user) throw new Error('Email has been registered');
  const response = await servicesUser.register(req.body);
  return res.status(StatusCodes.CREATED).json(response)
});

// login : Đăng nhập một tài khoản user đã tồn tại 
const login = asyncHandler(async (req, res) => {
  console.log("body : ", req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success : false,
      message : 'Missing inputs',
      response : null
    })
  }
  const response = await servicesUser.login(req.body);
  if (response.success) {
    // Lưu refreshToken vào cookie
    res.cookie('refreshToken', response.response.refreshToken, { 
      httpOnly : true, // Ngăn không cho cookie bị truy cập qua Javascript
      maxAge : 6 * 24 * 60 * 60 * 1000 // Thời gian sống của cookie là 6 ngày
    }) 
  }
  res.status(StatusCodes.OK).json(response)
})

// Get one user current 
const getOneUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const response = await servicesUser.findUserByData({_id});

  // Xoá password trước khi gửi về client
  const newData = response ? JSON.parse(JSON.stringify(response)) : null
  delete newData.password
  return res.status(response ? StatusCodes.OK : StatusCodes.BAD_REQUEST).json({
    success : response ? true : false,
    message : response ? 'GetOneUser successfully' : 'GetOnUser failed',
    response : response ? newData : null
  })
})

// refresh token :
const refreshAccessToken = asyncHandler(async (req, res) => {
  // Lấy token từ cookies
  const cookie = req.cookies
  // Kiểm tra cookies có không
  if (!cookie && !cookie.refreshToken) {
    throw new Error('No refresh token in cookie')
  }
  jwt.verify(cookie.refreshToken, process.env.JWT_SECRET, async (err, decode) => {
    if(err) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success : false,
        message : 'Refresh token exprired'
      })
    }
    // Tìm user sau khi kiểm tra refresh token
    const response = await servicesUser.findUserByData({_id : decode._id, refreshToken : cookie.refreshToken})
    const newAccessToken = response ? generateAccessToken(response._id, response.role) : null
    return res.status(response ? StatusCodes.OK : StatusCodes.BAD_REQUEST).json({
      success : response ? true : false,
      message : response ? 'New Access Token has been created' : 'Refresh Token not matched',
      newAccessToken
    })
  })
})

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies
  if(!cookie || !cookie.refreshToken) {
    throw new Error('No refresh token in cookie')
  }
  const result = await servicesUser.logout({refreshToken : cookie.refreshToken});
  // Xóa refresh token trong cookie trình duyệt 
  res.clearCookie('refreshToken', { httpOnly : true, secure : true })
  res.status(StatusCodes.OK).json(result);
})

// Gửi mail
// Hàm này được gọi khi người dùng quên mật khẩu và gửi email để resetPassword
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) {
    throw new Error('Missing email')
  }
  const result = await servicesUser.forgotPassword(email);
  return res.status(200).json(result)
})

// Hàm này được gọi khi người dùng click vào link email để thay đổi password
const resetPassword = asyncHandler(async (req, res) => {
  const { password, token } = req.body;
  console.log(req.body);
  if (!password || !token) throw new Error("Missing inputs")
  const response = await servicesUser.resetPassword(token, password)
  return res.status(200).json(response)
})

// Nấy tất cả Users trong db : Chỉ dành cho admin
const getUsers = asyncHandler(async (req, res) => {
  const response = await servicesUser.getUsers();
  return res.status(response ? StatusCodes.OK : StatusCodes.BAD_REQUEST).json(response)
})

// Xoá user chỉ cho admin 
const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.body;
  if(!_id) throw new Error('Missing inputs')
    
  const result = await servicesUser.deleteUser({_id})
  return res.status(result.success ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR).json(result)
})

// update user
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  if (!_id || Object.keys(req.body).length === 0) throw new Error('Missing inputs')
  const response = await servicesUser.updateUser(_id, req.body);
  return res.status(response.success ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR).json(response)
})

// Update user by admin : chỉnh sử user chỉ dành cho admin
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
  const response = await servicesUser.updateUserByAdmin(_id, req.body);
  return res.status(response.success ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR).json(response)
})
module.exports = { register, login, refreshAccessToken, deleteUser, updateUser, updateUserByAdmin, logout, forgotPassword, resetPassword, getOneUser, getUsers };
