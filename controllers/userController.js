const User = require('../models/user')
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError")
const cookieToken = require("../utils/cookieToken")
const fileUpload = require("express-fileupload");
const cloudinary = require('cloudinary');
const emailHelper = require("../utils/emailHelper");
const crypto = require('crypto')

exports.signup = BigPromise(
    async (req, res, next) => {
        let result;
        // handle image
        if (req.files) {
            let file = req.files.photo
            result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                folder: "users",
                width: 150,
                crop: "scale"
            })
        }

        const { name, email, password } = req.body;

        if (!email || !name || !password) {
            return next(new CustomError('Please provide all information', 400));
        }

        const user = await User.create({
            name,
            email,
            password,
            photo: {
                id: result.public_id,
                secure_url: result.secure_url
            }
        });

        cookieToken(user, res)
    }
);

exports.login = BigPromise(
    async (req, res, next) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new CustomError('Please provide all information', 400));
        }

        const user = await User.findOne({ email: email }).select('+password')
        if (!user) {
            return next(new CustomError('User not found', 404))
        }
        const isMatch = await user.isValidatedPassword(password)
        if (!isMatch) {
            return next(new CustomError('Incorrect password', 401))
        }
        cookieToken(user, res)
    }
)

exports.logout = BigPromise(
    async (req, res, next) => {
        res.cookie('token', null, { expires: new Date(Date.now()), httpOnly: true })
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        })
    }
)

exports.forgotPassword = BigPromise(
    async (req, res, next) => {
        const { email } = req.body;
        const user = await User.findOne({ email: email })

        if (!user) {
            return next(new CustomError('User not found', 404))
        }

        const forgotToken = user.getForgotPasswordToken();
        // saving coz in db function it's not polulating value but not saving
        await user.save({ validateBeforeSave: false })

        const myUrl = `${req.protocol}://${req.get('host')}/password/reset/${forgotToken}`
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: ${myUrl}`
        try {
            await emailHelper({
                email: user.email,
                subject: 'Password reset',
                message
            });
            res.status(200).json({
                success: true,
                message: 'Email sent'
            })
        }
        catch (error) {
            user.forgotPasswordToken = undefined;
            user.forgotPasswordExpiry = undefined;
            await user.save({ validateBeforeSave: false })
            return next(new CustomError('Something went wrong while reset password', 500))
        }
    }
);

exports.passwordReset = BigPromise(
    async (req, res, next) => {
        const token = req.params.token;
        const encryToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({ forgotPasswordToken: encryToken })

        if (!user) {
            return next(new CustomError('User not found', 404))
        }

        if (user.forgotPasswordExpiry < Date.now()) {
            return next(new CustomError('Token expired', 400))
        }

        if (req.body.password !== req.body.confirmPassword) {
            return next(new CustomError('Password and confirm password must be same', 400))
        }

        user.password = req.body.password
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        })

    }
);

