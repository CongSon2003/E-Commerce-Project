const express = require('express');
const controllersProduct = require('../controllers/product');
const { verify_AccessToken, isAdmin } = require('../middlewares/verifyToken');
const router = express.Router();

router.post('/createProduct', [verify_AccessToken, isAdmin], controllersProduct.createProduct)
router.get('/getOneProduct/:productId', controllersProduct.getOneProduct);
router.get('/getAllProduct', controllersProduct.getAllProduct);
router.put('/updateProduct/:productId', [verify_AccessToken, isAdmin], controllersProduct.updateProduct);
router.delete('/deleteProduct/:productId', [verify_AccessToken, isAdmin], controllersProduct.deleteProduct)
module.exports = router;