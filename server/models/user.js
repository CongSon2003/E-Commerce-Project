const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    firstname:{
      type:String,
      required : true,
    },
    lastname :{
      type : String,
      required : true
    },
    email:{
      type:String,
      required:true,
      unique:true,
    },
    mobile:{
      type:String,
      required:true,
      unique:true,
    },
    password:{
      type:String,
      required:true,
    },
    cart : {
      type : Array,
      default : []
    },
    address : [
      {
        type : mongoose.Types.ObjectId,
        ref : 'Address'
      }
    ],
    wishlist : [
      {
        type : mongoose.Types.ObjectId,
        ref : 'Product'
      }
    ],
    isBlocked : {
      type : Boolean,
      default : false
    },
    refreshToken : {
      type : String
    },
    passwordChangeAt : {
      type : String
    },
    passwordResetToken : {
      type : String
    },
    passwordResetExpires : {
      type : String
    },
    role : {
      type : String,
      default : 'user'
    }
}, {
  timestamps :  true
});

// Middleware để hash password trước khi lưu
userSchema.pre('save', async function(next) {
  // Kiểm tra xem mật khẩu đã được thay đổi hay chưa
  if (!this.isModified('password')) {
    next()
  }
  try {
    const salt = bcrypt.genSaltSync(10)
    this.password = await bcrypt.hash(this.password, salt)
  } catch (error) {
    next(error)
  }
})

//Export the model
module.exports = mongoose.model('User', userSchema);