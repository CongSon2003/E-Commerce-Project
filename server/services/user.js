const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const register = (body) =>
  new Promise(async (resolve, reject) => {
    try {
      const result = await User.create(body);
      if (!result) {
        reject({
          success: false,
          message: "User creation failed",
          response: null,
        });
      } else {
        resolve({
          success: true,
          message: "Created success user",
          response: result,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
module.exports = { register };
