const express = require('express')
require('dotenv').config();

const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

// For Swagger Documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Regular Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies and File middleware
app.use(cookieParser());
app.use(fileUpload(
    {
        useTempFiles: true,
        tempFileDir: '/tmp/'
    }
));

// Morgan Middleware
app.use(morgan("tiny"));

// to use ejs
app.set('view engine', 'ejs');

// import all routes
const home = require('./routes/home')
const user = require('./routes/user')
const product = require('./routes/product')
const payment = require('./routes/payment')

// router middleware
app.use("/api/v1", home)
app.use("/api/v1", user)
app.use("/api/v1", product)
app.use("/api/v1", payment)

app.get("/signuptest", (req, res) => {
    res.render("signuptest")
})

module.exports = app;