const express = require('express');
const router = express.Router()

const { productTest } = require('../controllers/productController')


router.route("/producttest").get(productTest)

module.exports = router;