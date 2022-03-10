const express = require('express');
const router = express.Router()

const {
    productTest,
    addProduct,
    getAllProduct,
    adminGetAllProduct,
    getOneProduct,
    adminUpdateOneProduct,
    adminDeleteOneProduct,
    addReview,
    deleteReview,
    getOnlyReviewsForOneProduct
} = require('../controllers/productController')

const { isLoggedIn, customRole } = require('../middlewares/user')


router.route("/producttest").get(productTest)

// user route
router.route("/products").get(getAllProduct)
router.route("/product/:id").post(getOneProduct)
router.route("/review")
    .put(isLoggedIn, addReview)
    .delete(isLoggedIn, deleteReview);
router.route("/reviews").get(getOnlyReviewsForOneProduct);


// admin route
router.route("/admin/products").get(isLoggedIn, customRole("admin"), adminGetAllProduct)
router.route("/admin/product/add").post(isLoggedIn, customRole("admin"), addProduct)
router.route("/admin/product/:id")
    .put(isLoggedIn, customRole("admin"), adminUpdateOneProduct)
    .delete(isLoggedIn, customRole("admin"), adminDeleteOneProduct)

module.exports = router;