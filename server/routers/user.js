const controllerUser = require("../controllers/user");
const { verify_AccessToken, isAdmin } = require('../middlewares/verifyToken');
const express = require("express");
const router = express.Router();

router.post("/register", controllerUser.register);
router.post("/login", controllerUser.login);
router.get("/getOne", verify_AccessToken, controllerUser.getOneUser);
router.post("/refreshToken", controllerUser.refreshAccessToken);
router.post("/logout", verify_AccessToken, controllerUser.logout);
router.get('/forgotPassword', controllerUser.forgotPassword);
router.put('/resetPassword', controllerUser.resetPassword);
router.get('/getUsers', [verify_AccessToken, isAdmin], controllerUser.getUsers );
router.delete('/deleteUser', [verify_AccessToken, isAdmin], controllerUser.deleteUser);
router.put('/updateUser', verify_AccessToken, controllerUser.updateUser);
router.put('/updateUserByAdmin/:_id', [verify_AccessToken, isAdmin], controllerUser.updateUserByAdmin);
module.exports = router;
