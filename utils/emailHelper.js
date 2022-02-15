const nodemailer = require("nodemailer");

const emailHelper = async ({ email, subject, message }) => {
    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER, // generated ethereal user
            pass: process.env.MAIL_PASSWORD, // generated ethereal password
        },
    });
    const mailerMessage = {
        from: 'anuj@anujportfolio.herokuapp.com', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: message, // plain text body
    }

    // send mail with defined transport object
    await transporter.sendMail(mailerMessage);
}

module.exports = emailHelper;