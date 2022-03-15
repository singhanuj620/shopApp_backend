const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [120, 'Product name must be less than 120 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide price'],
        maxlength: [6, 'Product name must be less than 6 digits'],
    },
    description: {
        type: String,
        required: [true, 'Please provide description']
    },
    photos: [
        {
            id: {
                type: String,
                required: [true, 'Please provide a photo id'],
            },
            secure_url: {
                type: String,
                required: [true, 'Please provide a secure_url'],
            },
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select category from the list : shortsleeves, longsleeves, sweatshirt, hoodies'],
        enum: {
            values: ['shortsleeves', 'longsleeves', 'sweatshirt', 'hoodies'],
            message: 'Please select category from the list : shortsleeves, longsleeves, sweatshirt, hoodies'
        }
    },
    stock: {
        type: Number,
        required: [true, 'Please provide stock'],
    },
    brand: {
        type: String,
        required: [true, 'Please select brand from the list : adidas, nike, puma, reebok, jordan'],
        enum: {
            values: ['adidas', 'nike', 'puma', 'reebok', 'jordan'],
            message: 'Please select brand from the list : adidas, nike, puma, reebok, jordan'
        }
    },
    ratings: {
        type: Number,
        default: 0
    },
    numberOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('Product', productSchema);