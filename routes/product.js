const express = require('express');
const router = express.Router()

const { productTest, addProduct, getAllProduct } = require('../controllers/productController')

const { isLoggedIn, customRole } = require('../middlewares/user')


router.route("/producttest").get(productTest)

// user route
router.route("/products").get(getAllProduct)

// admin route
router.route("/admin/product/add").get(isLoggedIn, customRole("admin"), addProduct)

module.exports = router;