const nodemailer = require('nodemailer');

module.exports.sendEmail = async (req, res, next) => {
    const from = process.env.EMAIL_FROM;
    const transportOptions = {
        host: process.env.EMAIL_SMTP,
        port: process.env.EMAIL_SMTP_PORT,
        auth: {
            user: process.env.EMAIL_SMTP_USER,
            pass: process.env.EMAIL_SMTP_PASS
        }
    };
    let recipient = req.email;
    let subject = req.subject;
    let html = req.message;
    const transporter = nodemailer.createTransport(transportOptions);
    await transporter.sendMail({ 
        from: from, 
        to: recipient, 
        subject: subject, 
        html: html 
    });
}