const controllerUser = require("../controllers/user");
const express = require("express");
const router = express.Router();

router.post("/register", controllerUser.register);

module.exports = router;
