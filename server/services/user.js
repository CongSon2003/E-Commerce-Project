const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt');
const sendMail = require('../ultils/sendMail')
const bcrypt = require('bcrypt');
const crypto = require('crypto')
const register = (body) => new Promise(async (resolve, reject) => {
  try {
    const result = await User.create(body);
    resolve({
      success: result ? true : false,
      message: result ? "User created successfully" : "User created failed",
      response: result ? result : null,
    });
  } catch (error) {
    reject(error);
  }
});

const login = (body) => new Promise (async (resolve, reject) => {
  try {
    const { email, password } = body;
    // Tìm user bằng email
    const user = await findUserByData({email});
    // Kiểm tra user tồn tại trong db và compare password đúng 
    const isCorrectPassword = user && bcrypt.compareSync(password, user.password);
    // Tạo accessToken
    const access_Token = isCorrectPassword && generateAccessToken(user._id, user.role);
    // Tạo refreshToken  
    const refreshToken = access_Token && generateRefreshToken(user._id);
    // Lưu refreshToken vào db
    const newUser = refreshToken && await User.findByIdAndUpdate({_id : user._id}, {refreshToken : refreshToken}, {new : true})
    // Clone đối tượng gốc và xóa thuộc tính password, refreshToken
    const newData = newUser ? (JSON.parse(JSON.stringify(newUser))) : null
    newData && delete newData.password
    resolve({
      success : isCorrectPassword ? true : false,
      accessToken : isCorrectPassword ? access_Token : null,
      message : isCorrectPassword ? "Login successfully" : "Login failed",
      response : isCorrectPassword ? newData : null
    })
  } catch (error) {
    reject(error)
  }
})
const findUserByData = asyncHandler(async (data) => {
  const result = await User.findOne(data).select(`-refreshToken`);
  return result;
});

const logout = (data) => new Promise(async (resolve, reject)=> {
  try {
    // Xóa refresh token trong db sau khi đăng xuất
    const deleteRefreshToke_User = await User.findOneAndUpdate(data, {refreshToken : ''}, {new : true})
    console.log(deleteRefreshToke_User);
    resolve({
      success : deleteRefreshToke_User ? true : false,
      message : deleteRefreshToke_User ? 'Đăng xuất thành công' : 'Đăng xuất thất bại',
      response : deleteRefreshToke_User ? deleteRefreshToke_User : null  
    })
  } catch (error) {
    reject(error)
  }
})

// Hàm này được gọi khi người dùng quên mật khẩu và gửi email để resetPassword
const forgotPassword = (email) => new Promise(async (resolve, reject) => {
  try {
    // Tìm user theo email
    const user = await findUserByData({email})
    // Kiểm tra, nếu không có user thuộc email này thì return 
    if (!user) throw new Error('User not found')
    // Gọi fuc tạo token, và lưu token đó vào trong db
    const resetToken = user.createTokenPasswordChanged()
    await user.save()

    // Gửi mail
    const html = `Xin vui lòng click để thay đổi password. Link sẽ hết hạn sau 15 phút. <a href = ${process.env.URL_CLIENT}/api/user/reset-password/${resetToken}>Click here</a>`
    const response = await sendMail({email, html})
    resolve({
      success : true,
      response
    })
  } catch (error) {
    reject(error)
  }
})

// Hàm này được gọi khi người dùng click vào link email để thay đổi password
const resetPassword = (token, password) => new Promise(async (resolve, reject) => {
  try {
    // Giải mã token mã client gửi đến server, kiểm tra xem token có trùng với passwordResetToken trong db không
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await findUserByData({passwordResetToken, passwordResetExpires : {$gt : Date.now()}});
    if (!user) {
      throw new Error('Token expired or invalid token')
    }
    // update password mới trong db
    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.passwordChangeAt = Date.now()
    user.save()

    resolve({
      success : user ? true : false,
      message : user ? 'Thay đổi mật khẩu thành công' : 'Thay đổi mật khẩu thất bại',
      response : user ? user : null
    })
  } catch (error) {
    reject(error)
  }
})

// Nấy tất cả Users trong db : Chỉ dành cho admin
const getUsers = () => new Promise(async (resolve, reject) => {
  try {
    const response = await User.find().select('-password -refreshToken');
    resolve({
      success : response ? true : false,
      message : response ? 'getUsers successfully' : 'getUsers failed',
      response
    })
  } catch (error) {
    reject(error)
  }
})

// Xoá user
const deleteUser = (_id) => new Promise(async (resolve, reject) => {
  try {
    const response = await User.findByIdAndDelete(_id);
    resolve({
      success : response ? true : false,
      message : response ? 'Delete user successfully' : 'Delete user failed',
      response
    })
  } catch (error) {
    reject(error)
  }
})

// Update user 
const updateUser = (_id, body) => new Promise(async (resolve, reject) => {
  try {
    const response = await User.findByIdAndUpdate(_id, body, { new : true }).select('-password -refreshToken')
    resolve({
      success : response ? true : false,
      message : response ? 'Update user successfully' : 'Update user failed',
      response
    })
  } catch (error) {
    reject(error)
  }
})

// Update user by admin : chỉnh sử user chỉ dành cho admin
const updateUserByAdmin = (_id, body) => new Promise(async (resolve, reject) => {
  try {
    const response = await User.findByIdAndUpdate(_id, body, { new : true }).select('-password -refreshToken')
    resolve({
      success : response ? true : false,
      message : response ? 'Update user successfully' : 'Update user failed',
      response
    })
  } catch (error) {
    reject(error)
  }
})
module.exports = { register, login, logout, deleteUser, updateUser, updateUserByAdmin, forgotPassword, resetPassword, findUserByData, getUsers };
