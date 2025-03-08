const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("express-async-handler");
const servicesUser = require('../services/user')

const register = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email, password, firstname, lastname } = req.body;
  if (!email || !password || !firstname || !lastname) {
    return res.status(400).json({
      sucess: false,
      message: "Missing inputs!",
    });
  }
  const response = await servicesUser.register(req.body);
  return res.status(StatusCodes.CREATED).json(response)
});

module.exports = { register };
