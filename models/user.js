const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxLength: [40, 'Name must be less than 40 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide a email'],
        validate: [validator.isEmail, 'Please provide a valid email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [4, 'Password must be at least 4 characters'],
        select: false
    },
    role: {
        type: String,
        default: 'user'
    },
    photo: {
        id: {
            type: String,
            // required: [true, 'Please provide a photo id'],
        },
        secure_url: {
            type: String,
            // required: [true, 'Please provide a secure_url'],
        },
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: String,
        default: Date.now
    }
});

// encrypt password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
});

// valodate the password with passed on user password
userSchema.methods.isValidatedPassword = async function (usersendpassword) {
    return await bcrypt.compare(usersendpassword, this.password)
}

// create and return jwt token
userSchema.methods.getJwtToken = async function () {
    return await jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    });
}

// generate forgot password token/string
userSchema.methods.getForgotPasswordToken = function () {
    // generate long random string
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

    return resetToken;
}

module.exports = mongoose.model('User', userSchema)

