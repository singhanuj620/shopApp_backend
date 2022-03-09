const BigPromise = require('../middlewares/bigPromise');
const Product = require('../models/product');
const CustomError = require("../utils/customError")
const cloudinary = require('cloudinary');
const WhereClause = require('../utils/whereClause');

exports.productTest = BigPromise((req, res) => {
    res.status(200).json({
        success: true,
        greeting: "Hello from API"
    })
})

exports.addProduct = BigPromise(
    async (req, res) => {
        // images
        let imageArray = [];

        if (!req.files) {
            return next(new CustomError('Please upload an image', 401))
        }

        if (req.files) {
            for (let i = 0; i < req.files.length; i++) {
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
        const products = new WhereClause(Product.find(), req.query).search().filter();

        const filteredProductsNumber = products.length;

        products.pager(resultPerPage)
        products = await products.base;

        res.status(200).json({
            success: true,
            products,
            filteredProductsNumber,
            totalCountProduct
        })
    })