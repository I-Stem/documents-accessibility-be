const user_notification = require('../models/user-notification.model')

const nodemailer = require('nodemailer');

exports.sendEmail = async (recipient, subject, message, html = '') => {
    const from = process.env.EMAIL_FROM;
    const transportOptions = {
        host: process.env.EMAIL_SMTP,
        port: process.env.EMAIL_SMTP_PORT,
        auth: {
            user: process.env.EMAIL_SMTP_USER,
            pass: process.env.EMAIL_SMTP_PASS
        }
    };
    console.log(html)

    const transporter = nodemailer.createTransport(transportOptions);
    if(html.length) {
        await transporter.sendMail({
            from: from,
            to: recipient,
            subject: subject,
            html: html
        });
    }
    else {
        await transporter.sendMail({
            from: from,
            bcc: recipient,
            subject: subject,
            text: message
        });
    }
    console.log("email sent to:", recipient)
}