const BigPromise = require('../middlewares/bigPromise');
const Product = require('../models/product');
const CustomError = require("../utils/customError")
const cloudinary = require('cloudinary');
const WhereClause = require('../utils/whereClause');
const { acceptsLanguages } = require('express/lib/request');

exports.productTest = BigPromise((req, res) => {
    res.status(200).json({
        success: true,
        greeting: "Hello from API"
    })
})

exports.addProduct = BigPromise(
    async (req, res, next) => {
        // images
        let imageArray = [];
        if (!req.files) {
            return next(new CustomError('Please upload an image', 401))
        }
        if (req.files) {
            for (let i = 0; i < req.files.photos.length; i++) {
                let element = req.files.photos[i]
                let result = await cloudinary.v2.uploader.upload(element.tempFilePath, {
                    folder: "products"
                })
                imageArray.push({
                    id: result.public_id,
                    secure_url: result.secure_url
                })
            }
        }
        req.body.photos = imageArray;
        req.body.user = req.user._id;

        const product = await Product.create(req.body);
        res.status(200).json({
            success: true,
            product
        });
    }
)

exports.getAllProduct = BigPromise(
    async (req, res, next) => {
        const resultPerPage = 6;
        const totalCountProduct = await Product.countDocuments();
        // .find() issleye bhej rahe kyuki pehle .find() chalega then usske result pr search chalega then usske result pr filter
        const productsObj = new WhereClause(Product.find(), req.query).search().filter();
        let products = await productsObj.base;
        const filteredProductsNumber = products.length;

        productsObj.pager(resultPerPage)
        products = await productsObj.base.clone();

        res.status(200).json({
            success: true,
            products,
            filteredProductsNumber,
            totalCountProduct
        })
    }
)

exports.adminGetAllProduct = BigPromise(
    async (req, res, next) => {
        const products = await Product.find();

        if (!products) {
            return next(new CustomError("No products found", 401))
        }

        res.status(200).json({
            success: true,
            products
        })
    }
)

exports.getOneProduct = BigPromise(
    async (req, res, next) => {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new CustomError("No product found", 401))
        }

        res.status(200).json({
            success: true,
            product
        })
    }
)

exports.addReview = BigPromise(
    async (req, res, next) => {
        const { rating, comment, productId } = req.body;

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment
        }

        let product = await Product.findById(productId);

        const AlreadyReview = product.reviews.find(review => review.user.toString() === req.user._id.toString());

        if (AlreadyReview) {
            product.reviews.forEach(review => {
                if (review.user.toString() === req.user._id.toString()) {
                    review.rating = Number(rating);
                    review.comment = comment;
                }
            })
        }
        else {
            product.reviews.push(review);
            product.numberOfReviews = product.reviews.length;
        }

        product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        await product.save({
            validateBeforeSave: false
        });

        res.status(200).json({
            success: true
        })
    }
)

exports.deleteReview = BigPromise(
    async (req, res, next) => {
        const { productId } = req.query;

        let product = await Product.findById(productId);

        const reviews = product.reviews.filter(review => review.user.toString() === req.user._id.toString());

        const numberOfReviews = reviews.length;
        product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        // update the product
        await Product.findByIdAndUpdate(productId, {
            reviews,
            ratings,
            numberOfReviews
        }, {
            new: true, runValidators: true, useFindAndModify: false
        })

        res.status(200).json({
            success: true
        })
    }
)

exports.getOnlyReviewsForOneProduct = BigPromise(
    async (req, res, next) => {
        const { productId } = req.query;

        let product = await Product.findById(productId);

        const reviews = product.reviews;

        res.status(200).json({
            success: true,
            reviews
        })
    }
)

exports.adminUpdateOneProduct = BigPromise(
    async (req, res, next) => {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new CustomError("No product found", 401))
        }

        let imageArray = [];

        if (req.files) {

            // destroy existing photos
            for (let i = 0; i < product.photos.length; i++) {
                await cloudinary.v2.uploader.destroy(product.photos[i].id)
            }

            // upload new photos
            for (let i = 0; i < req.files.photos.length; i++) {
                let element = req.files.photos[i]
                let result = await cloudinary.v2.uploader.upload(element.tempFilePath, {
                    folder: "products"
                })
                imageArray.push({
                    id: result.public_id,
                    secure_url: result.secure_url
                })
            }
            req.body.photos = imageArray;
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true, useFindAndModify: false
        });

        res.status(200).json({
            success: true,
            updatedProduct
        })
    }
)

exports.adminDeleteOneProduct = BigPromise(
    async (req, res, next) => {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new CustomError("No product found", 401))
        }

        for (let i = 0; i < product.photos.length; i++) {
            await cloudinary.v2.uploader.destroy(product.photos[i].id)
        }

        await product.remove();

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        })
    }
)