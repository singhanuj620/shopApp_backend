const BigPromise = require('../middlewares/bigPromise');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.sendStripeKey = BigPromise(
    async (req, res, next) => {
        res.status(200).json({
            success: true,
            stripekey: process.env.STRIPE_API_KEY
        })
    }
)

exports.captureStripPayment = BigPromise(
    async (req, res, next) => {

        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: 'inr',


            metadata: { integration_check: 'accept_a_payment' }
        });

        res.status(200).json({
            success: true,
            client_secret: paymentIntent.client_secret
        });

    }
)