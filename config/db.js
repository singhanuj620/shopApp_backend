const mongoose = require('mongoose')

const connectWithDb = () => {
    mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(console.log("DB Connected"))
        .catch(
            err => {
                console.log("DB Connection Error", err)
                process.exit(1)
            }
        )
}

module.exports = connectWithDb