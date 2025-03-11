const { StatusCodes } = require('http-status-codes');
const Product = require('../models/product');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

// Tạo mới sản phẩm
const createProduct = asyncHandler(async (req, res) => {
  const { title, description, brand, price, quantity } = req.body;
  if ((Object.keys(req.body).length === 0) && (!title)) throw new Error('Missing inputs');
  const slug = slugify(title, { locale : 'vi', lower : true })
  const dataCreate = {
    title, description, brand, price, quantity, slug
  }
  console.log(dataCreate);
  const response = await Product.create(dataCreate);
  return res.status(response ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR).json({
    success : response ? true : false,
    response : response ? response : null
  })
})

// Nấy 1 sản phẩm (getOneProduct)
const getOneProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById({_id : productId});
  return res.status(product ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR).json({
    success : product ? true : false,
    message : product ? 'getOneProduct successfully' : 'getOneProduct failed',
    response : product ? product : null
  })
})

// Nấy tất cả sản phẩm trong db
const getAllProduct = asyncHandler(async (req, res) => {
  const productAll = await Product.find();
  return res.status(productAll ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR).json({
    success : productAll ? true : false,
    message : productAll ? 'getAllProduct successfully' : 'getAllProduct failed',
    count : productAll ? Object.keys(productAll).length : 0,
    response : productAll ? productAll : null
  })
})

// Cập nhật một sản phẩm (product) trong db
const updateProduct = asyncHandler( async (req, res) => {
  const { productId } = req.params;
  if (Object.keys(req.body).length === 0 || !productId) throw new Error('Missing inputs');
  // Nếu title được cập nhật thì slug cũng được cập nhật theo title
  if (req.body.title) {
    req.body.slug = slugify(req.body.title, { locale : 'vi' })
  }
  // Tìm product và update
  const response = await Product.findByIdAndUpdate({ _id : productId }, req.body, { new : true });
  return res.status(response ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR).json({
    success : response ? true : false ,
    message : response ? 'Product has been updated successfully!' : 'Update failed!',
    response : response ? response : null
  })
})

// Xóa một sản phẩm (product) trong db
const deleteProduct = asyncHandler( async (req, res) => {
  const { productId } = req.params;
  if (!productId) throw new Error('Missing inputs');
  // Tìm product và xóa
  const response = await Product.findByIdAndDelete({ _id : productId });
  return res.status(response ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR).json({
    success : response ? true : false ,
    message : response ? 'Product has been deleted successfully!' : 'Delete failed!',
    response : response ? response : null
  })
})
module.exports = { createProduct, getOneProduct, getAllProduct, updateProduct, deleteProduct }