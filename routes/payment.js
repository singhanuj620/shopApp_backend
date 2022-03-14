const express = require('express');
const router = express.Router()
const { isLoggedIn, customRole } = require('../middlewares/user')
const {
    sendStripeKey,
    sendRazorpayKey,
    captureStripePayment,
    captureRazorPayPayment
} = require('../controllers/paymentController')

router.route("/stripekey").get(isLoggedIn, sendStripeKey);
router.route("/razorpaykey").get(isLoggedIn, sendRazorpayKey);

router.route("/capturestripe").post(isLoggedIn, captureStripePayment);
router.route("/capturerazorpay").post(isLoggedIn, captureRazorPayPayment);

module.exports = router;