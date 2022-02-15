const User = require('../models/user')
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError")
const cookieToken = require("../utils/cookieToken")
const fileUpload = require("express-fileupload");
const cloudinary = require('cloudinary');

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